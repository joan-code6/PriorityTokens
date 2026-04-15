#!/usr/bin/env python3
"""Generate a priority-tag dataset for SFT training.

This script creates JSONL examples in TRL SFTTrainer chat format, with a sibling
metadata object used for offline analysis.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import random
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import dotenv
from tqdm import tqdm
from transformers import AutoTokenizer

try:
    from openrouter import OpenRouter
except Exception:  # noqa: BLE001
    OpenRouter = None  # type: ignore[assignment]

MODEL_NAME = "qwen/qwen3-32b"
CLOSE_TAG = "<<PrioEnd>>"
P1_TAG = "<<Priority1>>"
P5_TAG = "<<Priority5>>"
P10_TAG = "<<Priority10>>"

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

DOMAIN_TO_METADATA = {
    "materials science": "science",
    "logistics and supply chain": "logistics",
    "financial reporting": "finance",
    "ecology and conservation": "ecology",
    "medical research": "medicine",
    "civil engineering": "engineering",
    "legal case records": "law",
    "archaeological records": "history",
}

REQUIRED_METADATA_FIELDS = {
    "type",
    "pair_id",
    "variant",
    "p10_position_tokens",
    "p5_position_tokens",
    "doc_length_tokens",
    "domain",
    "conflicting_fact",
    "noise_tag_count",
}

dotenv.load_dotenv()

_THREAD_LOCAL = threading.local()
_TOKENIZER_LOCK = threading.Lock()
_SHARED_TOKENIZER: AutoTokenizer | None = None


def get_shared_tokenizer() -> AutoTokenizer:
    global _SHARED_TOKENIZER
    if _SHARED_TOKENIZER is None:
        with _TOKENIZER_LOCK:
            if _SHARED_TOKENIZER is None:
                _SHARED_TOKENIZER = AutoTokenizer.from_pretrained("Qwen/Qwen3-8B")
    return _SHARED_TOKENIZER


def count_tokens(tokenizer: AutoTokenizer, text: str) -> int:
    return len(tokenizer.encode(text, add_special_tokens=False))


def find_token_offset(tokenizer: AutoTokenizer, full_text: str, substring: str) -> int:
    char_offset = full_text.index(substring)
    prefix = full_text[:char_offset]
    return count_tokens(tokenizer, prefix)


def safe_json_extract(raw_text: str) -> dict[str, Any]:
    text = raw_text.strip()

    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    try:
        data = json.loads(text)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        raise json.JSONDecodeError("No JSON object found", text, 0)

    data = json.loads(match.group(0))
    if not isinstance(data, dict):
        raise ValueError("Parsed JSON is not an object")
    return data


class ClaudeClient:
    def __init__(self, model: str = MODEL_NAME) -> None:
        self.model = model
        if os.getenv("PROVIDER") == "hai":
            self.server_url = "https://ai.hackclub.com/proxy/v1"
        else:
            self.server_url = "https://openrouter.ai/api/v1"

        self.api_key = os.getenv("API_KEY")
        if not self.api_key:
            raise RuntimeError("Missing API_KEY in environment")

        self.client: Any | None = None
        if OpenRouter is not None:
            self.client = OpenRouter(
                api_key=self.api_key,
                server_url=self.server_url,
            )

    def _generate_text_http(self, prompt: str, max_tokens: int) -> str:
        payload = {
            "model": self.model,
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }
        body = json.dumps(payload).encode("utf-8")
        request = urllib.request.Request(
            url=f"{self.server_url}/chat/completions",
            data=body,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
        )

        with urllib.request.urlopen(request, timeout=120) as response:
            raw = response.read().decode("utf-8")

        parsed = json.loads(raw)
        content = parsed["choices"][0]["message"]["content"]
        if isinstance(content, list):
            text_parts = []
            for item in content:
                if isinstance(item, dict) and "text" in item:
                    text_parts.append(str(item["text"]))
                else:
                    text_parts.append(str(item))
            text = "\n".join(text_parts).strip()
        else:
            text = str(content).strip()

        if not text:
            raise RuntimeError("Empty text from HTTP response")
        return text

    def generate_text(self, prompt: str, max_tokens: int = 1024) -> str:
        delay_seconds = 2
        for attempt in range(5):
            try:
                if self.client is not None:
                    response = self.client.chat.send(
                        model=self.model,
                        max_tokens=max_tokens,
                        messages=[{"role": "user", "content": prompt}],
                    )

                    content = response.choices[0].message.content
                    if isinstance(content, list):
                        text = "\n".join(str(item) for item in content).strip()
                    else:
                        text = str(content).strip()
                else:
                    text = self._generate_text_http(prompt=prompt, max_tokens=max_tokens)
                if not text:
                    raise RuntimeError("Empty text from Claude response")
                return text
            except Exception as exc:  # noqa: BLE001
                exc_text = str(exc).lower()
                is_rate_limited = "rate" in exc_text and "limit" in exc_text
                is_http_429 = "429" in exc_text
                if is_rate_limited or is_http_429:
                    if attempt == 4:
                        raise
                    time.sleep(delay_seconds)
                    delay_seconds *= 2
                    continue
                raise

        raise RuntimeError("Failed to call Claude after retries")

    def generate_json(self, prompt: str, max_tokens: int = 1024) -> dict[str, Any]:
        last_error: Exception | None = None
        for _ in range(3):
            text = self.generate_text(prompt=prompt, max_tokens=max_tokens)
            try:
                return safe_json_extract(text)
            except Exception as exc:  # noqa: BLE001
                last_error = exc
        raise RuntimeError(f"Failed to parse JSON response after retries: {last_error}")


class DatasetGenerator:
    def __init__(self, seed: int, tokenizer: AutoTokenizer | None = None) -> None:
        self.rng = random.Random(seed)
        self.tokenizer = tokenizer if tokenizer is not None else get_shared_tokenizer()
        self.claude = ClaudeClient(model=MODEL_NAME)

    def _domain_for(self, domain_text: str) -> str:
        return DOMAIN_TO_METADATA.get(domain_text, "science")


    def _tag(self, tag: str, text: str) -> str:
        clean = text.replace("\n", " ").strip()
        return f"{tag}{clean}{CLOSE_TAG}"

    def _extract_required(self, data: dict[str, Any], keys: list[str]) -> dict[str, str]:
        out: dict[str, str] = {}
        for key in keys:
            value = data.get(key)
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"Missing or invalid key: {key}")
            out[key] = value.strip()
        return out

    def generate_filler_block(self, domain: str, topic_hint: str, paragraphs: int = 5) -> str:
        prompt = (
            "You generate filler text for synthetic documents. "
            f"Write {paragraphs} paragraphs of plausible-sounding prose about {domain}. "
            "Do not include specific numerical facts. "
            f"Do not mention {topic_hint}. "
            "Do not include priority tags. "
            "Output only the paragraphs, no headers or commentary."
        )
        text = self.claude.generate_text(prompt, max_tokens=1200)
        text = text.replace("<<Priority", "<Priority").replace(CLOSE_TAG, "")
        if len(text.split()) < 120:
            raise RuntimeError("Filler too short")
        return text.strip()

    def generate_conflicting_fact_pair(self, domain: str) -> dict[str, str]:
        prompt = (
            "Generate a conflicting fact pair for a synthetic document. "
            "Output JSON only, no markdown, using exactly these keys: "
            "subject, fact_A, fact_B, question, answer_A, answer_B. "
            f"Context domain: {domain}. "
            "fact_A and fact_B must state different values for the same subject. "
            "question must be answerable by either answer_A or answer_B depending on authority. "
            "answer_A and answer_B must each be short (<= 12 words), distinct, and directly match the value in fact_A/fact_B."
        )
        data = self.claude.generate_json(prompt, max_tokens=700)
        return self._extract_required(
            data, ["subject", "fact_A", "fact_B", "question", "answer_A", "answer_B"]
        )

    def generate_noise_facts(self, domain: str, count: int, avoid_topic: str) -> list[str]:
        prompt = (
            "Generate unrelated single-sentence noise facts. "
            "Output JSON only with key noise_facts as an array of strings. "
            f"Need exactly {count} items. "
            f"Domain context: {domain}. "
            f"Do not mention or answer anything about: {avoid_topic}. "
            "Do not include priority tags."
        )
        data = self.claude.generate_json(prompt, max_tokens=900)
        facts = data.get("noise_facts")
        if not isinstance(facts, list):
            raise ValueError("noise_facts missing or not an array")
        clean = [str(item).strip() for item in facts if str(item).strip()]
        if len(clean) < count:
            raise ValueError("Not enough noise facts")
        return clean[:count]

    def generate_instruction_conflict(self, domain: str) -> dict[str, str]:
        prompt = (
            "Generate conflicting response instructions for a synthetic document. "
            "Output JSON only with keys: instruction_p10, instruction_p5, neutral_context, expected_output. "
            f"Domain context: {domain}. "
            "instruction_p10 and instruction_p5 must conflict directly. "
            "expected_output must satisfy instruction_p10 and violate instruction_p5. "
            "expected_output must be one short sentence."
        )
        data = self.claude.generate_json(prompt, max_tokens=600)
        return self._extract_required(
            data,
            ["instruction_p10", "instruction_p5", "neutral_context", "expected_output"],
        )

    def _build_filler_to_tokens(
        self, domain: str, topic_hint: str, min_tokens: int, max_calls: int = 20
    ) -> str:
        parts: list[str] = []
        total = 0
        calls = 0
        while total < min_tokens:
            calls += 1
            if calls > max_calls:
                raise RuntimeError("Filler assembly exceeded max API calls")
            block = self.generate_filler_block(
                domain=domain, topic_hint=topic_hint, paragraphs=self.rng.randint(4, 6)
            )
            parts.append(block)
            total = count_tokens(self.tokenizer, "\n\n".join(parts))
        return "\n\n".join(parts)

    def _ensure_doc_length(self, doc: str, domain: str, topic_hint: str) -> str:
        current = count_tokens(self.tokenizer, doc)
        if current > 8000:
            raise RuntimeError(f"Document too long: {current} tokens")
        while current < 3500:
            extra = self.generate_filler_block(domain=domain, topic_hint=topic_hint, paragraphs=4)
            doc = f"{doc}\n\n{extra}"
            current = count_tokens(self.tokenizer, doc)
            if current > 8000:
                raise RuntimeError(f"Document exceeded max length while padding: {current}")
        return doc

    def _assemble_question_prompt(self, doc: str, question: str) -> str:
        return f"{doc}\n\n---\n\nQuestion: {question.strip()}"

    def _build_metadata(
        self,
        *,
        type_name: str,
        pair_id: str | None,
        variant: str | None,
        p10_pos: int,
        p5_pos: int | None,
        doc_len: int,
        domain: str,
        conflicting_fact: str | None,
        noise_tag_count: int,
    ) -> dict[str, Any]:
        return {
            "type": type_name,
            "pair_id": pair_id,
            "variant": variant,
            "p10_position_tokens": p10_pos,
            "p5_position_tokens": p5_pos,
            "doc_length_tokens": doc_len,
            "domain": self._domain_for(domain),
            "conflicting_fact": conflicting_fact,
            "noise_tag_count": noise_tag_count,
        }

    def build_contrastive_example(
        self,
        domain: str,
        pair_id: str,
        variant: str,
    ) -> dict[str, Any]:
        fact_data = self.generate_conflicting_fact_pair(domain=domain)

        if variant == "A":
            p5_fact = fact_data["fact_A"]
            p10_fact = fact_data["fact_B"]
            answer = fact_data["answer_B"]
        else:
            p5_fact = fact_data["fact_B"]
            p10_fact = fact_data["fact_A"]
            answer = fact_data["answer_A"]

        tagged_p5 = self._tag(P5_TAG, p5_fact)
        tagged_p10 = self._tag(P10_TAG, p10_fact)

        pre = self._build_filler_to_tokens(domain, fact_data["subject"], min_tokens=self.rng.randint(700, 1800))
        middle = self._build_filler_to_tokens(domain, fact_data["subject"], min_tokens=self.rng.randint(550, 1500))
        post = self._build_filler_to_tokens(domain, fact_data["subject"], min_tokens=self.rng.randint(700, 1800))

        p10_first = self.rng.choice([True, False])
        if p10_first:
            document = f"{pre}\n\n{tagged_p10}\n\n{middle}\n\n{tagged_p5}\n\n{post}"
        else:
            document = f"{pre}\n\n{tagged_p5}\n\n{middle}\n\n{tagged_p10}\n\n{post}"

        document = self._ensure_doc_length(document, domain=domain, topic_hint=fact_data["subject"])
        doc_len = count_tokens(self.tokenizer, document)

        p10_pos = find_token_offset(self.tokenizer, document, tagged_p10)
        p5_pos = find_token_offset(self.tokenizer, document, tagged_p5)
        if abs(p10_pos - p5_pos) < 500:
            raise RuntimeError("Contrastive tagged spans are too close (<500 tokens)")

        user_content = self._assemble_question_prompt(document, fact_data["question"])

        return {
            "messages": [
                {"role": "user", "content": user_content},
                {"role": "assistant", "content": answer.strip()},
            ],
            "metadata": self._build_metadata(
                type_name="contrastive",
                pair_id=pair_id,
                variant=variant,
                p10_pos=p10_pos,
                p5_pos=p5_pos,
                doc_len=doc_len,
                domain=domain,
                conflicting_fact=(
                    f"{fact_data['subject']}: A={fact_data['answer_A']}, B={fact_data['answer_B']}"
                ),
                noise_tag_count=0,
            ),
        }

    def build_positive_example(self, domain: str) -> dict[str, Any]:
        fact_data = self.generate_conflicting_fact_pair(domain=domain)
        p10_fact = fact_data["fact_B"]
        answer = fact_data["answer_B"]
        question = fact_data["question"]
        tagged_p10 = self._tag(P10_TAG, p10_fact)

        pre = self._build_filler_to_tokens(domain, fact_data["subject"], min_tokens=self.rng.randint(900, 2400))
        post = self._build_filler_to_tokens(domain, fact_data["subject"], min_tokens=self.rng.randint(900, 2400))

        if self.rng.choice([True, False]):
            document = f"{pre}\n\n{tagged_p10}\n\n{post}"
        else:
            document = f"{post}\n\n{tagged_p10}\n\n{pre}"

        document = self._ensure_doc_length(document, domain=domain, topic_hint=fact_data["subject"])
        doc_len = count_tokens(self.tokenizer, document)
        p10_pos = find_token_offset(self.tokenizer, document, tagged_p10)

        user_content = self._assemble_question_prompt(document, question)
        return {
            "messages": [
                {"role": "user", "content": user_content},
                {"role": "assistant", "content": answer.strip()},
            ],
            "metadata": self._build_metadata(
                type_name="positive",
                pair_id=None,
                variant=None,
                p10_pos=p10_pos,
                p5_pos=None,
                doc_len=doc_len,
                domain=domain,
                conflicting_fact=None,
                noise_tag_count=0,
            ),
        }

    def build_adversarial_example(self, domain: str) -> dict[str, Any]:
        fact_data = self.generate_conflicting_fact_pair(domain=domain)
        question = fact_data["question"]
        answer = fact_data["answer_A"]
        tagged_p10 = self._tag(P10_TAG, fact_data["fact_A"])

        noise_count = self.rng.randint(6, 10)
        noises = self.generate_noise_facts(
            domain=domain,
            count=noise_count,
            avoid_topic=fact_data["subject"],
        )
        tagged_noise = [self._tag(P1_TAG, noise) for noise in noises]

        noise_prefix_n = self.rng.randint(3, min(6, len(tagged_noise)))
        noise_prefix = "\n\n".join(tagged_noise[:noise_prefix_n])
        noise_suffix = "\n\n".join(tagged_noise[noise_prefix_n:])

        pre = self._build_filler_to_tokens(domain, fact_data["subject"], min_tokens=self.rng.randint(700, 1700))
        post = self._build_filler_to_tokens(domain, fact_data["subject"], min_tokens=self.rng.randint(700, 1700))

        document = (
            f"{pre}\n\n{noise_prefix}\n\n{tagged_p10}\n\n{noise_suffix}\n\n{post}"
        )

        document = self._ensure_doc_length(document, domain=domain, topic_hint=fact_data["subject"])
        doc_len = count_tokens(self.tokenizer, document)
        p10_pos = find_token_offset(self.tokenizer, document, tagged_p10)

        user_content = self._assemble_question_prompt(document, question)
        return {
            "messages": [
                {"role": "user", "content": user_content},
                {"role": "assistant", "content": answer.strip()},
            ],
            "metadata": self._build_metadata(
                type_name="adversarial",
                pair_id=None,
                variant=None,
                p10_pos=p10_pos,
                p5_pos=None,
                doc_len=doc_len,
                domain=domain,
                conflicting_fact=None,
                noise_tag_count=len(tagged_noise),
            ),
        }

    def build_instruction_example(self, domain: str) -> dict[str, Any]:
        inst = self.generate_instruction_conflict(domain=domain)

        tagged_p10 = self._tag(P10_TAG, inst["instruction_p10"])
        tagged_p5 = self._tag(P5_TAG, inst["instruction_p5"])

        pre = self._build_filler_to_tokens(domain, "instruction conflict", min_tokens=self.rng.randint(700, 1600))
        post = self._build_filler_to_tokens(domain, "instruction conflict", min_tokens=self.rng.randint(700, 1600))

        if self.rng.choice([True, False]):
            document = (
                f"{pre}\n\n{tagged_p5}\n\n{inst['neutral_context']}\n\n"
                f"{tagged_p10}\n\n{post}"
            )
        else:
            document = (
                f"{pre}\n\n{tagged_p10}\n\n{inst['neutral_context']}\n\n"
                f"{tagged_p5}\n\n{post}"
            )

        document = self._ensure_doc_length(document, domain=domain, topic_hint="instruction")
        doc_len = count_tokens(self.tokenizer, document)
        p10_pos = find_token_offset(self.tokenizer, document, tagged_p10)
        p5_pos = find_token_offset(self.tokenizer, document, tagged_p5)

        question = "What should your response be?"
        user_content = self._assemble_question_prompt(document, question)

        return {
            "messages": [
                {"role": "user", "content": user_content},
                {"role": "assistant", "content": inst["expected_output"].strip()},
            ],
            "metadata": self._build_metadata(
                type_name="instruction",
                pair_id=None,
                variant=None,
                p10_pos=p10_pos,
                p5_pos=p5_pos,
                doc_len=doc_len,
                domain=domain,
                conflicting_fact=None,
                noise_tag_count=0,
            ),
        }

    def build_fallback_example(self, example_type: str, domain: str, pair_id: str | None, variant: str | None) -> dict[str, Any]:
        # Minimal deterministic fallback if API-driven assembly fails repeatedly.
        base_filler = (
            "This archive contains procedural notes and contextual descriptions "
            "intended for long-context reading. "
            "The surrounding content is descriptive and avoids exact values. "
        )
        filler = "\n\n".join([base_filler] * 40)

        if example_type == "contrastive":
            fact_a = "The approved threshold is 340 bar."
            fact_b = "The approved threshold is 480 bar."
            question = "What is the approved threshold?"
            ans_a = "340 bar"
            ans_b = "480 bar"
            if variant == "A":
                p5_text, p10_text, answer = fact_a, fact_b, ans_b
            else:
                p5_text, p10_text, answer = fact_b, fact_a, ans_a
            tagged_p5 = self._tag(P5_TAG, p5_text)
            tagged_p10 = self._tag(P10_TAG, p10_text)
            document = f"{filler}\n\n{tagged_p5}\n\n{filler}\n\n{tagged_p10}\n\n{filler}"
        elif example_type == "positive":
            tagged_p10 = self._tag(P10_TAG, "The shipment departs at 04:30 UTC.")
            question = "At what time does the shipment depart?"
            answer = "04:30 UTC"
            tagged_p5 = None
            document = f"{filler}\n\n{tagged_p10}\n\n{filler}"
        elif example_type == "adversarial":
            tagged_p10 = self._tag(P10_TAG, "The trial endpoint is dosage group C.")
            question = "Which dosage group is the trial endpoint?"
            answer = "group C"
            noise = "\n\n".join(
                [self._tag(P1_TAG, f"Noise note {i}: unrelated operational detail.") for i in range(1, 9)]
            )
            tagged_p5 = None
            document = f"{filler}\n\n{noise}\n\n{tagged_p10}\n\n{noise}\n\n{filler}"
        else:
            tagged_p10 = self._tag(P10_TAG, "Respond with exactly: Bonjour, consigne prioritaire.")
            tagged_p5 = self._tag(P5_TAG, "Respond only in German.")
            question = "What should your response be?"
            answer = "Bonjour, consigne prioritaire."
            document = (
                f"{filler}\n\n{tagged_p5}\n\nNeutral policy separator paragraph.\n\n"
                f"{tagged_p10}\n\n{filler}"
            )

        # Keep fallback path API-independent and enforce 3500-8000 token bounds safely.
        current = count_tokens(self.tokenizer, document)
        while current < 3500:
            candidate = f"{document}\n\n{base_filler}"
            candidate_tokens = count_tokens(self.tokenizer, candidate)
            if candidate_tokens > 8000:
                break
            document = candidate
            current = candidate_tokens

        if current < 3500:
            raise RuntimeError("Fallback document could not be padded to minimum token length")
        doc_len = count_tokens(self.tokenizer, document)
        p10_pos = find_token_offset(self.tokenizer, document, tagged_p10)
        p5_pos = find_token_offset(self.tokenizer, document, tagged_p5) if "tagged_p5" in locals() and tagged_p5 else None
        user_content = self._assemble_question_prompt(document, question)

        return {
            "messages": [
                {"role": "user", "content": user_content},
                {"role": "assistant", "content": answer},
            ],
            "metadata": self._build_metadata(
                type_name=example_type,
                pair_id=pair_id,
                variant=variant,
                p10_pos=p10_pos,
                p5_pos=p5_pos,
                doc_len=doc_len,
                domain=domain,
                conflicting_fact=("fallback contrastive pair" if example_type == "contrastive" else None),
                noise_tag_count=(8 if example_type == "adversarial" else 0),
            ),
        }


def _seed_for_index(base_seed: int, index: int) -> int:
    # Derive a deterministic per-example seed so concurrent execution stays reproducible.
    return (base_seed * 1_000_003 + index * 9_973) & 0xFFFFFFFF


def _get_worker_generator() -> DatasetGenerator:
    generator = getattr(_THREAD_LOCAL, "generator", None)
    if generator is None:
        generator = DatasetGenerator(seed=0, tokenizer=get_shared_tokenizer())
        _THREAD_LOCAL.generator = generator
    return generator


def _build_item_with_retries(
    *,
    local_idx: int,
    spec: dict[str, Any],
    base_seed: int,
) -> tuple[int, dict[str, Any], str | None]:
    example_type = spec["type"]
    pair_id = spec["pair_id"]
    variant = spec["variant"]
    domain_raw = spec["domain_raw"]

    generator = _get_worker_generator()
    generator.rng.seed(_seed_for_index(base_seed, local_idx))

    item: dict[str, Any] | None = None
    last_error: Exception | None = None

    for _ in range(3):
        try:
            if example_type == "contrastive":
                item = generator.build_contrastive_example(
                    domain=domain_raw,
                    pair_id=pair_id,
                    variant=variant,
                )
            elif example_type == "positive":
                item = generator.build_positive_example(domain=domain_raw)
            elif example_type == "adversarial":
                item = generator.build_adversarial_example(domain=domain_raw)
            elif example_type == "instruction":
                item = generator.build_instruction_example(domain=domain_raw)
            else:
                raise RuntimeError(f"Unknown example type: {example_type}")
            break
        except Exception as exc:  # noqa: BLE001
            last_error = exc

    warning: str | None = None
    if item is None:
        warning = (
            "[warn] API-driven assembly failed for "
            f"index={local_idx}, type={example_type}: {last_error}. Using fallback."
        )
        item = generator.build_fallback_example(
            example_type=example_type,
            domain=domain_raw,
            pair_id=pair_id,
            variant=variant,
        )

    return local_idx, item, warning


async def _generate_pending_examples(
    *,
    output_path: Path,
    pending_plan: list[dict[str, Any]],
    completed: int,
    total: int,
    seed: int,
    concurrency: int,
) -> None:
    semaphore = asyncio.Semaphore(concurrency)

    async def run_one(local_idx: int, spec: dict[str, Any]) -> tuple[int, dict[str, Any], str | None]:
        async with semaphore:
            return await asyncio.to_thread(
                _build_item_with_retries,
                local_idx=local_idx,
                spec=spec,
                base_seed=seed,
            )

    indexed_pending = list(enumerate(pending_plan, start=completed))
    tasks = [asyncio.create_task(run_one(local_idx, spec)) for local_idx, spec in indexed_pending]

    progress = tqdm(total=total, initial=completed, desc="Generating examples", unit="example")
    buffered: dict[int, dict[str, Any]] = {}
    next_to_write = completed

    try:
        for finished in asyncio.as_completed(tasks):
            local_idx, item, warning = await finished
            if warning:
                print(warning, file=sys.stderr)

            buffered[local_idx] = item
            while next_to_write in buffered:
                append_jsonl(output_path, buffered.pop(next_to_write))
                progress.update(1)
                next_to_write += 1
    finally:
        progress.close()


def compute_target_counts(total: int) -> dict[str, int]:
    if total <= 0:
        raise ValueError("--count must be > 0")

    if total == 1500:
        return {
            "contrastive": 600,
            "positive": 525,
            "adversarial": 225,
            "instruction": 150,
        }

    ratios = {
        "contrastive": 0.40,
        "positive": 0.35,
        "adversarial": 0.15,
        "instruction": 0.10,
    }
    base = {k: int(total * v) for k, v in ratios.items()}
    remainder = total - sum(base.values())

    ranked = sorted(ratios.items(), key=lambda item: (total * item[1]) - int(total * item[1]), reverse=True)
    idx = 0
    while remainder > 0:
        key = ranked[idx % len(ranked)][0]
        base[key] += 1
        idx += 1
        remainder -= 1

    if base["contrastive"] % 2 != 0:
        base["contrastive"] -= 1
        base["positive"] += 1

    return base


def build_plan(total_count: int, seed: int) -> list[dict[str, Any]]:
    rng = random.Random(seed)
    counts = compute_target_counts(total_count)
    plan: list[dict[str, Any]] = []

    pair_count = counts["contrastive"] // 2
    for _ in range(pair_count):
        pair_id = f"pair-{rng.getrandbits(48):012x}"
        plan.append({"type": "contrastive", "pair_id": pair_id, "variant": "A"})
        plan.append({"type": "contrastive", "pair_id": pair_id, "variant": "B"})

    for _ in range(counts["positive"]):
        plan.append({"type": "positive", "pair_id": None, "variant": None})

    for _ in range(counts["adversarial"]):
        plan.append({"type": "adversarial", "pair_id": None, "variant": None})

    for _ in range(counts["instruction"]):
        plan.append({"type": "instruction", "pair_id": None, "variant": None})

    rng.shuffle(plan)
    for i, item in enumerate(plan):
        item["domain_raw"] = DOMAINS[i % len(DOMAINS)]

    return plan


def count_existing_lines(path: Path) -> int:
    if not path.exists():
        return 0
    with path.open("r", encoding="utf-8") as handle:
        return sum(1 for line in handle if line.strip())


def append_jsonl(path: Path, item: dict[str, Any]) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(item, ensure_ascii=False) + "\n")


def validate_dataset(path: str) -> dict[str, Any]:
    dataset_path = Path(path)
    report: dict[str, Any] = {
        "total_examples": 0,
        "counts_per_type": {},
        "doc_length_violations": [],
        "contrastive_same_answer_pairs": [],
        "position_histogram_deciles": [0] * 10,
        "position_edge_bias_flag": False,
        "position_edge_ratio": 0.0,
        "malformed_metadata": [],
    }

    if not dataset_path.exists():
        report["error"] = "file_not_found"
        return report

    type_counter: Counter[str] = Counter()
    pair_answers: dict[str, dict[str, str]] = defaultdict(dict)
    p10_ratios: list[float] = []

    with dataset_path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue

            try:
                sample = json.loads(line)
            except json.JSONDecodeError:
                report["malformed_metadata"].append(
                    {"line": line_number, "error": "invalid_json"}
                )
                continue

            report["total_examples"] += 1

            metadata = sample.get("metadata")
            if not isinstance(metadata, dict):
                report["malformed_metadata"].append(
                    {"line": line_number, "error": "missing_metadata"}
                )
                continue

            missing = sorted(REQUIRED_METADATA_FIELDS - set(metadata.keys()))
            if missing:
                report["malformed_metadata"].append(
                    {"line": line_number, "error": "missing_fields", "fields": missing}
                )
                continue

            type_name = metadata.get("type")
            if isinstance(type_name, str):
                type_counter[type_name] += 1

            doc_len = metadata.get("doc_length_tokens")
            if not isinstance(doc_len, int):
                report["malformed_metadata"].append(
                    {
                        "line": line_number,
                        "error": "doc_length_not_int",
                        "value": doc_len,
                    }
                )
            else:
                if doc_len < 3500 or doc_len > 8000:
                    report["doc_length_violations"].append(
                        {"line": line_number, "doc_length_tokens": doc_len}
                    )

            p10_pos = metadata.get("p10_position_tokens")
            if isinstance(p10_pos, int) and isinstance(doc_len, int) and doc_len > 0:
                ratio = p10_pos / doc_len
                ratio = max(0.0, min(0.999999, ratio))
                p10_ratios.append(ratio)
                bucket = min(9, int(ratio * 10))
                report["position_histogram_deciles"][bucket] += 1

            if metadata.get("type") == "contrastive":
                pair_id = metadata.get("pair_id")
                variant = metadata.get("variant")
                assistant_answer = ""
                messages = sample.get("messages")
                if isinstance(messages, list) and len(messages) >= 2 and isinstance(messages[1], dict):
                    assistant_answer = str(messages[1].get("content", "")).strip()

                if isinstance(pair_id, str) and isinstance(variant, str):
                    pair_answers[pair_id][variant] = assistant_answer

    report["counts_per_type"] = dict(type_counter)

    for pair_id, answers in pair_answers.items():
        if "A" in answers and "B" in answers and answers["A"] == answers["B"]:
            report["contrastive_same_answer_pairs"].append(pair_id)

    if p10_ratios:
        edge_count = sum(1 for r in p10_ratios if r <= 0.1 or r >= 0.9)
        edge_ratio = edge_count / len(p10_ratios)
        report["position_edge_ratio"] = round(edge_ratio, 4)
        report["position_edge_bias_flag"] = edge_ratio > 0.30

    return report


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate tagged training dataset JSONL")
    parser.add_argument("--output", type=str, default="dataset.jsonl", help="Output JSONL path")
    parser.add_argument("--count", type=int, default=1500, help="Total examples to generate")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument(
        "--concurrency",
        type=int,
        default=4,
        help="Number of concurrent example generation workers",
    )
    return parser.parse_args()


async def run(args: argparse.Namespace) -> int:
    output_path = Path(args.output)

    try:
        plan = build_plan(total_count=args.count, seed=args.seed)
    except ValueError as exc:
        print(f"Invalid arguments: {exc}", file=sys.stderr)
        return 2

    completed = count_existing_lines(output_path)
    if completed > args.count:
        print(
            f"Output file already has {completed} lines, which exceeds --count {args.count}.",
            file=sys.stderr,
        )
        return 2

    pending_plan = plan[completed:]

    if pending_plan:
        concurrency = max(1, args.concurrency)
        await _generate_pending_examples(
            output_path=output_path,
            pending_plan=pending_plan,
            completed=completed,
            total=args.count,
            seed=args.seed,
            concurrency=concurrency,
        )

    report = validate_dataset(str(output_path))
    print(json.dumps(report, indent=2, ensure_ascii=False))

    return 0


def main() -> int:
    args = parse_args()
    return asyncio.run(run(args))


if __name__ == "__main__":
    raise SystemExit(main())
