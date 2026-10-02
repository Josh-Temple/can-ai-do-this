#!/usr/bin/env python3
"""Check high-change official sources for semantic anchor drift.

This watcher is intentionally conservative:
- semantic anchor loss or permanent 404/410 => review required;
- transient/network failures => warning only;
- it never updates capability conclusions or freshness dates.
"""

from __future__ import annotations

import argparse
import json
import sys
import unicodedata
import urllib.error
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "monitoring" / "source-watch.json"
DATA_DIR = ROOT / "data" / "questions"


class VisibleTextParser(HTMLParser):
    SKIP_TAGS = {"script", "style", "noscript", "svg"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag.lower() in self.SKIP_TAGS:
            self.skip_depth += 1

    def handle_endtag(self, tag):
        if tag.lower() in self.SKIP_TAGS and self.skip_depth:
            self.skip_depth -= 1

    def handle_data(self, data):
        if not self.skip_depth and data.strip():
            self.parts.append(data)


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def normalize(value):
    return " ".join(
        unicodedata.normalize("NFKC", str(value or "")).lower().split()
    )


def html_to_text(content):
    parser = VisibleTextParser()
    parser.feed(content)
    return normalize(" ".join(parser.parts))


def load_content_map(path):
    if not path:
        return None
    return load_json(path)


def fetch_source(source, content_map, timeout):
    if content_map is not None:
        item = content_map.get(source["id"])
        if item is None:
            return {"status": None, "text": "", "error": "fixture missing source id"}
        return {
            "status": item.get("status", 200),
            "text": normalize(item.get("content", "")),
            "error": item.get("error"),
        }

    request = urllib.request.Request(
        source["url"],
        headers={
            "User-Agent": (
                "Can-AI-Do-This source-watch/1.0 "
                "(https://github.com/Josh-Temple/can-ai-do-this)"
            ),
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            status = getattr(response, "status", 200)
            charset = response.headers.get_content_charset() or "utf-8"
            raw = response.read().decode(charset, errors="replace")
            return {"status": status, "text": html_to_text(raw), "error": None}
    except urllib.error.HTTPError as exc:
        return {"status": exc.code, "text": "", "error": f"HTTP {exc.code}"}
    except Exception as exc:
        return {"status": None, "text": "", "error": f"{type(exc).__name__}: {exc}"}


def validate_config(config, skip_coverage):
    errors = []
    seen = set()
    covered = set()

    if config.get("version") != 1:
        errors.append("config.version must be 1")

    sources = config.get("sources")
    if not isinstance(sources, list) or not sources:
        errors.append("config.sources must be a non-empty list")
        return errors

    for source in sources:
        source_id = source.get("id")
        if not source_id:
            errors.append("every source requires id")
            continue
        if source_id in seen:
            errors.append(f"duplicate source id: {source_id}")
        seen.add(source_id)

        if not source.get("url"):
            errors.append(f"{source_id}: missing url")

        questions = source.get("questions") or []
        if not questions:
            errors.append(f"{source_id}: questions must be non-empty")
        covered.update(questions)

        groups = source.get("anchor_groups") or []
        if not groups:
            errors.append(f"{source_id}: anchor_groups must be non-empty")
        for index, group in enumerate(groups):
            if not isinstance(group, list) or not any(str(item).strip() for item in group):
                errors.append(f"{source_id}: anchor_groups[{index}] must contain alternatives")

    if not skip_coverage:
        canonical = {}
        for path in sorted(DATA_DIR.glob("*.json")):
            record = load_json(path)
            canonical[record["id"]] = record

        unknown = sorted(covered - set(canonical))
        if unknown:
            errors.append(f"source watch references unknown question ids: {unknown}")

        required = {
            record_id
            for record_id, record in canonical.items()
            if record.get("status") == "PUBLISHED"
            and record.get("review_window_days") == 14
        }
        missing = sorted(required - covered)
        if missing:
            errors.append(
                "14-day published questions missing source-watch coverage: "
                + ", ".join(missing)
            )

    return errors


def evaluate_source(source, fetched, policy):
    status = fetched["status"]
    text = fetched["text"]
    error = fetched["error"]
    permanent = set(policy.get("permanent_http_statuses", [404, 410]))
    transient = set(policy.get("transient_http_statuses", []))
    min_chars = int(policy.get("min_text_chars", 500))

    if status in permanent:
        return {
            "id": source["id"],
            "url": source["url"],
            "questions": source["questions"],
            "state": "CHANGED",
            "reason": f"permanent HTTP status {status}",
            "missing_groups": [],
        }

    if status is None or status in transient or (status and status >= 400):
        return {
            "id": source["id"],
            "url": source["url"],
            "questions": source["questions"],
            "state": "UNAVAILABLE",
            "reason": error or f"HTTP status {status}",
            "missing_groups": [],
        }

    if len(text) < min_chars:
        return {
            "id": source["id"],
            "url": source["url"],
            "questions": source["questions"],
            "state": "UNAVAILABLE",
            "reason": f"extracted text too short ({len(text)} chars)",
            "missing_groups": [],
        }

    missing = []
    for group in source["anchor_groups"]:
        alternatives = [normalize(item) for item in group if str(item).strip()]
        if not any(item in text for item in alternatives):
            missing.append(group)

    if missing:
        return {
            "id": source["id"],
            "url": source["url"],
            "questions": source["questions"],
            "state": "CHANGED",
            "reason": "one or more semantic anchor groups disappeared",
            "missing_groups": missing,
        }

    return {
        "id": source["id"],
        "url": source["url"],
        "questions": source["questions"],
        "state": "OK",
        "reason": "semantic anchors present",
        "missing_groups": [],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--content-map", type=Path)
    parser.add_argument("--json-output", type=Path)
    parser.add_argument("--timeout", type=float, default=20.0)
    parser.add_argument("--lint-only", action="store_true")
    parser.add_argument("--skip-coverage", action="store_true")
    args = parser.parse_args()

    config = load_json(args.config)
    errors = validate_config(config, args.skip_coverage)
    if errors:
        for error in errors:
            print(f"ERROR {error}", file=sys.stderr)
        return 2

    if args.lint_only:
        print(
            f"Source-watch config valid: {len(config['sources'])} source(s); "
            "14-day coverage complete."
        )
        return 0

    content_map = load_content_map(args.content_map)
    results = []
    for source in config["sources"]:
        fetched = fetch_source(source, content_map, args.timeout)
        result = evaluate_source(source, fetched, config.get("policy") or {})
        results.append(result)
        questions = ",".join(result["questions"])
        print(
            f"{result['state']:11} {result['id']} "
            f"questions={questions} reason={result['reason']}"
        )
        for group in result["missing_groups"]:
            print(f"  missing alternatives: {group}")

    changed = [item for item in results if item["state"] == "CHANGED"]
    unavailable = [item for item in results if item["state"] == "UNAVAILABLE"]
    ok = [item for item in results if item["state"] == "OK"]

    payload = {
        "summary": {
            "total": len(results),
            "ok": len(ok),
            "changed": len(changed),
            "unavailable": len(unavailable),
        },
        "results": results,
    }

    if args.json_output:
        args.json_output.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    print(
        "Summary: "
        f"total={len(results)} ok={len(ok)} "
        f"changed={len(changed)} unavailable={len(unavailable)}"
    )

    return 1 if changed else 0


if __name__ == "__main__":
    raise SystemExit(main())
