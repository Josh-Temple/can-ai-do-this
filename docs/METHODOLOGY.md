# Methodology

## 1. Research question

The project asks a practical question:

> Can a person accomplish a specific real-world task with a specific AI product under stated conditions?

The answer can differ by plan, platform, region, model, connected service, account state, and date.

## 2. Unit of analysis

The canonical unit is a **task-first question** such as:

- Can ChatGPT read messages from Gmail?
- Can an AI edit an existing spreadsheet?
- Can an AI create a presentation from a document?

A broad capability such as "email integration" should be decomposed into user-visible actions where needed: search, read, summarize, draft, send, label, archive, and scheduled follow-up may be different capabilities.

## 3. Evidence hierarchy

Evidence is not collapsed into one confidence score.

### VERIFIED

The capability was reproduced directly. The record must describe enough of the environment to interpret the result, including date and relevant plan/platform details.

### DOCUMENTED

A current first-party source supports the claim, but this project has not independently reproduced it in the stated environment.

### USER_REPORTED

A community member or third party reports the behavior. This can reveal demand, edge cases, regressions, and undocumented behavior, but does not establish the capability as fact.

### STALE

Previously useful evidence is old enough that the current answer should not rely on it without re-checking.

## 4. Source handling

Prefer, in order:

1. direct reproducible observations;
2. official product/help/developer documentation;
3. official release notes and first-party announcements;
4. high-quality secondary reporting;
5. community discussions.

Official documentation can also be incomplete or stale. Conflicts between documentation and observed behavior should be recorded explicitly.

## 5. Reddit and other community sources

Community content is mainly used to:

- discover frequently asked tasks;
- identify confusing terminology;
- find edge cases;
- locate possible regressions;
- understand where official documentation leaves practical questions unanswered.

The repository should normally store a link and an original short summary, not a copied post or comment body.

## 6. Freshness

AI products change rapidly. Every answer must carry `last_checked`.

A future automated process may assign review priority based on:
- age;
- product release activity;
- source changes;
- conflicting user reports;
- traffic or question demand.

Freshness is separate from evidence quality. A well-verified old result may still be stale.

## 7. Negative claims

"Cannot do this" is harder to establish than "can do this."

Negative answers should identify the basis:
- explicit official limitation;
- repeated direct failure under stated conditions;
- missing prerequisite or unsupported environment;
- unknown because evidence is insufficient.

Absence from documentation alone should not automatically become a definitive "No."

## 8. Comparisons

This project may compare products for a task, but should not manufacture overall rankings from heterogeneous evidence.

A comparison should show:
- supported/not supported/unknown;
- conditions;
- evidence state;
- last checked;
- important limitations.

## 9. Reproducibility

Direct tests should preserve the smallest useful reproducibility record while avoiding private user data. Where appropriate, use synthetic files, synthetic messages, or public test data.

## 10. Corrections

Corrections should preserve Git history. Material changes should update the record's date and explain what changed when the previous answer was meaningfully different.
