#!/usr/bin/env python3
"""Keep the usability protocol and result template aligned with the 50-question gate."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROTOCOL = ROOT / "research" / "USABILITY_TEST_PROTOCOL_2026-10-03.md"
TEMPLATE = ROOT / "research" / "usability-results" / "TEMPLATE.md"


def fail(message: str) -> None:
    raise SystemExit(message)


def main() -> None:
    protocol = PROTOCOL.read_text(encoding="utf-8")
    template = TEMPLATE.read_text(encoding="utf-8")

    if "50-question first release" not in protocol:
        fail("Usability protocol must target the 50-question first release.")

    if re.search(r"15-question|beyond 15|15-question seed", protocol, flags=re.I):
        fail("Usability protocol still contains stale 15-question gate language.")

    task_pattern = re.compile(r"^### Task ([A-E]) — (.+)$", re.M)
    protocol_tasks = task_pattern.findall(protocol)
    if [letter for letter, _ in protocol_tasks] != list("ABCDE"):
        fail(f"Protocol tasks must be exactly A-E; found {protocol_tasks!r}")

    template_pattern = re.compile(r"^\| ([A-E]) — ([^|]+?) \|", re.M)
    template_tasks = [(letter, title.strip()) for letter, title in template_pattern.findall(template)]

    if protocol_tasks != template_tasks:
        fail(
            "Protocol/template task names differ. "
            f"protocol={protocol_tasks!r} template={template_tasks!r}"
        )

    required_themes = {
        "Deep Research comparison",
        "spreadsheet editing / analysis",
        "media / app creation",
        "real-time voice comparison",
    }
    titles = {title for _, title in protocol_tasks}
    missing = required_themes - titles
    if missing:
        fail(f"Usability protocol is missing required post-50 themes: {sorted(missing)}")

    required_fields = {
        "products_reached",
        "cross_product_comparison_completed",
        "evidence_state_found",
        "last_checked_found",
    }
    missing_fields = {field for field in required_fields if field not in protocol or field not in template}
    if missing_fields:
        fail(f"Usability assets are missing required fields: {sorted(missing_fields)}")

    print("Usability protocol/template alignment checks passed.")


if __name__ == "__main__":
    main()
