from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from common import DEFAULT_DATA_DIR, ModelClient, answer_matches, common_parser, read_jsonl, write_json


def evaluate_regression(
    model: str,
    seed: int = 42,
    data_path: Path | None = None,
) -> dict[str, Any]:
    path = data_path or (DEFAULT_DATA_DIR / "regression_set.jsonl")
    rows = read_jsonl(path)
    client = ModelClient(seed=seed)

    per_case: list[dict[str, Any]] = []
    correct = 0
    for row in rows:
        prompt = f"Answer the question directly.\nQuestion: {row['question']}\nAnswer:"
        prediction = client.generate(model=model, prompt=prompt)
        is_correct = answer_matches(
            prediction=prediction,
            gold=row["answer"],
            aliases=row.get("answer_aliases", []),
        )
        if is_correct:
            correct += 1
        per_case.append(
            {
                "case_id": row["case_id"],
                "question": row["question"],
                "gold_answer": row["answer"],
                "prediction": prediction,
                "correct": is_correct,
            }
        )

    total = len(rows)
    return {
        "test_name": "regression",
        "model": model,
        "seed": seed,
        "dataset_path": str(path),
        "counts": {"cases": total},
        "metrics": {
            "accuracy": (correct / total) if total else 0.0,
            "correct": correct,
            "total": total,
        },
        "cases": per_case,
    }


def main() -> int:
    parser = common_parser("Run no-tag regression eval")
    parser.add_argument(
        "--data",
        type=str,
        default=str(DEFAULT_DATA_DIR / "regression_set.jsonl"),
        help="Path to regression eval JSONL",
    )
    args = parser.parse_args()

    result = evaluate_regression(
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
