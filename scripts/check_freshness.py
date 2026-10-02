#!/usr/bin/env python3
"""Report canonical capability records that are approaching or past review due dates."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "questions"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def default_records():
    return sorted(path for path in DATA_DIR.glob("*.json") if path.is_file())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="*", type=Path)
    parser.add_argument("--as-of", type=date.fromisoformat, default=date.today())
    parser.add_argument("--warning-days", type=int, default=3)
    parser.add_argument("--fail-on-due", action="store_true")
    args = parser.parse_args()

    if args.warning_days < 0:
        parser.error("--warning-days must be >= 0")

    paths = [path.resolve() for path in args.paths] if args.paths else default_records()
    if not paths:
        print("ERROR no question records found", file=sys.stderr)
        return 2

    due = []
    upcoming = []
    healthy = []
    structural = []

    for path in paths:
        record = load_json(path)
        record_id = record.get("id", path.name)
        checked_raw = record.get("last_checked")
        window = record.get("review_window_days")
        answer_dates = [
            date.fromisoformat(answer["last_checked"])
            for answer in record.get("answers", [])
            if answer.get("last_checked")
        ]

        if not checked_raw or window not in (14, 30) or not answer_dates:
            structural.append(f"{record_id}: missing/invalid freshness policy or answer date")
            continue

        checked = min(answer_dates)
        next_review = checked + timedelta(days=window)
        days_left = (next_review - args.as_of).days
        item = (record_id, checked, window, next_review, days_left, record.get("status"))

        if days_left <= 0:
            due.append(item)
        elif days_left <= args.warning_days:
            upcoming.append(item)
        else:
            healthy.append(item)

    print(f"Freshness as of {args.as_of.isoformat()}")
    print(f"Records: {len(paths)} | due: {len(due)} | upcoming: {len(upcoming)} | healthy: {len(healthy)}")

    for label, items in (("DUE", due), ("SOON", upcoming)):
        for record_id, checked, window, next_review, days_left, status in items:
            print(
                f"{label} {record_id} oldest_answer_checked={checked.isoformat()} "
                f"window={window}d next_review={next_review.isoformat()} "
                f"days_left={days_left} status={status}"
            )

    for message in structural:
        print(f"ERROR {message}", file=sys.stderr)

    if structural:
        return 2
    if due and args.fail_on_due:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
