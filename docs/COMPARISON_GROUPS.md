# Canonical comparison groups

## Purpose

`data/comparison-groups.json` is the canonical relation layer for the public “same task across products” navigation.

Question records remain task/evidence records. Comparison membership is stored separately so the same relation is not copied into every question JSON and so a search alias cannot silently redefine product equivalence.

## Rules

A comparison group:

- contains at least two published questions;
- contains at least two distinct products;
- contains questions from one category;
- represents one task that is reasonable to compare across products;
- must not be inferred from community demand or loose keyword overlap;
- does not imply equal plans, platforms, evidence states, or answer outcomes.

A question currently belongs to at most one canonical comparison group. Questions without a safe cross-product equivalent remain ungrouped.

## UI behavior

On a question page, “同じタスクを他製品で比較” uses only the canonical group relation. If a question is not grouped, the section stays hidden. The broader “関連する質問” section remains a looser discovery aid and is not presented as task equivalence.

## Maintenance

When adding a comparable question:

1. add or update the canonical question record;
2. update `data/comparison-groups.json` only if the task is genuinely equivalent enough for comparison;
3. run `python scripts/check_comparison_groups.py`;
4. let normal record/search/site validation run.

Do not create a comparison group merely to increase apparent comparison coverage.


## Public comparison matrix

The public landing page renders a matrix from this relation file.

`matrix_products` defines the fixed high-level columns. The first release uses ChatGPT, Claude, Gemini, and Microsoft Copilot because these are broad consumer/general-purpose products with useful cross-task comparison value. Products outside those columns, such as Perplexity, Codex, and Claude Code, remain visible in the “その他” column when a canonical record exists.

`core_products` defines coverage targets, not facts. ChatGPT and Claude are the current core targets for general comparison groups. A missing core cell is displayed as **未調査** and is reported by validation, but it does not fail CI and must never be interpreted as “できない”.

Each group has a `coverage` mode:

- `general`: core-product coverage is a useful research target;
- `specialized`: the task is primarily represented by specialist products, so a missing ChatGPT/Claude cell is not automatically a priority.

Coverage gaps should be filled only with normal first-party/direct evidence. The matrix must never synthesize an answer from another product, product family, or nearby task.
