# Dataset Generation Script — Copilot Task Spec

## What you are building

A Python script (`generate_dataset.py`) that generates a `.jsonl` training dataset for fine-tuning a language model to respect user-defined priority tags in long-context inputs.

The script calls the **Anthropic Claude API** (Haiku model, cheap) to generate synthetic document components, assembles them into tagged documents, and writes each example to `dataset.jsonl` in the format expected by HuggingFace TRL's `SFTTrainer`.

---

## Priority tag format

These are special tokens in the target model's tokenizer:

- Opening tags: `<<Priority1>>` through `<<Priority10>>`
- Closing tag: `<<PrioEnd>>` (same for all levels)

Example: `<<Priority10>>The reactor tolerance was 480 bar.<<PrioEnd>>`

Tags wrap spans of text inside documents. The model is trained to prefer higher-priority spans when they conflict with lower-priority ones.

---

## Output format

Each line of `dataset.jsonl` is a JSON object with exactly this structure:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "<full document with priority tags>\n\n---\n\nQuestion: <question>"
    },
    {
      "role": "assistant",
      "content": "<short answer, 1 sentence max>"
    }
  ],
  "metadata": {
    "type": "contrastive | positive | adversarial | instruction",
    "pair_id": "<shared string for contrastive pairs, null otherwise>",
    "variant": "A | B | null",
    "p10_position_tokens": 123,
    "p5_position_tokens": 456,
    "doc_length_tokens": 789,
    "domain": "science | logistics | history | finance | medicine | law | engineering | ecology",
    "conflicting_fact": "<human-readable note, contrastive only, null otherwise>",
    "noise_tag_count": 0
  }
}
```

**Critical:** TRL ignores the `metadata` field. It is only used for analysis. Do not remove it.

---

## Dataset composition

Generate **1500 examples total** in this ratio:

| Type | Count | Description |
|---|---|---|
| `contrastive` | 600 (300 pairs × 2) | Same doc, priority levels swapped. Answer changes. |
| `positive` | 525 | Single P10 fact buried in neutral filler. Answer requires it. |
| `adversarial` | 225 | P10 fact surrounded by P1 noise facts. Answer must use P10. |
| `instruction` | 150 | P10 instruction overrides P5 instruction. Output follows P10. |

---

## Document structure rules

### Contrastive examples

Each contrastive pair consists of two examples (variant A and B) that share a `pair_id`.

- Both contain the **same two facts** that answer the question with **different values** (e.g., "340 bar" vs "480 bar")
- Variant A: fact_A tagged `<<Priority5>>`, fact_B tagged `<<Priority10>>` → correct answer is fact_B's value
- Variant B: fact_A tagged `<<Priority10>>`, fact_B tagged `<<Priority5>>` → correct answer is fact_A's value
- The two tagged spans must be **at least 500 tokens apart**
- Their positions must be **randomised independently** across examples — never always put P10 at the end
- The rest of the document is neutral filler that does not answer the question

### Positive examples

- One `<<Priority10>>` fact buried in neutral filler paragraphs
- No P5 tag
- Filler must not contain the answer

### Adversarial examples

- One `<<Priority10>>` fact
- Surrounded by **6–10** `<<Priority1>>` noise facts on unrelated topics
- Noise facts must not answer the question
- `noise_tag_count` in metadata records how many P1 spans there are

### Instruction examples

- Document contains a `<<Priority10>>` instruction and a `<<Priority5>>` instruction that conflict
- Example conflict: P10 says "respond only in French", P5 says "respond only in German"
- Neutral context paragraph separates them
- Correct output follows the P10 instruction

---

## Target document lengths

- Minimum: 3500 tokens
- Target: 4000–6000 tokens
- Maximum: 8000 tokens

Use the tokenizer to verify length. Pad with extra filler paragraphs if too short.

---

## Generation strategy (multi-step, not single-shot)

**Do NOT ask Claude to produce a complete tagged document in one API call.** Generate components separately and assemble in Python. This gives you assembly control and avoids the model mangling the tag syntax.

### Step 1 — Generate filler paragraphs

Prompt Claude to generate 4–6 paragraphs of plausible prose on a given topic. No tags. No facts that would answer the target question.

Example system prompt for filler:
```
You generate filler text for synthetic documents. Write 5 paragraphs of plausible-sounding prose about {domain}. Do not include any specific numerical facts. Do not mention {topic_hint}. Output only the paragraphs, no headers or commentary.
```

### Step 2 — Generate a conflicting fact pair + question

Prompt Claude to generate:
- `fact_A`: a sentence stating a specific value (number, name, date)
- `fact_B`: a sentence stating a different value for the same subject
- `question`: a question whose answer is determined by which fact is authoritative

Example system prompt:
```
Generate a conflicting fact pair for a synthetic document. Output JSON only, no markdown:
{
  "subject": "...",
  "fact_A": "...",
  "fact_B": "...",
  "question": "..."
}
fact_A and fact_B must give different values for the same subject. The question must have one correct answer depending on which fact is marked high priority.
```

### Step 3 — Assemble in Python

Insert the tagged facts and filler paragraphs into the document programmatically. Randomise positions. Compute token offsets using the tokenizer after assembly.

---

## API call configuration

```python
import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env

response = client.messages.create(
    model="claude-haiku-4-5",  # cheapest model, use for all generation
    max_tokens=1024,
    messages=[{"role": "user", "content": prompt}]
)
text = response.content[0].text
```

Use `claude-haiku-4-5` for **all** generation calls. Do not use Sonnet or Opus — unnecessary cost.

---

## Tokenizer usage

Use the Qwen3 tokenizer to compute token lengths and positions. Do not estimate from character count.

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen3-8B")

def count_tokens(text: str) -> int:
    return len(tokenizer.encode(text, add_special_tokens=False))

def find_token_offset(full_text: str, substring: str) -> int:
    """Returns the token index at which substring starts in full_text."""
    char_offset = full_text.index(substring)
    prefix = full_text[:char_offset]
    return len(tokenizer.encode(prefix, add_special_tokens=False))
```

---

## Script interface

```
python generate_dataset.py \
    --output dataset.jsonl \
    --count 1500 \
    --seed 42
```

Arguments:
- `--output`: path to write `.jsonl` file (default: `dataset.jsonl`)
- `--count`: total number of examples (default: 1500)
- `--seed`: random seed for reproducibility (default: 42)

---

## Validation pass

After generation, run a validation function that checks every example and reports errors:

```
validate_dataset(path: str) -> dict:
    - total examples
    - counts per type
    - examples where doc_length_tokens < 3500 or > 8000
    - contrastive pairs where A and B have the same answer (generation error)
    - position distribution: histogram of p10_position_tokens / doc_length_tokens
      → flag if >30% of examples fall in the top or bottom 10% of the document
    - missing or malformed metadata fields
```

Print the validation report to stdout after generation completes.

---

## Project file structure

```
project/
├── generate_dataset.py     ← main script (what you are building)
├── dataset.jsonl           ← output (generated by the script)
├── requirements.txt        ← anthropic, transformers, tqdm
└── validate_dataset.py     ← optional: standalone validator (can also be a function in main script)
```

---

## Error handling requirements

- **Rate limit errors**: retry with exponential backoff (max 5 retries, starting at 2s)
- **JSON parse errors** from Claude: retry up to 3 times with the same prompt
- **Assembly failures** (e.g. filler too short, question not embeddable): skip and log, do not crash
- **Progress**: use `tqdm` to show progress bar over total examples
- **Checkpointing**: write completed examples to disk immediately (do not buffer all 1500 in memory). If the script is interrupted, it should be re-runnable and skip already-written examples by checking the output file line count on startup.

---

## Domains to use

Rotate across these 8 domains evenly:

```python
DOMAINS = [
    "materials science",
    "logistics and supply chain",
    "financial reporting",
    "ecology and conservation",
    "medical research",
    "civil engineering",
    "legal case records",
    "archaeological records",
]
```

Assign domains round-robin so each domain appears roughly equally in the final dataset.

---

## What NOT to do

- Do not generate the complete tagged document in a single Claude API call
- Do not estimate token counts from character length
- Do not put P10 always at the same position in the document
- Do not buffer all examples in memory before writing
- Do not use GPT-4 or any non-Anthropic model
- Do not use `claude-sonnet` or `claude-opus` for generation (cost)
- Do not include the `metadata` field in the `messages` content — it is a sibling key, not inside the prompt