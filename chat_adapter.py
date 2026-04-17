import argparse
import threading
from pathlib import Path
from typing import Any

import torch
from peft import PeftConfig, PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Chat with a fine-tuned PriorityTokens adapter.")
    parser.add_argument("--model-name", default="Qwen/Qwen2.5-1.5B-Instruct")
    parser.add_argument("--adapter-path", default="artifacts/qwen25-1_5b-prioritytokens-test")
    parser.add_argument("--system-prompt", default="You are a helpful assistant.")
    parser.add_argument("--max-new-tokens", type=int, default=256)
    parser.add_argument("--temperature", type=float, default=0.7)
    parser.add_argument("--top-p", type=float, default=0.9)
    parser.add_argument("--repetition-penalty", type=float, default=1.05)
    parser.add_argument("--disable-4bit", action="store_true")
    parser.add_argument("--gui", action="store_true")
    return parser.parse_args()


def pick_compute_dtype() -> torch.dtype:
    if torch.cuda.is_available() and torch.cuda.is_bf16_supported():
        return torch.bfloat16
    return torch.float16


def build_quantization_config(disable_4bit: bool) -> BitsAndBytesConfig | None:
    if disable_4bit or not torch.cuda.is_available():
        return None
    return BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=pick_compute_dtype(),
    )


def load_tokenizer(adapter_path: Path, model_name: str) -> Any:
    if adapter_path.exists():
        tokenizer = AutoTokenizer.from_pretrained(str(adapter_path), trust_remote_code=True)
    else:
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "left"
    return tokenizer


def load_model(model_name: str, adapter_path: Path, tokenizer: Any, disable_4bit: bool) -> Any:
    if not adapter_path.exists():
        raise FileNotFoundError(f"Adapter path not found: {adapter_path}")

    quantization_config = build_quantization_config(disable_4bit)
    model_kwargs: dict[str, Any] = {
        "trust_remote_code": True,
        "dtype": pick_compute_dtype(),
    }
    if quantization_config is not None:
        model_kwargs["quantization_config"] = quantization_config
        model_kwargs["device_map"] = "auto"

    peft_config = PeftConfig.from_pretrained(str(adapter_path))
    base_model_name = peft_config.base_model_name_or_path or model_name
    base_model = AutoModelForCausalLM.from_pretrained(base_model_name, **model_kwargs)

    if base_model.get_input_embeddings().num_embeddings != len(tokenizer):
        base_model.resize_token_embeddings(len(tokenizer))

    model = PeftModel.from_pretrained(base_model, str(adapter_path))
    model.eval()
    return model


class ChatEngine:
    def __init__(self, model: Any, tokenizer: Any, args: argparse.Namespace):
        self.model = model
        self.tokenizer = tokenizer
        self.args = args
        self.messages: list[dict[str, str]] = []
        if args.system_prompt.strip():
            self.messages.append({"role": "system", "content": args.system_prompt.strip()})

    def reset(self) -> None:
        self.messages = []
        if self.args.system_prompt.strip():
            self.messages.append({"role": "system", "content": self.args.system_prompt.strip()})

    def reply(self, user_text: str) -> str:
        self.messages.append({"role": "user", "content": user_text})
        prompt = self.tokenizer.apply_chat_template(
            self.messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        device = next(self.model.parameters()).device
        inputs = self.tokenizer(prompt, return_tensors="pt").to(device)
        do_sample = self.args.temperature > 0

        generate_kwargs = {
            "max_new_tokens": self.args.max_new_tokens,
            "do_sample": do_sample,
            "top_p": self.args.top_p,
            "repetition_penalty": self.args.repetition_penalty,
            "pad_token_id": self.tokenizer.pad_token_id,
            "eos_token_id": self.tokenizer.eos_token_id,
        }
        if do_sample:
            generate_kwargs["temperature"] = self.args.temperature

        with torch.no_grad():
            outputs = self.model.generate(**inputs, **generate_kwargs)

        generated_ids = outputs[0][inputs["input_ids"].shape[-1] :]
        answer = self.tokenizer.decode(generated_ids, skip_special_tokens=True).strip()
        self.messages.append({"role": "assistant", "content": answer})
        return answer


def run_cli(engine: ChatEngine) -> int:
    print("Chat ready. Commands: /exit, /quit, /reset")
    while True:
        user_text = input("\nyou> ").strip()
        if not user_text:
            continue
        if user_text in {"/exit", "/quit"}:
            return 0
        if user_text == "/reset":
            engine.reset()
            print("history cleared")
            continue

        answer = engine.reply(user_text)
        print(f"bot> {answer}")


def run_gui(engine: ChatEngine) -> int:
    import tkinter as tk
    from tkinter import scrolledtext

    root = tk.Tk()
    root.title("PriorityTokens Chat")
    root.geometry("900x640")

    transcript = scrolledtext.ScrolledText(root, wrap=tk.WORD, state=tk.DISABLED)
    transcript.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    entry = tk.Entry(root)
    entry.pack(fill=tk.X, padx=10, pady=(0, 10))

    def append_line(text: str) -> None:
        transcript.configure(state=tk.NORMAL)
        transcript.insert(tk.END, text + "\n")
        transcript.configure(state=tk.DISABLED)
        transcript.see(tk.END)

    def run_model(user_text: str) -> None:
        try:
            answer = engine.reply(user_text)
        except Exception as exc:
            answer = f"[error] {exc}"
        root.after(0, lambda: append_line(f"bot> {answer}"))

    def on_send(_event: Any = None) -> None:
        user_text = entry.get().strip()
        if not user_text:
            return
        entry.delete(0, tk.END)
        if user_text in {"/exit", "/quit"}:
            root.destroy()
            return
        if user_text == "/reset":
            engine.reset()
            append_line("history cleared")
            return

        append_line(f"you> {user_text}")
        threading.Thread(target=run_model, args=(user_text,), daemon=True).start()

    entry.bind("<Return>", on_send)
    append_line("Chat ready. Commands: /exit, /quit, /reset")
    root.mainloop()
    return 0


def main() -> int:
    args = parse_args()
    adapter_path = Path(args.adapter_path)
    tokenizer = load_tokenizer(adapter_path=adapter_path, model_name=args.model_name)
    model = load_model(
        model_name=args.model_name,
        adapter_path=adapter_path,
        tokenizer=tokenizer,
        disable_4bit=args.disable_4bit,
    )
    engine = ChatEngine(model=model, tokenizer=tokenizer, args=args)
    if args.gui:
        return run_gui(engine)
    return run_cli(engine)


if __name__ == "__main__":
    raise SystemExit(main())
