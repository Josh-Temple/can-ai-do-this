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

### Search metadata

A record may include `search_terms` containing ordinary-language aliases, abbreviations, and common task phrasing that help people find the question. These terms are discovery metadata, not capability evidence, and must not broaden the factual claim made by the question or answer.

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

### Evidence-state invariants

The structured state must agree with the evidence actually stored:

- **DOCUMENTED** requires at least one official first-party documentation or announcement source.
- **VERIFIED** requires a `DIRECT_TEST` source and a non-null `tested_environment`.
- **USER_REPORTED** requires at least one `COMMUNITY` or `SECONDARY` report-oriented source.
- A **NO** answer must explain the basis for the negative claim in its limitations; absence from documentation alone is insufficient.

These are minimum consistency rules, not substitutes for source quality review.

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

Freshness is separate from evidence quality. A well-verified old result may still need review.

### Default review windows

These are provisional operating rules, not claims about how often vendors change their products:

- **14 days:** scheduling, autonomous/event-triggered work, connected apps, permissions, plan limits, and other capability boundaries that change frequently.
- **30 days:** file creation/editing, document processing, and other comparatively stable task capabilities.
- **Immediate review:** a relevant official change, a broken or substantially changed source, a credible contradictory report, or a failed reproduction of a previously verified capability.

Use the shorter window when a record spans more than one category.

Each canonical question stores the selected policy as `review_window_days` with a value of 14 or 30. This field records the review cadence; it is not evidence that a capability was re-checked. Automated due-date checks use the **oldest answer-level `last_checked` date** in the question so that refreshing one product answer cannot hide another stale answer.

### Review semantics

- Update `last_checked` only after the relevant evidence has actually been re-read or the capability has been re-tested.
- Rebuilding the site, opening a record, or seeing that a URL still resolves is not a freshness check.
- Re-reading documentation does not refresh an older direct-test date. For a `VERIFIED` answer, answer-level `last_checked` is the date of the most recent `DIRECT_TEST`. A later documentation review may advance the record-level `last_checked` and the official source's `accessed_at`, but it must not advance the verified answer-level date unless the capability is directly re-tested.
- When evidence has exceeded its review window and has not been re-checked, mark the affected answer `STALE` or the question `REVIEW_REQUIRED` before relying on it as a current answer.
- The public site also derives a fail-closed freshness warning from answer-level `last_checked` plus `review_window_days`. Once the review date is reached, the UI displays **要再確認** even if the canonical record has not yet been manually changed to STALE/REVIEW_REQUIRED. This presentation rule does not alter the stored evidence state or historical answer.
- Official documentation changes are a reason to re-investigate, not an automatic reason to change a YES/NO answer.
- Automated change detection may prioritize review, but it must not promote evidence to `VERIFIED` or rewrite capability conclusions by itself.

### Official-source change monitoring

For high-change questions, the repository may monitor a small set of semantic anchors in first-party documentation. This deliberately avoids full-page hashing.

- Missing semantic anchors or exhausted explicitly configured first-party URLs after permanent 404/410 responses create a review signal.
- An HTTP 200 response that cannot expose enough claim-relevant text is an unreadable-source review signal, not proof that the capability changed.
- Transient fetch failures are warnings, not evidence that the capability changed.
- A monitoring alert never refreshes `last_checked`, changes the answer, or promotes an evidence state.
- The source must be re-read or the capability re-tested before the canonical claim is changed.

The initial configuration covers every published question on the 14-day review cadence. Sources that can be fetched reliably are checked automatically; sources blocked to GitHub-hosted Actions are marked MANUAL and remain governed by the normal freshness review. The project does not bypass vendor access controls. Configuration and operating details are in `monitoring/README.md`.

Future automation may prioritize review based on age, product release activity, source changes, conflicting reports, and question demand.

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
