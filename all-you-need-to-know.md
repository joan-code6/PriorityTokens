# Priority Tokens — All You Need To Know

A single reference document for the Priority Tokens fine-tuning project.
Last updated: April 2026.

---

## 1. What This Project Is

**One-line pitch:** Fine-tune Qwen3-8B to respect user-defined priority markup tags in long contexts, so high-priority content is followed and recalled more reliably than low-priority content.

**The problem it solves:** LLMs treat all tokens roughly equally. Important instructions or facts buried in a long context get underweighted — the "lost in the middle" problem. Users have no direct control over what the model focuses on.

**The solution:** 11 new special tokens that users wrap around text spans to signal importance. The model learns, through SFT, to treat `<<Priority10>>` content as more important than `<<Priority5>>` or `<<Priority1>>` content.

**What it is not:** An architectural change. No attention-head surgery, no modified positional encodings. Pure learned behavior via supervised fine-tuning — the same way instruction-tuned models learned to obey `[INST]` tags.

---

## 2. Token Format

```
<<Priority1>>   ← lowest importance
<<Priority2>>
...
<<Priority10>>  ← highest importance
<<PrioEnd>>     ← single closing tag (same for all levels)
```

**Example usage:**

```
<<Priority10>>The transfer deadline is midnight on Friday.<<PrioEnd>>

<<Priority1>>The office kitchen was restocked with coffee on Tuesday.<<PrioEnd>>
```

**Implementation details:**
- These are NOT tiktoken tokens. This project uses HuggingFace's fast BPE tokenizer.
- Added via `tokenizer.add_special_tokens()`, followed by `model.resize_token_embeddings()`.
- Total: **11 new tokens** (10 opening + 1 closing).
- **Embedding init (mandatory):** Copy initial embedding vectors from an existing nearby special token (e.g. `<|im_start|>`). Never random-init — the model needs a starting signal, and random init wastes data budget.

---

## 3. Target Behaviors

Two primary behaviors are in scope for v1 training:

| # | Behavior | Description |
|---|----------|-------------|
| 1 | **Instruction following** | A `<<Priority10>>` instruction is obeyed more reliably than a `<<Priority1>>` one, even when both are buried deep in a long context |
| 2 | **Recall accuracy** | A `<<Priority10>>` fact is surfaced more accurately in outputs than a `<<Priority1>>` fact at the same document position |
| 3 | **Reasoning weight** | The model reasons more thoroughly about high-priority content — treated as an **emergent side-effect**, not a training target. Measure in evals, don't train for it directly. |

---

## 4. Model & Training Stack

| Component | Choice | Reason |
|-----------|--------|--------|
| Base model | Qwen3-8B (HuggingFace) | Manageable size, fast iteration, fits budget |
| Training method | QLoRA SFT | 4-bit quantized LoRA — feasible on a single rented GPU |
| Library | Unsloth or HF PEFT + TRL | Unsloth preferred for speed/memory savings |
| GPU | RunPod RTX 4090 | ~0.75 €/hr, sufficient VRAM for 8B QLoRA |
| Fallback | Continued pretraining | **Only** if, after SFT, the model completely ignores the new tokens. Not planned by default. |
| Out of scope | Full retraining from scratch | Not feasible solo within budget |
| Stretch goal | Kimi k2.5, Gemma | Out of scope for v1 |

---

## 5. Budget

**Total: ~150 €**

| Line item | Estimate |
|-----------|----------|
| GPU compute (RunPod RTX 4090 @ ~0.75 €/hr) | 40–60 € |
| Dataset generation (Claude API) | 15–25 € |
| Eval runs + inference testing | 10–15 € |
| Buffer for failed/wasted runs | 30–50 € |

**Biggest risk:** Wasted GPU time from bad training data. Design and validate the dataset before launching any paid training run.

---

## 6. Dataset Design

### Phased scope

- **v1 (binary):** Train only on `<<Priority5>>` (medium) and `<<Priority10>>` (high). Validate this works before expanding.
- **v2 (gradient):** Expand to the full 1–10 scale only after binary behavior is confirmed.

### Three example types needed

**Type 1 — Positive examples**
Long context with a `<<Priority10>>` fact buried somewhere. Correct answer requires that fact. Model should answer correctly.

```
[2000 tokens of <<Priority1>> background text]
<<Priority10>>The merger was finalized on 14 March 2024.<<PrioEnd>>
[2000 more tokens of <<Priority1>> text]
Q: When was the merger finalized?
A: 14 March 2024.
```

**Type 2 — Contrastive pairs**
Same document, but priority levels swapped. The expected output must change accordingly. This is the most important training signal — it forces the model to learn that the tags, not position, determine importance.

```
Version A: <<Priority10>>fact X<<PrioEnd>> → answer references X
Version B: <<Priority1>>fact X<<PrioEnd>> + <<Priority10>>fact Y<<PrioEnd>> → answer references Y
```

**Type 3 — Adversarial examples**
Low-priority noise surrounds high-priority content. Model must not be distracted by volume of low-priority text.

```
<<Priority1>> [long irrelevant passage] <<PrioEnd>>
<<Priority10>> [short critical fact] <<PrioEnd>>
<<Priority1>> [more noise] <<PrioEnd>>
Q: [question requiring the Priority10 fact]
```

### Dataset generation strategy
- Generate synthetically using the Claude API (budgeted at 15–25 €).
- Draft the format spec and a sample batch first. Validate quality manually before generating at scale.
- Aim for diversity in: document domain, fact type, question style, noise type, and burial position of the high-priority span.

---

## 7. Evaluation Suite

### North Star Eval (primary success criterion)

A document ~4k–8k tokens long. A `<<Priority10>>` fact is buried at approximately token position 3000, surrounded by `<<Priority1>>` noise. A question is asked whose correct answer requires that specific fact.

**Pass condition:** Fine-tuned model answers correctly significantly more often than base Qwen3-8B on the same prompt (with no priority tags as a baseline control).

### Full Eval Suite

| Test | What it measures |
|------|-----------------|
| Priority ordering | P10 answers rank above P5, P5 above P1 — across multiple question types |
| Recall accuracy | Does the model surface high-priority facts more reliably at varied burial positions? |
| Instruction following | Does the model obey P10 instructions over conflicting P1 instructions? |
| Regression check | General capability vs base Qwen3-8B on standard benchmarks (e.g. MMLU subset) — ensure no catastrophic forgetting |
| Baseline (control) | Same prompts, no priority tags — measures the value added by the tags |

**Build the eval suite before training.** Running evals on a base model first gives you a baseline and catches eval bugs cheaply, before any GPU spend.

---

## 8. Implementation Checklist

Tasks in order:

- [ ] **Dataset format spec** — define exact input/output format, tag placement rules, length distribution
- [ ] **Tokenizer extension + embed init code** — `add_special_tokens()` + `resize_token_embeddings()` + copy init from `<|im_start|>`
- [ ] **Dataset generation** — write Claude API prompts, generate a small pilot batch (~50 examples), validate manually
- [ ] **Eval suite** — write eval harness, run on base Qwen3-8B to establish baseline
- [ ] **Training run (short)** — 1–2 hour test run on a small data slice to confirm the pipeline works end-to-end before committing to a full run
- [ ] **Full training run** — binary case (P5/P10 only) first
- [ ] **Eval on fine-tuned model** — compare against baseline
- [ ] **Expand to full 1–10 scale** — only if binary case shows measurable improvement

---

## 9. Key Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Model ignores new tokens entirely after SFT | High | Proper embed init (not random). Contrastive pairs are essential training signal. If still ignored: consider short continued pretraining on tagged corpus. |
| Budget blown on failed training runs | High | Validate dataset first. Run a short cheap test run. Build eval suite before training. |
| Catastrophic forgetting | Medium | Use LoRA (not full fine-tune). Keep LoRA rank modest (r=16–32). Monitor regression eval. |
| Dataset too uniform | Medium | Vary document domain, question type, noise content, burial position. Lack of diversity → poor generalization. |
| Eval measures wrong thing | Medium | Design eval before training. Use held-out examples never seen during training. |

---

## 10. Scope Boundaries

**In scope (v1):**
- Qwen3-8B only
- Binary priority case: P5 and P10
- QLoRA SFT
- Instruction following + recall accuracy behaviors
- Single GPU (RunPod RTX 4090)

**Out of scope:**
- Full retraining from scratch
- Models other than Qwen3-8B (Kimi, Gemma are stretch goals)
- Full 1–10 gradient (v2 only)
- Production deployment
- Architectural attention modifications

**Success criterion:** A measurable accuracy improvement on the north star eval. Not a production-ready model.
