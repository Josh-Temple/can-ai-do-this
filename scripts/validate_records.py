#!/usr/bin/env python3
"""Validate Can AI Do This question records against the canonical JSON Schema."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
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


def semantic_errors(record):
    errors = []

    if record.get("status") == "PUBLISHED":
        if not str(record.get("question_ja") or "").strip():
            errors.append("$.question_ja: required for PUBLISHED records")
        if not record.get("search_terms"):
            errors.append("$.search_terms: at least one task alias is required for PUBLISHED records")

        for index, answer in enumerate(record.get("answers", [])):
            prefix = f"$.answers[{index}]"
            if answer.get("summary") and not str(answer.get("summary_ja") or "").strip():
                errors.append(f"{prefix}.summary_ja: required when summary is present")

            conditions = answer.get("conditions") or []
            conditions_ja = answer.get("conditions_ja") or []
            if conditions and len(conditions_ja) != len(conditions):
                errors.append(
                    f"{prefix}.conditions_ja: expected {len(conditions)} translated item(s), "
                    f"found {len(conditions_ja)}"
                )

            limitations = answer.get("limitations") or []
            limitations_ja = answer.get("limitations_ja") or []
            if limitations and len(limitations_ja) != len(limitations):
                errors.append(
                    f"{prefix}.limitations_ja: expected {len(limitations)} translated item(s), "
                    f"found {len(limitations_ja)}"
                )

    record_checked = date.fromisoformat(record["last_checked"])
    for index, answer in enumerate(record.get("answers", [])):
        answer_checked = date.fromisoformat(answer["last_checked"])
        prefix = f"$.answers[{index}]"
        evidence_state = answer.get("evidence_state")

        if answer_checked > record_checked:
            errors.append(
                f"{prefix}.last_checked: cannot be later than record last_checked "
                f"({record['last_checked']})"
            )

        direct_test_dates = []
        for source_index, source in enumerate(answer.get("sources", [])):
            accessed = date.fromisoformat(source["accessed_at"])
            source_prefix = f"{prefix}.sources[{source_index}]"

            if accessed > record_checked:
                errors.append(
                    f"{source_prefix}.accessed_at: cannot be later than record last_checked "
                    f"({record['last_checked']})"
                )

            if source["type"] == "DIRECT_TEST":
                direct_test_dates.append(accessed)
                if accessed > answer_checked:
                    errors.append(
                        f"{source_prefix}.accessed_at: cannot be later than "
                        f"answer last_checked ({answer['last_checked']})"
                    )
            elif evidence_state != "VERIFIED" and accessed > answer_checked:
                errors.append(
                    f"{source_prefix}.accessed_at: cannot be later than "
                    f"answer last_checked ({answer['last_checked']})"
                )

        source_types = {source["type"] for source in answer.get("sources", [])}

        if evidence_state == "DOCUMENTED" and not (
            {"OFFICIAL_DOC", "OFFICIAL_ANNOUNCEMENT"} & source_types
        ):
            errors.append(
                f"{prefix}.evidence_state: DOCUMENTED requires an official first-party source"
            )

        if evidence_state == "VERIFIED":
            if "DIRECT_TEST" not in source_types:
                errors.append(
                    f"{prefix}.evidence_state: VERIFIED requires a DIRECT_TEST source"
                )
            if not answer.get("tested_environment"):
                errors.append(
                    f"{prefix}.tested_environment: required for VERIFIED evidence"
                )
            if direct_test_dates and answer_checked != max(direct_test_dates):
                errors.append(
                    f"{prefix}.last_checked: VERIFIED answers must equal the most recent "
                    "DIRECT_TEST accessed_at; documentation re-reads must not refresh "
                    "direct-test freshness"
                )

        if evidence_state == "USER_REPORTED" and not (
            {"COMMUNITY", "SECONDARY"} & source_types
        ):
            errors.append(
                f"{prefix}.evidence_state: USER_REPORTED requires a report-oriented source"
            )

        if answer.get("answer") == "NO" and not (answer.get("limitations") or []):
            errors.append(
                f"{prefix}.limitations: a NO answer must state the basis for the negative claim"
            )

    return errors


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

        semantics = semantic_errors(record)
        if semantics:
            failures += 1
            print(f"INVALID {path.relative_to(ROOT)}", file=sys.stderr)
            for message in semantics:
                print(f"  {message}", file=sys.stderr)
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
