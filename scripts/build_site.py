#!/usr/bin/env python3
"""Build the static Can AI Do This site from canonical question records."""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITE_DIR = ROOT / "site"
DATA_DIR = ROOT / "data" / "questions"


def load_records():
    records = []
    for path in sorted(DATA_DIR.glob("*.json")):
        records.append(json.loads(path.read_text(encoding="utf-8")))
    records.sort(key=lambda record: record["id"])
    return records


def build(output: Path):
    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)

    for path in SITE_DIR.iterdir():
        if path.name == "README.md":
            continue
        if path.is_file():
            shutil.copy2(path, output / path.name)

    records = load_records()
    (output / "questions.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (output / ".nojekyll").write_text("", encoding="utf-8")

    print(f"Built {len(records)} question records into {output}")
    return len(records)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "dist",
        help="Output directory (default: ./dist)",
    )
    args = parser.parse_args()

    count = build(args.output.resolve())
    if count == 0:
        raise SystemExit("No canonical question records found.")


if __name__ == "__main__":
    main()
