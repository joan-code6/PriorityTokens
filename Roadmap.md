# Priority Tokens Roadmap

## Purpose Of This Document

This roadmap is the execution source of truth for Priority Tokens.

If the repo changes, this file should change with it. Future agents working on the project are expected to update this roadmap whenever they materially change implementation status, deliverables, evaluation results, or next steps.

## Current Baseline

Based on the repository state on 2026-04-17:

- Concept documentation exists in `README.md` and the website.
- A dataset generator exists at `Dataset_gen/generate_dataset.py`.
- A generated dataset already exists at `Dataset_gen/dataset.jsonl`.
- A QLoRA training script exists at `train_qlora.py`.
- A smoke-training artifact exists at `artifacts/smoke-qwen3-8b/checkpoint-1`.
- The website now includes a startup popup explaining the limited demo scope to voters; broader progress copy is still stale relative to the codebase.

Observed repo facts:

- `Dataset_gen/dataset.jsonl` currently contains 1,500 examples.
- A quick structural pass shows no missing metadata and no document-length violations.
- The current dataset mix is `608 contrastive`, `519 positive`, `222 adversarial`, `151 instruction`.
- That does not exactly match the target mix from the dataset spec, so dataset reproducibility and plan alignment still need cleanup.
- Repository hygiene check completed: no tracked files exceed 50 MB; the largest tracked file is `Dataset_gen/dataset.jsonl` at ~38.9 MB.
- Git object store was compacted (`git gc --prune=now`), reducing loose-object/garbage overhead to zero and leaving a single ~11.9 MB pack.
- `.gitignore` now explicitly guards common local bloat sources (`artifacts/`, virtualenvs, Python cache files, model checkpoint formats, and `node_modules/`).
- `train_qlora.py` now uses a Windows-safe optimizer fallback (`adamw_torch`) because `paged_adamw_8bit` crashes with bitsandbytes initialization errors on the local Win11 + RTX 4060 setup.
- `chat_adapter.py` now provides local inference with the trained adapter through both CLI chat and an optional Tk GUI mode.
- `chat_adapter.py` now resizes base embeddings to the adapter tokenizer vocab before loading PEFT weights, fixing the local size-mismatch crash for the trained Qwen2.5-1.5B adapter.

## North-Star Goal

Train a `Qwen/Qwen3-8B` QLoRA adapter that measurably improves long-context priority handling over the base model, especially when critical facts or instructions are buried deep inside long documents and surrounded by lower-priority content.

## Success Criteria For v1

v1 is complete only when all of the following are true:

1. The tokenizer consistently supports the 11 priority tokens.
2. The dataset generation process is reproducible and validated.
3. A full training run completes on the intended hardware budget.
4. A base-vs-fine-tuned evaluation exists and shows measurable improvement on priority-sensitive tasks.
5. The repository contains enough documentation that another person can reproduce the dataset, training, and evaluation flow.

## Execution Principles

- Keep the first proof narrow and measurable.
- Prefer reproducibility over premature scaling.
- Treat evaluation as a deliverable, not an afterthought.
- Do not claim success from smoke checkpoints alone.
- Update this roadmap whenever actual progress changes.

## Phase 0: Documentation Recovery

### Goal

Recover the missing project narrative and align repo documentation with the real state of the code.

### Status

In progress.

### Deliverables

- `About.md` explaining the project clearly.
- `Roadmap.md` describing execution status and next steps.
- `AGENTS.md` instructions telling future agents to keep this roadmap current.
- eventual alignment pass for `website/src/components/Progress.jsx` and any other stale copy

### Acceptance criteria

- A new contributor can understand the project without relying on lost external chat history.
- The docs distinguish between concept, implemented code, and unverified assumptions.

## Phase 1: Freeze The v1 Spec

### Goal

Convert the concept into a stable experiment spec so the training and evaluation work does not drift.

### Status

Partially complete, but not frozen.

### Required decisions

- Confirm whether v1 is strictly binary (`Priority10` vs lower priority) or whether `Priority5` is part of the first measured claim.
- Freeze the canonical semantics of each token level.
- Freeze the exact v1 tasks that count as proof: instruction following, factual recall, conflict resolution, or all three.
- Freeze the evaluation question format and scoring criteria.

### Deliverables

- One written v1 experiment spec section in `README.md` or a dedicated `docs/` file.
- One canonical definition of what each dataset type is supposed to prove.
- One canonical list of metrics.

### Acceptance criteria

- No ambiguity remains about what “success” means.
- Dataset generation and evaluation both point at the same behavioral targets.

## Phase 2: Tokenizer And Training Contract

### Goal

Make the tokenizer and training assumptions explicit and testable.

### Status

Implementation exists; validation still needed.

### Existing assets

- `train_qlora.py` already adds the 11 special tokens and resizes embeddings.
- The embedding initialization strategy is already implemented by copying an existing special token.

### Work remaining

- Verify the added tokens survive save/load cycles.
- Verify chat templating does not break or split the special tokens unexpectedly.
- Add a small automated check that token IDs are stable and recognized as special tokens.
- Record the expected tokenizer behavior in docs.

### Deliverables

- a tokenizer smoke test script or test case
- a short reproducibility note documenting the token-addition behavior

### Acceptance criteria

- A fresh environment can add the tokens and produce the same tokenizer behavior every time.
- The tokens appear intact in tokenized training examples.

## Phase 3: Dataset Generation Hardening

### Goal

Turn the current dataset generator into a reproducible, auditable data pipeline.

### Status

Implemented, but not fully hardened.

### Existing assets

- `Dataset_gen/generate_dataset.py`
- `Dataset_gen/run_on_raspi.sh`
- `Dataset_gen/dataset.jsonl`
- validation logic embedded in the generator

### Work remaining

- Resolve the mismatch between target counts and the current generated counts.
- Decide whether the current dataset should be kept as the v1 baseline or regenerated cleanly.
- Persist a machine-readable validation report artifact after generation.
- Persist generation configuration alongside the dataset: model used for generation, seed, count, concurrency, date, and provider.
- Add duplicate and near-duplicate checks.
- Add answer leakage checks for filler and noise blocks.
- Add a sample-review document with manually inspected examples from each dataset type.

### Deliverables

- `Dataset_gen/dataset_validation.json`
- `Dataset_gen/dataset_card.md`
- `Dataset_gen/sample_review.md`
- optional deterministic regeneration script wrapper for the full dataset

### Acceptance criteria

- Dataset composition matches the intended plan exactly, or deviations are documented and justified.
- Validation output is saved and committed.
- A human review confirms the examples actually teach the intended behavior.

## Phase 4: Training Pipeline Maturity

### Goal

Move from smoke training to a repeatable training pipeline that can produce a candidate v1 adapter.

### Status

In progress.

### Existing assets

- `train_qlora.py`
- `training-requirements.txt`
- smoke artifact in `artifacts/smoke-qwen3-8b/checkpoint-1`
- successful smoke artifact in `artifacts/smoke-qwen3-8b-v4/checkpoint-1` (2026-04-17)
- active longer local run writing to `artifacts/qwen3-8b-prioritytokens-v1-local`
- local chat runner in `chat_adapter.py` for quickly testing trained adapters

### Work remaining

- Record the exact command that produced the smoke checkpoint.
- Define the canonical v1 training command.
- Decide sequence length, eval split policy, batch size, accumulation steps, and stopping logic.
- Add logging output that is easy to compare across runs.
- Save training metadata with each run: dataset hash, commit SHA, hyperparameters, wall-clock time, GPU type.
- Add resume and recovery instructions for interrupted runs.

### Recommended first canonical run

```powershell
python train_qlora.py `
  --model-name Qwen/Qwen3-8B `
  --dataset-path Dataset_gen/dataset.jsonl `
  --output-dir artifacts/qwen3-8b-prioritytokens-v1 `
  --max-seq-length 2048 `
  --num-train-epochs 1 `
  --eval-size 0.02 `
  --per-device-train-batch-size 1 `
  --gradient-accumulation-steps 16 `
  --learning-rate 2e-4
```

This is a starting point, not yet a frozen recipe.

### Deliverables

- canonical training command in docs
- run manifest per training attempt
- named artifact directory structure for experiments

### Acceptance criteria

- A full run can be reproduced from repository docs alone.
- Artifacts are clearly attributable to code, dataset, and parameters.

## Phase 5: Evaluation Harness

### Goal

Build the proof, not just the model.

### Status

Implemented in code, baseline run pending local execution.

### Implemented assets

- Frozen eval datasets under `data/eval/`:
  - `north_star.json`
  - `priority_ordering.jsonl`
  - `recall_set.jsonl`
  - `regression_set.jsonl`
- Eval scripts under `eval/`:
  - `north_star.py`
  - `priority_ordering.py`
  - `recall_accuracy.py`
  - `regression.py`
  - `run_all.py`
  - `common.py`
- Structured result output path: `eval/results/<run_name>.json`

### Remaining work

- Run baseline artifact generation locally:
  - `python eval/run_all.py --model Qwen/Qwen3-8B --run-name baseline-qwen3-8b-v1`
- Commit and tag eval freeze after baseline artifact is written.
- (Optional hardening) Add explicit eval README documenting metric interpretation.

### Acceptance criteria

- The same evaluation set can be rerun at any time.
- Results are written to disk as structured output.
- Improvement claims are backed by numbers, not anecdotes.

## Phase 6: v1 Release Package

### Goal

Package the experiment so other people can inspect, rerun, and critique it.

### Status

In progress.

### Deliverables

- filled-in model card for the trained adapter
- dataset card
- evaluation summary with charts or tables
- concise “how to use Priority Tokens” documentation
- website update reflecting real status rather than concept-stage copy (partially addressed by the startup voter-context popup)

### Acceptance criteria

- A visitor can understand what was built, how it was trained, and whether it worked.
- A technically competent person can reproduce the pipeline with the provided docs.

## Phase 7: Post-v1 Expansion

### Goal

Expand only after the binary claim is proven.

### Candidate tracks

- full `Priority1` to `Priority10` gradient
- larger or alternative open models
- more realistic mixed-task datasets
- UI or prompt-authoring helpers
- inference-time comparisons against related methods

### Gate

Do not prioritize this phase until Phase 5 produces a clear positive signal.

## Immediate Next Actions

These are the concrete next steps the repo should take now, in order:

1. Run and save the baseline eval artifact at `eval/results/baseline-qwen3-8b-v1.json`.
2. Commit `data/eval/`, `eval/`, and related docs; create tag `eval-v1`.
3. Execute Phase 2 tokenizer validation (save/load and token-ID stability checks).
4. Run one canonical non-smoke training job and record the manifest.
5. Compare base vs tuned model on the frozen eval suite and publish results.
6. Update website progress copy to match implemented repo state.

## Risks And Failure Modes

- The model may learn the literal tags without learning a robust priority concept.
- Synthetic data may overfit to dataset templates and fail on novel prompt structure.
- The current dataset may be good enough for smoke training but not rigorous enough for proof.
- Long-context gains may disappear when evaluated outside the training distribution.
- The project may confuse “tag obedience” with genuine improvement in attention allocation.

## Definition Of Done

Priority Tokens v1 is done when the repository contains:

- a stable tokenizer path for the 11 tokens
- a validated dataset with documented provenance
- a reproducible training recipe
- a reproducible evaluation harness
- structured results showing whether the fine-tune helps
- updated docs and website copy reflecting the actual outcome

Until then, the project should be treated as an active experiment, not a finished result.
