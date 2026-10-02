#!/usr/bin/env python3
"""Regression-check task search against canonical question records."""

from __future__ import annotations

import argparse
import json
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "questions"
DEFAULT_CASES = ROOT / "tests" / "search-cases.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def normalize(value):
    return unicodedata.normalize("NFKC", str(value or "")).lower()


def searchable_text(record):
    values = [
        record.get("id"),
        record.get("question"),
        record.get("question_ja"),
        record.get("category"),
        *(record.get("search_terms") or []),
        (record.get("demand") or {}).get("summary"),
        (record.get("demand") or {}).get("summary_ja"),
    ]
    for answer in record.get("answers", []):
        values.extend(
            [
                answer.get("product"),
                answer.get("plan"),
                answer.get("platform"),
                answer.get("region"),
                answer.get("answer"),
                answer.get("summary"),
                answer.get("summary_ja"),
                *(answer.get("conditions") or []),
                *(answer.get("conditions_ja") or []),
                *(answer.get("limitations") or []),
                *(answer.get("limitations_ja") or []),
            ]
        )
    return normalize(" ".join(str(value) for value in values if value))


def matches(record, query):
    tokens = [token for token in normalize(query).split() if token]
    haystack = searchable_text(record)
    return all(token in haystack for token in tokens)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES)
    args = parser.parse_args()

    records = [
        load_json(path)
        for path in sorted(DATA_DIR.glob("*.json"))
        if path.is_file()
    ]
    by_id = {record["id"]: record for record in records}
    failures = 0

    payload = load_json(args.cases)
    for case in payload["cases"]:
        query = case["query"]
        found = [record["id"] for record in records if matches(record, query)]
        missing = [record_id for record_id in case.get("must_include", []) if record_id not in found]
        forbidden = [record_id for record_id in case.get("must_exclude", []) if record_id in found]

        unknown = [
            record_id
            for record_id in case.get("must_include", []) + case.get("must_exclude", [])
            if record_id not in by_id
        ]

        if missing or forbidden or unknown:
            failures += 1
            print(f"FAIL {query!r} -> {found}", file=sys.stderr)
            if missing:
                print(f"  missing required: {missing}", file=sys.stderr)
            if forbidden:
                print(f"  included forbidden: {forbidden}", file=sys.stderr)
            if unknown:
                print(f"  unknown case ids: {unknown}", file=sys.stderr)
        else:
            print(f"OK   {query!r} -> {found}")

    if failures:
        print(f"Search regression failed: {failures} case(s).", file=sys.stderr)
        return 1

    print(f"Search regression passed: {len(payload['cases'])} case(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
