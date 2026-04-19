# About Priority Tokens

## Summary

Priority Tokens is a research project that tests a simple idea:

> Let the user explicitly mark which parts of a long prompt matter more, then fine-tune a model to treat those marked spans as more important.

Instead of relying on prompt order, repetition, or careful restructuring, the user can wrap text in lightweight markup such as:

```text
<<Priority1>>Optional context<<PrioEnd>>
<<Priority5>>Important detail<<PrioEnd>>
<<Priority10>>Non-negotiable instruction<<PrioEnd>>
```

The model is then fine-tuned to learn that these tags represent relative importance.

## The Problem

Modern LLMs can ingest large contexts, but they do not reliably preserve the user's intended weighting of information inside that context. Critical instructions or facts that appear deep inside long documents often get ignored, diluted, or recalled unreliably. This is closely related to the "lost in the middle" problem.

Current workarounds are weak:

- Repeat important instructions multiple times.
- Move critical content to the beginning or end of the prompt.
- Remove useful context to keep prompts short.
- Handcraft prompt structure to force salience.

These approaches are fragile and do not give the user a direct, explicit control for importance.

## The Core Idea

Priority Tokens introduces a small markup language that encodes user intent about importance directly in the prompt.

- `<<Priority1>>` means low importance.
- `<<Priority5>>` means meaningful but not dominant importance.
- `<<Priority10>>` means highest importance.
- `<<PrioEnd>>` closes the marked span.

The project does not change transformer architecture. It changes model behavior through supervised fine-tuning so the model learns to:

- follow higher-priority instructions more reliably than lower-priority ones
- recall higher-priority facts more accurately from long contexts
- resolve conflicts in favor of higher-priority spans

This makes the idea deployable anywhere a fine-tuned model can already be used.

## What Success Looks Like

The project is not trying to prove a new model architecture. It is trying to prove a practical behavior change.

The main success criteria are:

- a fine-tuned model outperforms the base model on long-context recall tasks where critical facts are buried deep in the document
- a fine-tuned model prefers `Priority10` instructions over conflicting `Priority1` or `Priority5` instructions
- the behavior is measurable, reproducible, and achieved within a hobbyist budget

The north-star evaluation is a long document, roughly 6k tokens, where the answer depends on a `<<Priority10>>` fact buried around the middle of the context and surrounded by lower-priority noise. The fine-tuned model should recover that fact more reliably than the base model.

## Technical Approach

### Model strategy

- Base model: `Qwen/Qwen3-8B`
- Training method: QLoRA supervised fine-tuning
- Training scope: no full retraining, no architectural modification
- Tokenizer change: add 11 special tokens

The 11 tokens are:

- `<<Priority1>>` through `<<Priority10>>`
- `<<PrioEnd>>`

The tokenizer embeddings for the new tokens are initialized by copying an existing special token embedding rather than random initialization. That lowers the amount of data needed for the model to start using them coherently.

### Dataset strategy

The training set is synthetic and designed around the exact behaviors the project wants to teach:

- `contrastive` examples where swapping priority levels changes the correct answer
- `positive` examples where one high-priority fact must be recalled from a long document
- `adversarial` examples where a high-priority fact is surrounded by `Priority1` noise
- `instruction` examples where a `Priority10` instruction must override a `Priority5` instruction

This is meant to train behavior, not general knowledge.

### Why this route

Priority Tokens aims to be:

- cheap enough for a solo project
- understandable and reproducible
- compatible with standard fine-tuning workflows
- usable without inference-time access to internal attention logic

That makes it materially different from approaches that require modifying attention scores at inference time.

## Relation To Existing Work

The project overlaps with the same general problem space as methods such as GUIDE, which bias model attention during inference. Priority Tokens takes a different path:

- no inference-time attention intervention
- no requirement for special runtime access to the model internals
- behavior learned through SFT instead of injected at inference

If it works, it could be used through ordinary model serving setups and standard chat interfaces.

## Current Repository State

The repository already contains the main building blocks of a first experimental version:

- a project README and landing-page website that describe the concept
- a dataset generator in `Dataset_gen/generate_dataset.py`
- a generated dataset file at `Dataset_gen/dataset.jsonl`
- a QLoRA training entrypoint at `train_qlora.py`
- a smoke-training artifact under `artifacts/smoke-qwen3-8b/checkpoint-1`
- a website under `website/`

At the time of writing, the repository suggests that the project has moved beyond pure concept stage: dataset generation and at least an initial training smoke test already exist. What still needs to be proven is the full evaluation story, reproducibility, and the actual strength of the learned priority behavior.

## Scope For v1

Version 1 should stay deliberately narrow:

- focus on `Priority10` vs lower-priority behavior first
- prove measurable gains before expanding the full 1-10 gradient
- keep compute spend within roughly 150 EUR
- optimize for evidence, not polish

This is a research prototype first, not a general release product.

## Long-Term Potential

If the idea works, Priority Tokens could become:

- a prompt authoring convention for long-context workflows
- a training recipe for open models
- a user-facing feature in editors, agents, and retrieval systems
- a bridge between human emphasis and model attention behavior

The broader thesis is simple: users should be able to say not only what the model sees, but how strongly the model should treat different parts of what it sees.
