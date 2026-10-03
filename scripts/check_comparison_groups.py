#!/usr/bin/env python3
"""Validate canonical cross-product comparison relations."""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS_DIR = ROOT / "data" / "questions"
GROUPS_PATH = ROOT / "data" / "comparison-groups.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    payload = load_json(GROUPS_PATH)
    groups = payload.get("groups")
    if payload.get("version") != 1 or not isinstance(groups, list):
        print("comparison-groups.json must have version=1 and a groups array.", file=sys.stderr)
        return 1

    records = {
        record["id"]: record
        for path in sorted(QUESTIONS_DIR.glob("*.json"))
        if (record := load_json(path))
    }

    failures = []
    seen_group_ids = set()
    membership = defaultdict(list)

    for group in groups:
        group_id = group.get("id")
        label = group.get("label_ja")
        question_ids = group.get("question_ids")

        if not isinstance(group_id, str) or not group_id:
            failures.append("group id must be a non-empty string")
            continue
        if group_id in seen_group_ids:
            failures.append(f"duplicate group id: {group_id}")
        seen_group_ids.add(group_id)

        if not isinstance(label, str) or not label.strip():
            failures.append(f"{group_id}: label_ja must be non-empty")
        if not isinstance(question_ids, list) or len(question_ids) < 2:
            failures.append(f"{group_id}: question_ids must contain at least two ids")
            continue
        if question_ids != sorted(question_ids):
            failures.append(f"{group_id}: question_ids must be sorted")
        if len(question_ids) != len(set(question_ids)):
            failures.append(f"{group_id}: duplicate question id")

        missing = [question_id for question_id in question_ids if question_id not in records]
        if missing:
            failures.append(f"{group_id}: unknown question ids {missing}")
            continue

        group_records = [records[question_id] for question_id in question_ids]
        unpublished = [record["id"] for record in group_records if record.get("status") != "PUBLISHED"]
        if unpublished:
            failures.append(f"{group_id}: non-published members {unpublished}")

        categories = {record.get("category") for record in group_records}
        if len(categories) != 1:
            failures.append(f"{group_id}: mixed categories {sorted(categories)}")

        products = {
            answer.get("product")
            for record in group_records
            for answer in record.get("answers", [])
            if answer.get("product")
        }
        if len(products) < 2:
            failures.append(f"{group_id}: must compare at least two distinct products")

        for question_id in question_ids:
            membership[question_id].append(group_id)

    ambiguous = {qid: gids for qid, gids in membership.items() if len(gids) > 1}
    if ambiguous:
        failures.append(f"questions belong to multiple comparison groups: {ambiguous}")

    if failures:
        for failure in failures:
            print(f"FAIL {failure}", file=sys.stderr)
        return 1

    print(
        f"Comparison groups passed: {len(groups)} groups, "
        f"{len(membership)} explicitly grouped questions."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
