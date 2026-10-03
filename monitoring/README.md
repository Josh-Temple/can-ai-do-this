# Official source monitoring

This directory contains the low-noise official-source watch used by **Can AI Do This?**

## Purpose

The watcher is a **review trigger**, not a capability evaluator.

It checks whether high-change first-party documentation still contains a small set of semantic anchors that support the published task boundary. It does not compare full HTML, because navigation, timestamps, translations, tracking markup, and layout changes would create excessive noise.

The configuration covers every published question with a 14-day review window. Sources that GitHub-hosted Actions can read reliably are monitored directly. Sources blocked by vendor access controls or known extraction incompatibilities are marked MANUAL and remain subject to the normal freshness review. The project does not bypass vendor access controls.

## States

- `OK`: all configured semantic anchor groups are still present.
- `CHANGED`: at least one semantic anchor group disappeared, or every explicitly configured first-party URL for the source ended in a permanent 404/410. This opens or updates the GitHub review issue.
- `UNREADABLE`: an HTTP response was obtained, but extracted text was implausibly short or none of the configured capability anchors was visible. This fails closed into human review because it can mean extraction failure, a replacement shell page, or a fully repurposed document; it does not by itself mean the capability changed.
- `UNAVAILABLE`: a directly monitored source could not be inspected reliably because of a transient HTTP/network condition. This is logged as a warning and does not by itself change capability data.
- `MANUAL`: automated fetching is deliberately disabled for that source. It remains covered by the normal freshness-review process.

## Review rule

A source-watch alert must never automatically:

- change YES / PARTIAL / NO / UNKNOWN;
- change an evidence state;
- update `last_checked`;
- mark a capability VERIFIED.

Open the first-party source, identify what actually changed, compare it with the canonical question, and then update the record only when justified.

## Configuration

`source-watch.json` maps an official URL to:

- affected question IDs;
- small groups of semantically equivalent phrases;
- optionally, `fallback_urls` containing known first-party replacement URLs.

Fallback URLs are tried only after a configured URL returns a permanent 404/410. The watcher does not discover replacements automatically and never treats a search result or third-party page as a substitute for configured first-party evidence.

Within each anchor group, at least one alternative must remain present. Short ASCII anchors are matched as whole tokens rather than arbitrary substrings. Keep anchors tied to the factual boundary of the question rather than headings, navigation labels, dates, generic product words, or marketing copy. A source that can satisfy all anchors from global navigation while the claim-specific body disappears is too broad and should be replaced or tightened.

## Coverage

CI checks that every published question with `review_window_days: 14` is covered by at least one configured source.

The 30-day set is deliberately not included in the first pilot. Do not broaden coverage while a material share of the 14-day set remains MANUAL, UNREADABLE, or repeatedly noisy. Expansion should follow demonstrated low-noise direct monitoring and a policy-respecting first-party access path for currently manual sources.
