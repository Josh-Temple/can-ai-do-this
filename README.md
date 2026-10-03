# Can AI Do This?

[![Validate capability data](https://github.com/Josh-Temple/can-ai-do-this/actions/workflows/validate-data.yml/badge.svg)](https://github.com/Josh-Temple/can-ai-do-this/actions/workflows/validate-data.yml)
[![Deploy public site](https://github.com/Josh-Temple/can-ai-do-this/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Josh-Temple/can-ai-do-this/actions/workflows/deploy-pages.yml)
[![Freshness watch](https://github.com/Josh-Temple/can-ai-do-this/actions/workflows/freshness-watch.yml/badge.svg)](https://github.com/Josh-Temple/can-ai-do-this/actions/workflows/freshness-watch.yml)
[![Official source watch](https://github.com/Josh-Temple/can-ai-do-this/actions/workflows/source-watch.yml/badge.svg)](https://github.com/Josh-Temple/can-ai-do-this/actions/workflows/source-watch.yml)

**Evidence-based answers to real-world questions about what AI tools can actually do.**

**Live site:** https://josh-temple.github.io/can-ai-do-this/

AI products change quickly. Feature lists are usually organized around products, while users usually start with a task:

- Can AI summarize a large set of PDFs?
- Can ChatGPT work with Gmail?
- Can an AI edit a spreadsheet?
- Can an AI create a presentation?
- Can an AI run a task later without me keeping the chat open?

This repository turns those questions into structured, source-backed capability records.

## What this project is

The primary unit is a **task/question**, not an AI product.

For each question, the project aims to record:

- a concise answer;
- the conditions under which the answer is true;
- product, plan, platform, region, and date;
- official sources;
- independent verification when available;
- known limitations;
- relevant community discussions, including Reddit links when useful;
- freshness and verification status.

## Evidence states

- **VERIFIED** — reproduced directly in a stated environment.
- **DOCUMENTED** — supported by an official source but not independently reproduced here.
- **USER_REPORTED** — reported by a user or community source; not independently reproduced.
- **STALE** — evidence exists, but the record needs a fresh check.

A question may contain evidence at more than one level.

## Source priority

For current capability claims:

1. direct reproducible observation;
2. official documentation, help pages, release notes, or first-party announcements;
3. high-quality secondary reporting;
4. community reports such as Reddit.

Community discussions are useful for discovering real questions and edge cases. They are not treated as authoritative product documentation.

## Repository structure

```
data/
  questions/        # structured task-first records
docs/
  METHODOLOGY.md    # evidence, freshness, and research rules
  ROADMAP.md        # staged development plan
monitoring/
  source-watch.json # semantic official-source monitoring configuration
schemas/
  question.schema.json
scripts/
  build_site.py          # builds the static site from canonical records
  validate_records.py
  check_freshness.py      # review-window due-date checks
  check_search_cases.py   # task-search regression checks
  check_source_watch.py   # low-noise official-source review signals
site/                 # public comparison/search UI
templates/
  question.yaml
AGENTS.md             # instructions for AI-assisted research
CONTRIBUTING.md
```

## Initial scope

The first release focuses on common, concrete tasks performed with mainstream consumer AI products. The goal is not to rank models or declare an overall winner.

Initial coverage may include ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity. Coverage does **not** imply equal testing depth. Every record must state what was actually tested versus what is only documented.

## Design principles

- **Task-first:** start from what the person wants to accomplish.
- **Evidence-first:** separate claims from supporting sources.
- **Freshness-aware:** AI capability claims expire quickly.
- **No fake symmetry:** do not imply equivalent verification across products or plans.
- **Conditions matter:** plan, platform, region, permissions, and connected services can change the answer.
- **Useful over exhaustive:** a smaller set of well-supported answers is better than a giant shallow directory.
- **Link, do not ingest:** for community discussions, prefer links and concise summaries over reproducing user content.

## Status

The repository currently contains **50 published, source-backed questions** and a live static public site generated from the canonical JSON records. The interface is Japanese-first, with a simple comparison table, keyword search with task aliases, product filtering, dedicated question pages, and detailed evidence views.

The initial 10–15 question seed milestone is complete, followed by controlled expansion to a **50-question first release** covering ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity, Codex, and Claude Code. The final expansion adds cross-product coverage for real-time voice conversation and spreadsheet/CSV data analysis. From this point, question count is not an automatic growth target; priority shifts to usability validation, comparison UX, demand validation, freshness, and stronger VERIFIED evidence.

Public site: https://josh-temple.github.io/can-ai-do-this/

## Public feedback

The public site includes a lightweight feedback form. Submissions open a prefilled GitHub Issue so the user can review the text before sending it. The static site stores no GitHub write token and does not automatically copy search-query parameters into the issue.

Matching `[Site feedback]` issues are automatically classified as found, partial, or discovery-failure signals. These reports inform search, copy, navigation, comparison, and demand work; they are not capability evidence and do not replace the separate three-person usability gate.

Operational rules: `docs/FEEDBACK_OPERATIONS.md`.

> **Real questions. Official sources. Actual capabilities.**
