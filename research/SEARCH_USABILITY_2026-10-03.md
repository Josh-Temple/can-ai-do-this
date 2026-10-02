# Search usability pass — 2026-10-03

## Scope

This is an **internal phrase-discovery audit**, not an external user study.

The goal was to test whether ordinary Japanese task wording could find the 11-question public set without requiring exact product feature names.

## Finding

The original search used one literal substring. Several natural queries returned no result even though a relevant question existed.

Examples before the fix:

- `スライド` → 0
- `表計算` → 0
- `エクセル` → 0
- `ドライブ` → 0
- `写真` → 0
- `調べる` → 0
- `PDF 要約` → unreliable because multi-word input was treated as one literal phrase

`メール` found the Gmail-trigger question but did not reliably expose the separate Gmail/Calendar access question.

## Change

PR #9 introduced:

- canonical `search_terms` on question records;
- Unicode NFKC normalization;
- whitespace-separated AND matching;
- JavaScript syntax checks in CI;
- an explicit methodology rule that search aliases are discovery metadata, not capability evidence.

Representative post-change checks:

- `メール` → Q0002, Q0003
- `スライド` / `パワポ` → Q0005, Q0006
- `エクセル` / `表計算` → Q0004
- `ドライブ` → Q0007
- `写真` → Q0009, Q0010
- `PDF 要約` → Q0011
- `最新情報 出典` → Q0008

## Interpretation

The failure was primarily a discovery problem, not a capability-data problem. A task-first site needs vocabulary that matches how non-specialists describe outcomes, not only official feature names.

## Remaining gate

This audit does **not** prove that ordinary users can use the site successfully.

Before expanding beyond the 15-question seed set, run a small external or naive-user check covering:

1. Can the person find a task without knowing the product feature name?
2. Can they tell whether the answer is YES, PARTIAL, NO, or UNKNOWN?
3. Can they identify plan/platform conditions?
4. Can they find the evidence state and last-checked date?
5. Can they explain why a conditional answer is conditional?
