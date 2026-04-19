
# I am actively working on replacing this AI Version with my own but it takes time!
## For more information see https://prioritytokens.arg-server.de/
[<img width="1920" height="967" alt="grafik" src="https://github.com/user-attachments/assets/25e393aa-f598-40f8-8c2a-a8341324f928" />
](https://prioritytokens.arg-server.de/)
# Priority Tokens — Concept & Execution Plan

## The Problem

Large language models struggle with long contexts. When you feed a model thousands
of tokens of information, it tends to treat all of it roughly equally — meaning
important instructions or facts buried deep in the context often get ignored or
underweighted. This is sometimes called the "lost in the middle" problem and it's
a well-documented limitation of current models.

Humans solve this naturally. We emphasize words by speaking louder, underlining,
repeating, or using phrases like "this is the most important part." Models don't
have an equivalent mechanism that the *user* can control.

---

## The Idea

Priority Tokens introduce a simple markup syntax that lets users explicitly signal
how much weight the model should give to a piece of text:

    <<Priority1>> ... <<PrioEnd>>    ← low importance
    <<Priority5>> ... <<PrioEnd>>    ← moderate importance
    <<Priority10>> ... <<PrioEnd>>   ← highest importance

The model is fine-tuned to recognize these tokens and adjust its behavior
accordingly — following high-priority instructions more strictly and recalling
high-priority content more accurately, even when it appears deep in a long context.

The goal is to give users a lightweight, expressive way to guide model attention
without changing the prompt structure or repeating themselves.

---

## What "Prioritize" Means Concretely

Two target behaviors drive the training:

- **Instruction following** — a `<<Priority10>>` instruction should be followed
  more reliably than a `<<Priority1>>` one, even if both are buried in a long doc
- **Recall accuracy** — facts or context wrapped in high-priority tokens should be
  retained and referenced more accurately in the model's output

These are learned behaviors, not architectural changes. The model is taught through
examples to respond differently to these tokens — similar to how instruction-tuned
models learned to follow `[INST]` tags.

---

## Technical Execution

**Model:** Qwen3-8B (open-source, well-documented, manageable size for hobbyist hardware)

**Method:** QLoRA supervised fine-tuning (4-bit quantized LoRA — makes training
feasible on a single rented GPU within budget)

**Tokenizer:** 11 new special tokens (`<<Priority1>>` through `<<Priority10>>` plus
`<<PrioEnd>>`) are added to the tokenizer. Their embedding vectors are initialized
by copying from an existing special token rather than random init, so the model
needs far less data to learn them.

**Dataset:** Synthetic training examples built around the core use case —
long documents with high-priority content buried at varying positions, paired with
outputs that correctly act on or recall that content. Includes contrastive pairs
where swapping priority levels changes the expected output.

**North star eval:** A document ~6k tokens long with a `<<Priority10>>` fact at
position ~3000, surrounded by `<<Priority1>>` noise. The model is asked a question
whose correct answer requires that buried fact. Fine-tuned model vs base model,
measured on how often each gets it right.

---

## Scope & Constraints

- Solo hobby project with a ~150 € compute budget
- Training on rented GPU (RunPod RTX 4090, ~0.75 €/hr)
- v1 focuses on Qwen3-8B only — larger models are a stretch goal
- v1 validates the binary case (Priority10 vs Priority1) before expanding to the
  full 1–10 gradient
- No full retraining from scratch — QLoRA fine-tuning only
- Success criterion: a measurable accuracy improvement on the north star eval,
  not a production-ready model

---

## Eval Suite (v1 freeze)

Frozen eval data now lives in `data/eval/`:
- `north_star.json`
- `priority_ordering.jsonl`
- `recall_set.jsonl`
- `regression_set.jsonl`

Eval scripts live in `eval/`:
- `north_star.py`
- `priority_ordering.py`
- `recall_accuracy.py`
- `regression.py`
- `run_all.py` (runs the full suite and writes one JSON artifact)

Run full suite:

```bash
python eval/run_all.py --model Qwen/Qwen3-8B --run-name baseline-qwen3-8b-v1
```

Default output:

`eval/results/baseline-qwen3-8b-v1.json`
