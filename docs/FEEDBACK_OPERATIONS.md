# Public feedback operations

## Purpose

Public-site feedback is a usability and demand signal. It is **not capability evidence** and must never promote a canonical answer to DOCUMENTED or VERIFIED by itself.

The public site routes a short feedback form to GitHub Issues. No write token is exposed in the static site, and the form does not request names or email addresses.

## Intake

Feedback created from the site uses the title prefix:

`[Site feedback]`

The `Triage public site feedback` workflow automatically adds:

- `feedback` to every matching issue;
- `feedback:found` when the submitter says the answer was found;
- `feedback:partial` when it was only partly found;
- `feedback:discovery-failure` when it was not found.

The workflow creates those labels on first use if they do not already exist. Editing the issue re-runs classification and removes an obsolete outcome label.

## Review rule

Review feedback as evidence about the **site experience**, especially:

- task wording that users actually use;
- search/discovery failures;
- confusion between analysis and direct action;
- missed product/plan/platform conditions;
- inability to find evidence state or freshness;
- comparison/navigation friction;
- candidate tasks that are absent from the current 50-question set.

Repeated independent reports increase priority, but they do not establish product capability.

## Resolution

Close a feedback issue when one of these is recorded:

- a linked search/copy/layout/navigation fix;
- a linked canonical research issue when the report identifies a genuine coverage gap;
- an explicit no-change rationale;
- a duplicate reference to an existing issue.

Do not copy personal information into the repository. If a submitter includes private information, minimize further propagation and remove it through normal repository moderation where possible.

## Relationship to the usability gate

Ordinary feedback does not satisfy Issue #12.

The 50-question naive-user gate requires the fixed protocol in `research/USABILITY_TEST_PROTOCOL_2026-10-03.md`, at least three real participants, and one de-identified result file per participant under `research/usability-results/`.

Use public feedback to decide what to inspect during and after the gate, not as a substitute for the gate.
