# Site prototype

This directory contains the task-first browsing interface for Can AI Do This?

## Source of truth

The interface does not maintain a second capability database.

Canonical records live under:

`data/questions/*.json`

`scripts/build_site.py` copies the static interface into a build directory and generates `questions.json` from those canonical records.

## Build locally

From the repository root:

```bash
python scripts/build_site.py
python -m http.server 8000 --directory dist
```

Then open `http://localhost:8000`.

## Product intent

The interface should answer:

> What are you trying to do?

It deliberately avoids:

- model leaderboards;
- generic AI-tool directories;
- overall product scores;
- unsupported equivalence between different plans or surfaces.

## Deployment

The build output is static and can be hosted on GitHub Pages, Vercel, or another static host. Deployment should publish the generated build output, not duplicate or manually rewrite the canonical question data.
