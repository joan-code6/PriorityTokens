import argparse
import json
import platform
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import torch
from datasets import DatasetDict, load_dataset
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    Trainer,
    TrainingArguments,
)


PRIORITY_TOKENS = [f"<<Priority{i}>>" for i in range(1, 11)] + ["<<PrioEnd>>"]
DEFAULT_TARGET_MODULES = [
    "q_proj",
    "k_proj",
    "v_proj",
    "o_proj",
    "gate_proj",
    "up_proj",
    "down_proj",
]


@dataclass
class SupervisedDataCollator:
    tokenizer: Any
    label_pad_token_id: int = -100

    def __call__(self, features: list[dict[str, Any]]) -> dict[str, torch.Tensor]:
        input_ids = [torch.tensor(feature["input_ids"], dtype=torch.long) for feature in features]
        labels = [torch.tensor(feature["labels"], dtype=torch.long) for feature in features]
        attention_mask = [torch.tensor(feature["attention_mask"], dtype=torch.long) for feature in features]

        input_ids = torch.nn.utils.rnn.pad_sequence(
            input_ids,
            batch_first=True,
            padding_value=self.tokenizer.pad_token_id,
        )
        labels = torch.nn.utils.rnn.pad_sequence(
            labels,
            batch_first=True,
            padding_value=self.label_pad_token_id,
        )
        attention_mask = torch.nn.utils.rnn.pad_sequence(
            attention_mask,
            batch_first=True,
            padding_value=0,
        )
        return {
            "input_ids": input_ids,
            "labels": labels,
            "attention_mask": attention_mask,
        }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train QLoRA on the priority token dataset.")
    parser.add_argument("--model-name", default="Qwen/Qwen3-8B")
    parser.add_argument("--dataset-path", default="Dataset_gen/dataset.jsonl")
    parser.add_argument("--output-dir", default="artifacts/qwen3-8b-prioritytokens")
    parser.add_argument("--max-seq-length", type=int, default=2048)
    parser.add_argument("--num-train-epochs", type=float, default=1.0)
    parser.add_argument("--max-steps", type=int, default=-1)
    parser.add_argument("--eval-size", type=float, default=0.02)
    parser.add_argument("--per-device-train-batch-size", type=int, default=1)
    parser.add_argument("--per-device-eval-batch-size", type=int, default=1)
    parser.add_argument("--gradient-accumulation-steps", type=int, default=16)
    parser.add_argument("--learning-rate", type=float, default=2e-4)
    parser.add_argument("--weight-decay", type=float, default=0.01)
    parser.add_argument("--warmup-ratio", type=float, default=0.03)
    parser.add_argument("--logging-steps", type=int, default=1)
    parser.add_argument("--eval-steps", type=int, default=25)
    parser.add_argument("--save-steps", type=int, default=25)
    parser.add_argument("--save-total-limit", type=int, default=2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--lora-r", type=int, default=16)
    parser.add_argument("--lora-alpha", type=int, default=32)
    parser.add_argument("--lora-dropout", type=float, default=0.05)
    parser.add_argument("--disable-4bit", action="store_true")
    parser.add_argument("--gradient-checkpointing", action="store_true", default=True)
    parser.add_argument("--no-gradient-checkpointing", dest="gradient_checkpointing", action="store_false")
    parser.add_argument("--train-on-full-sequence", action="store_true")
    return parser.parse_args()


def pick_compute_dtype() -> torch.dtype:
    if torch.cuda.is_available() and torch.cuda.is_bf16_supported():
        return torch.bfloat16
    return torch.float16


def build_quantization_config(args: argparse.Namespace) -> BitsAndBytesConfig | None:
    if args.disable_4bit:
        return None
    return BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=pick_compute_dtype(),
    )


def add_priority_tokens(tokenizer: Any, model: Any) -> int:
    existing_vocab = tokenizer.get_vocab()
    new_tokens = [token for token in PRIORITY_TOKENS if token not in existing_vocab]
    if not new_tokens:
        return 0

    added = tokenizer.add_special_tokens({"additional_special_tokens": new_tokens})
    if added <= 0:
        return 0

    model.resize_token_embeddings(len(tokenizer))

    reference_token_id = next(
        (
            token_id
            for token_id in (tokenizer.eos_token_id, tokenizer.unk_token_id, tokenizer.pad_token_id)
            if token_id is not None
        ),
        0,
    )
    input_embeddings = model.get_input_embeddings().weight.data
    output_embeddings = model.get_output_embeddings()
    output_weights = output_embeddings.weight.data if output_embeddings is not None else None

    for token in new_tokens:
        token_id = tokenizer.convert_tokens_to_ids(token)
        input_embeddings[token_id] = input_embeddings[reference_token_id].clone()
        if output_weights is not None:
            output_weights[token_id] = output_weights[reference_token_id].clone()

    return added


def format_chat(messages: list[dict[str, str]], tokenizer: Any, add_generation_prompt: bool) -> str:
    return tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=add_generation_prompt,
    )


def tokenize_example(
    sample: dict[str, Any],
    tokenizer: Any,
    max_seq_length: int,
    train_on_full_sequence: bool,
) -> dict[str, Any]:
    messages = sample["messages"]
    prompt_messages = messages[:-1]
    full_text = format_chat(messages, tokenizer, add_generation_prompt=False)
    prompt_text = format_chat(prompt_messages, tokenizer, add_generation_prompt=True)

    full_ids = tokenizer(full_text, add_special_tokens=False)["input_ids"]

    if train_on_full_sequence:
        input_ids = full_ids[-max_seq_length:]
        labels = input_ids.copy()
    else:
        prompt_ids = tokenizer(prompt_text, add_special_tokens=False)["input_ids"]
        assistant_ids = full_ids[len(prompt_ids):]
        assistant_len = len(assistant_ids)
        keep_prompt_len = max(0, max_seq_length - assistant_len)
        kept_prompt_ids = prompt_ids[-keep_prompt_len:] if keep_prompt_len else []
        input_ids = (kept_prompt_ids + assistant_ids)[-max_seq_length:]
        prompt_prefix_len = max(0, len(input_ids) - min(assistant_len, len(input_ids)))
        labels = [-100] * prompt_prefix_len + input_ids[prompt_prefix_len:]

    attention_mask = [1] * len(input_ids)

    return {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "labels": labels,
    }


def load_and_prepare_dataset(args: argparse.Namespace, tokenizer: Any) -> DatasetDict:
    dataset = load_dataset("json", data_files=args.dataset_path, split="train")
    if args.eval_size > 0 and len(dataset) > 10:
        split = dataset.train_test_split(test_size=args.eval_size, seed=args.seed)
        dataset_dict = DatasetDict(train=split["train"], eval=split["test"])
    else:
        dataset_dict = DatasetDict(train=dataset)

    def _tokenize(sample: dict[str, Any]) -> dict[str, Any]:
        return tokenize_example(
            sample=sample,
            tokenizer=tokenizer,
            max_seq_length=args.max_seq_length,
            train_on_full_sequence=args.train_on_full_sequence,
        )

    prepared = DatasetDict()
    for split_name, split_dataset in dataset_dict.items():
        prepared[split_name] = split_dataset.map(
            _tokenize,
            remove_columns=split_dataset.column_names,
            desc=f"Tokenizing {split_name}",
        )
    return prepared


def find_target_modules(model: Any) -> list[str]:
    module_names = set()
    for name, module in model.named_modules():
        if not isinstance(module, torch.nn.Linear):
            continue
        leaf_name = name.rsplit(".", maxsplit=1)[-1]
        if leaf_name in DEFAULT_TARGET_MODULES:
            module_names.add(leaf_name)
    return sorted(module_names) or DEFAULT_TARGET_MODULES


def load_model_and_tokenizer(args: argparse.Namespace) -> tuple[Any, Any]:
    tokenizer = AutoTokenizer.from_pretrained(args.model_name, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    quantization_config = build_quantization_config(args)
    model_kwargs: dict[str, Any] = {
        "trust_remote_code": True,
        "torch_dtype": pick_compute_dtype(),
    }
    if quantization_config is not None:
        model_kwargs["quantization_config"] = quantization_config
        model_kwargs["device_map"] = "auto"

    model = AutoModelForCausalLM.from_pretrained(args.model_name, **model_kwargs)
    model.config.use_cache = False

    added_tokens = add_priority_tokens(tokenizer, model)
    if added_tokens:
        print(f"Added {added_tokens} priority tokens.")

    if quantization_config is not None:
        model = prepare_model_for_kbit_training(
            model,
            use_gradient_checkpointing=args.gradient_checkpointing,
        )
    elif args.gradient_checkpointing:
        model.gradient_checkpointing_enable()

    target_modules = find_target_modules(model)
    print("LoRA target modules:", ", ".join(target_modules))
    lora_config = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=target_modules,
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    return model, tokenizer


def build_training_args(args: argparse.Namespace, has_eval: bool) -> TrainingArguments:
    compute_dtype = pick_compute_dtype()
    use_bf16 = compute_dtype == torch.bfloat16
    use_fp16 = compute_dtype == torch.float16
    if args.disable_4bit:
        optimizer = "adamw_torch"
    elif platform.system() == "Windows":
        optimizer = "adamw_torch"
    else:
        optimizer = "paged_adamw_8bit"

    return TrainingArguments(
        output_dir=args.output_dir,
        do_train=True,
        do_eval=has_eval,
        per_device_train_batch_size=args.per_device_train_batch_size,
        per_device_eval_batch_size=args.per_device_eval_batch_size,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        learning_rate=args.learning_rate,
        weight_decay=args.weight_decay,
        warmup_ratio=args.warmup_ratio,
        num_train_epochs=args.num_train_epochs,
        max_steps=args.max_steps,
        logging_steps=args.logging_steps,
        save_steps=args.save_steps,
        save_total_limit=args.save_total_limit,
        eval_steps=args.eval_steps if has_eval else None,
        eval_strategy="steps" if has_eval else "no",
        lr_scheduler_type="cosine",
        report_to="none",
        remove_unused_columns=False,
        dataloader_pin_memory=torch.cuda.is_available(),
        gradient_checkpointing=args.gradient_checkpointing,
        bf16=use_bf16,
        fp16=use_fp16 and not use_bf16,
        optim=optimizer,
        seed=args.seed,
    )


def summarize_dataset(path: str) -> dict[str, Any]:
    total = 0
    with Path(path).open("r", encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                total += 1
    return {"examples": total}


def main() -> int:
    args = parse_args()
    Path(args.output_dir).mkdir(parents=True, exist_ok=True)
    dataset_summary = summarize_dataset(args.dataset_path)
    print(json.dumps({"dataset": dataset_summary, "args": vars(args)}, indent=2))

    model, tokenizer = load_model_and_tokenizer(args)
    dataset = load_and_prepare_dataset(args, tokenizer)

    trainer = Trainer(
        model=model,
        args=build_training_args(args, has_eval="eval" in dataset),
        train_dataset=dataset["train"],
        eval_dataset=dataset.get("eval"),
        data_collator=SupervisedDataCollator(tokenizer=tokenizer),
    )
    trainer.train()
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    metrics = trainer.state.log_history[-1] if trainer.state.log_history else {}
    print(json.dumps({"output_dir": args.output_dir, "last_metrics": metrics}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
