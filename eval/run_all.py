from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from common import PROJECT_ROOT, write_json
from north_star import evaluate_north_star
from priority_ordering import evaluate_priority_ordering
from recall_accuracy import evaluate_recall_accuracy
from regression import evaluate_regression


def summarize(results: dict[str, dict[str, Any]]) -> dict[str, Any]:
    return {
        "north_star_accuracy": results["north_star"]["accuracy"],
        "priority_ordering_overall_accuracy": results["priority_ordering"]["metrics"]["overall_accuracy"],
        "priority_ordering_triplet_accuracy": results["priority_ordering"]["metrics"]["triplet_accuracy"],
        "recall_accuracy": results["recall_accuracy"]["metrics"]["accuracy"],
        "regression_accuracy": results["regression"]["metrics"]["accuracy"],
        "macro_average_accuracy": (
            results["north_star"]["accuracy"]
            + results["priority_ordering"]["metrics"]["overall_accuracy"]
            + results["recall_accuracy"]["metrics"]["accuracy"]
            + results["regression"]["metrics"]["accuracy"]
        )
        / 4.0,
    }


def run_suite(model: str, seed: int) -> dict[str, Any]:
    north_star = evaluate_north_star(model=model, seed=seed)
    priority_ordering = evaluate_priority_ordering(model=model, seed=seed)
    recall = evaluate_recall_accuracy(model=model, seed=seed)
    regression = evaluate_regression(model=model, seed=seed)
    bundle = {
        "north_star": north_star,
        "priority_ordering": priority_ordering,
        "recall_accuracy": recall,
        "regression": regression,
    }
    return {"tests": bundle, "summary": summarize(bundle)}


def main() -> int:
    parser = argparse.ArgumentParser(description="Run full PriorityTokens eval suite")
    parser.add_argument("--model", required=True, help="Primary model id/path")
    parser.add_argument("--baseline", type=str, default="", help="Optional baseline model id/path")
    parser.add_argument("--seed", type=int, default=42, help="Deterministic seed")
    parser.add_argument(
        "--output",
        type=str,
        default="",
        help="Output result JSON path (defaults to eval/results/<run_name>.json)",
    )
    parser.add_argument("--run-name", type=str, default="baseline-qwen3-8b-v1", help="Result run name")
    args = parser.parse_args()

    output_path = Path(args.output) if args.output else (
        PROJECT_ROOT / "eval" / "results" / f"{args.run_name}.json"
    )

    result: dict[str, Any] = {
        "run_name": args.run_name,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "seed": args.seed,
        "primary_model": args.model,
        "primary": run_suite(model=args.model, seed=args.seed),
    }
    if args.baseline:
        result["baseline_model"] = args.baseline
        result["baseline"] = run_suite(model=args.baseline, seed=args.seed)

    write_json(output_path, result)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
