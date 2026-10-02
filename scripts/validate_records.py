#!/usr/bin/env python3
"""Validate Can AI Do This question records against the canonical JSON Schema."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "schemas" / "question.schema.json"
DEFAULT_DATA_DIR = ROOT / "data" / "questions"


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"{path}: invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}"
        ) from exc


def iter_default_records():
    return sorted(p for p in DEFAULT_DATA_DIR.glob("*.json") if p.is_file())


def format_path(error):
    if not error.path:
        return "$"
    out = "$"
    for part in error.path:
        out += f"[{part}]" if isinstance(part, int) else f".{part}"
    return out


def validate(paths):
    schema = load_json(SCHEMA_PATH)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())

    failures = 0
    seen_ids = {}
    seen_slugs = {}

    for path in paths:
        try:
            record = load_json(path)
        except ValueError as exc:
            print(f"ERROR {exc}", file=sys.stderr)
            failures += 1
            continue

        errors = sorted(
            validator.iter_errors(record),
            key=lambda err: (list(err.absolute_path), err.message),
        )

        if errors:
            failures += 1
            print(f"INVALID {path.relative_to(ROOT)}", file=sys.stderr)
            for error in errors:
                print(
                    f"  {format_path(error)}: {error.message}",
                    file=sys.stderr,
                )
            continue

        record_id = record["id"]
        slug = record["slug"]

        if record_id in seen_ids:
            failures += 1
            print(
                f"DUPLICATE ID {record_id}: "
                f"{seen_ids[record_id].relative_to(ROOT)} and {path.relative_to(ROOT)}",
                file=sys.stderr,
            )
        else:
            seen_ids[record_id] = path

        if slug in seen_slugs:
            failures += 1
            print(
                f"DUPLICATE SLUG {slug}: "
                f"{seen_slugs[slug].relative_to(ROOT)} and {path.relative_to(ROOT)}",
                file=sys.stderr,
            )
        else:
            seen_slugs[slug] = path

        print(f"OK {path.relative_to(ROOT)}")

    return failures


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "paths",
        nargs="*",
        type=Path,
        help="Optional record paths. Defaults to data/questions/*.json.",
    )
    args = parser.parse_args()

    paths = [p.resolve() for p in args.paths] if args.paths else iter_default_records()
    if not paths:
        print("ERROR no JSON question records found", file=sys.stderr)
        return 2

    failures = validate(paths)
    if failures:
        print(f"Validation failed: {failures} problem(s).", file=sys.stderr)
        return 1

    print(f"Validation passed: {len(paths)} record(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
