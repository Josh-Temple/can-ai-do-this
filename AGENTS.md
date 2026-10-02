# AGENTS.md

## Purpose

This repository answers real-world questions about what AI tools can actually do.

The repository is a knowledge base first and a website second. Preserve source traceability, uncertainty, and freshness.

## Core rules

1. Start from a user task or question, not from a product feature list.
2. Never convert a community claim into a factual capability claim without independent support.
3. Prefer first-party documentation for product capabilities.
4. Record direct testing separately from documentation.
5. Record plan, platform, region, date, and prerequisites whenever they affect the answer.
6. Do not infer that a capability on one plan, platform, region, or model applies to another.
7. If evidence conflicts, preserve the conflict and explain it.
8. Do not reproduce large amounts of Reddit or other community content. Store the URL, date observed, a short original summary, and any useful metadata.
9. A broken or stale source is a data-quality issue, not a reason to silently delete history.
10. Every material current-state answer must have a last-checked date.

## Allowed evidence states

- VERIFIED
- DOCUMENTED
- USER_REPORTED
- STALE

Do not invent additional status labels without updating the schema and methodology.

## Research workflow

For a new question:

1. Normalize the question into a concrete task.
2. Record why the question appears useful or demanded.
3. Search official documentation for each relevant product.
4. Record the exact conditions and limitations.
5. If direct testing is available, test only within the stated environment.
6. Add community links only when they add demand evidence, edge cases, or failure reports.
7. Write a concise answer that distinguishes facts from reports and unknowns.
8. Set `review_window_days` to 14 or 30 using the freshness rules in `docs/METHODOLOGY.md`.
9. Validate against `schemas/question.schema.json`.

## Community-source handling

Reddit and similar communities are primarily demand-discovery and edge-case sources.

Do not:
- scrape or republish large bodies of user content;
- treat upvotes as proof of correctness;
- copy personal data that is unnecessary to the capability question;
- preserve deleted content merely because it was previously captured.

Prefer linking to the original discussion.

## Current source of truth

Structured question records under `data/questions/` are canonical for published capability claims. Narrative pages and future website views should be generated from or traceable to those records.
