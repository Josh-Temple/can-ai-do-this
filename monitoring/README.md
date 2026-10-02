# Official source monitoring

This directory contains the low-noise official-source watch used by **Can AI Do This?**

## Purpose

The watcher is a **review trigger**, not a capability evaluator.

It checks whether high-change first-party documentation still contains a small set of semantic anchors that support the published task boundary. It does not compare full HTML, because navigation, timestamps, translations, tracking markup, and layout changes would create excessive noise.

The initial watch covers every published question with a 14-day review window.

## States

- `OK`: all configured semantic anchor groups are still present.
- `CHANGED`: at least one semantic anchor group disappeared, or the source returned a permanent 404/410. This opens or updates the GitHub review issue.
- `UNAVAILABLE`: the source could not be inspected reliably because of a transient HTTP/network condition or implausibly short extracted content. This is logged as a warning and does not by itself change capability data.

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
- small groups of semantically equivalent phrases.

Within each group, at least one alternative must remain present. Keep anchors tied to the factual boundary of the question rather than headings, navigation labels, dates, or marketing copy.

## Coverage

CI checks that every published question with `review_window_days: 14` is covered by at least one configured source.

The 30-day set is deliberately not included in the first pilot. Broaden coverage only after the 14-day watcher has operated with acceptably low noise.
