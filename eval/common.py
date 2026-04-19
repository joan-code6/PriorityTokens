from __future__ import annotations

import argparse
import json
import os
import re
import string
import urllib.request
from pathlib import Path
from typing import Any

import dotenv

dotenv.load_dotenv()

try:
    from openrouter import OpenRouter
except Exception:  # noqa: BLE001
    OpenRouter = None  # type: ignore[assignment]

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA_DIR = PROJECT_ROOT / "data" / "eval"


def default_server_url() -> str:
    if os.getenv("PROVIDER") == "hai":
        return "https://ai.hackclub.com/proxy/v1"
    return "https://openrouter.ai/api/v1"


class ModelClient:
    def __init__(self, seed: int = 42) -> None:
        self.seed = seed
        self.api_key = os.getenv("API_KEY")
        self.server_url = default_server_url()
        self.client: Any | None = None

        if self.api_key and OpenRouter is not None:
            self.client = OpenRouter(
                api_key=self.api_key,
                server_url=self.server_url,
            )

    def _send_http(self, model: str, prompt: str, max_tokens: int) -> str:
        if not self.api_key:
            raise RuntimeError("Missing API_KEY in environment")

        payload = {
            "model": model,
            "temperature": 0,
            "top_p": 1,
            "seed": self.seed,
            "max_tokens": max_tokens,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You answer with the final answer only. "
                        "Be concise and avoid extra explanation."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
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

        with urllib.request.urlopen(request, timeout=180) as response:
            raw = response.read().decode("utf-8")
        parsed = json.loads(raw)
        content = parsed["choices"][0]["message"]["content"]
        if isinstance(content, list):
            parts = []
            for item in content:
                if isinstance(item, dict) and "text" in item:
                    parts.append(str(item["text"]))
                else:
                    parts.append(str(item))
            text = "\n".join(parts).strip()
        else:
            text = str(content).strip()
        if not text:
            raise RuntimeError("Empty response from model API")
        return text

    def _send_openrouter(self, model: str, prompt: str, max_tokens: int) -> str:
        if self.client is None:
            raise RuntimeError("OpenRouter SDK unavailable")
        response = self.client.chat.send(
            model=model,
            temperature=0,
            top_p=1,
            max_tokens=max_tokens,
            reasoning=False,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You answer with the final answer only. "
                        "Be concise and avoid extra explanation."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        )
        content = response.choices[0].message.content
        if isinstance(content, list):
            text = "\n".join(str(item) for item in content).strip()
        else:
            text = str(content).strip()
        if not text:
            raise RuntimeError("Empty response from OpenRouter SDK")
        return text

    def generate(self, model: str, prompt: str, max_tokens: int = 96) -> str:
        if self.client is not None:
            return self._send_openrouter(model=model, prompt=prompt, max_tokens=max_tokens)
        return self._send_http(model=model, prompt=prompt, max_tokens=max_tokens)


def build_prompt(document: str, question: str) -> str:
    return (
        "Read the document and answer the question.\n\n"
        f"{document.strip()}\n\n"
        f"Question: {question.strip()}\n"
        "Answer:"
    )


def normalize_text(text: str) -> str:
    lowered = text.strip().lower()
    lowered = re.sub(r"\s+", " ", lowered)
    trans = str.maketrans("", "", string.punctuation)
    return lowered.translate(trans).strip()


def answer_matches(prediction: str, gold: str, aliases: list[str] | None = None) -> bool:
    pred_norm = normalize_text(prediction)
    candidates = [gold] + (aliases or [])
    for candidate in candidates:
        cand_norm = normalize_text(candidate)
        if not cand_norm:
            continue
        if cand_norm == pred_norm or cand_norm in pred_norm:
            return True
    return False


def read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def write_json(path: Path, obj: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(obj, handle, indent=2, ensure_ascii=False)


def common_parser(description: str) -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("--model", required=True, help="Model id or path")
    parser.add_argument("--seed", type=int, default=42, help="Deterministic seed")
    parser.add_argument("--output", type=str, default="", help="Optional output JSON path")
    return parser
