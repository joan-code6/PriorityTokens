from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from common import DEFAULT_DATA_DIR, ModelClient, answer_matches, build_prompt, common_parser, read_jsonl, write_json

VARIANTS = ("p10", "p5", "p1")


def evaluate_priority_ordering(
    model: str,
    seed: int = 42,
    data_path: Path | None = None,
) -> dict[str, Any]:
    path = data_path or (DEFAULT_DATA_DIR / "priority_ordering.jsonl")
    rows = read_jsonl(path)
    client = ModelClient(seed=seed)

    per_case: list[dict[str, Any]] = []
    variant_totals = {name: {"correct": 0, "total": 0} for name in VARIANTS}
    total_correct = 0
    total = 0
    triplets_respected = 0

    for row in rows:
        case_result: dict[str, Any] = {
            "case_id": row["case_id"],
            "question": row["question"],
            "variants": {},
        }
        case_all_correct = True
        for variant in VARIANTS:
            prompt = build_prompt(row["documents"][variant], row["question"])
            prediction = client.generate(model=model, prompt=prompt)
            gold = row["gold_answers"][variant]
            is_correct = answer_matches(prediction=prediction, gold=gold)
            case_result["variants"][variant] = {
                "gold_answer": gold,
                "prediction": prediction,
                "correct": is_correct,
            }
            variant_totals[variant]["total"] += 1
            total += 1
            if is_correct:
                variant_totals[variant]["correct"] += 1
                total_correct += 1
            else:
                case_all_correct = False

        case_result["triplet_respected"] = case_all_correct
        if case_all_correct:
            triplets_respected += 1
        per_case.append(case_result)

    case_count = len(per_case)
    variant_accuracy = {
        key: (
            variant_totals[key]["correct"] / variant_totals[key]["total"]
            if variant_totals[key]["total"]
            else 0.0
        )
        for key in VARIANTS
    }
    return {
        "test_name": "priority_ordering",
        "model": model,
        "seed": seed,
        "dataset_path": str(path),
        "counts": {"cases": case_count, "prompts": total},
        "metrics": {
            "overall_accuracy": (total_correct / total) if total else 0.0,
            "triplet_accuracy": (triplets_respected / case_count) if case_count else 0.0,
            "variant_accuracy": variant_accuracy,
        },
        "cases": per_case,
    }


def main() -> int:
    parser = common_parser("Run priority ordering eval")
    parser.add_argument(
        "--data",
        type=str,
        default=str(DEFAULT_DATA_DIR / "priority_ordering.jsonl"),
        help="Path to priority ordering JSONL",
    )
    args = parser.parse_args()

    result = evaluate_priority_ordering(
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
