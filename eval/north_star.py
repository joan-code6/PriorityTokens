from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from common import DEFAULT_DATA_DIR, ModelClient, answer_matches, build_prompt, common_parser, read_json, write_json


def evaluate_north_star(model: str, seed: int = 42, data_path: Path | None = None) -> dict[str, Any]:
    path = data_path or (DEFAULT_DATA_DIR / "north_star.json")
    item = read_json(path)
    client = ModelClient(seed=seed)
    prompt = build_prompt(item["document"], item["question"])
    prediction = client.generate(model=model, prompt=prompt)
    is_correct = answer_matches(
        prediction=prediction,
        gold=item["answer"],
        aliases=item.get("answer_aliases", []),
    )
    return {
        "test_name": "north_star",
        "model": model,
        "seed": seed,
        "dataset_path": str(path),
        "case_id": item["case_id"],
        "question": item["question"],
        "gold_answer": item["answer"],
        "prediction": prediction,
        "correct": is_correct,
        "accuracy": 1.0 if is_correct else 0.0,
    }


def main() -> int:
    parser = common_parser("Run north star eval")
    parser.add_argument(
        "--data",
        type=str,
        default=str(DEFAULT_DATA_DIR / "north_star.json"),
        help="Path to north star JSON",
    )
    args = parser.parse_args()

    result = evaluate_north_star(
        model=args.model,
        seed=args.seed,
        data_path=Path(args.data),
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
    if args.output:
        write_json(Path(args.output), result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
