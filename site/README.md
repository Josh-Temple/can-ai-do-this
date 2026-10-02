# Site prototype

This directory contains the first task-first browsing interface for Can AI Do This?

## Data source

The interface does not maintain a second capability database. It reads the canonical JSON records from:

`data/questions/*.json`

For the prototype, the browser fetches the public GitHub Contents API and then loads each record from its raw GitHub URL.

This is acceptable for early testing with a small dataset. Before meaningful public traffic, replace the runtime GitHub API dependency with a build-time generated static index.

## Run locally

Serve the repository root or this directory with any static HTTP server and open `site/index.html`.

Do not open the HTML only through `file://`; browser fetch restrictions may prevent the GitHub API request from working consistently.

## Product intent

The interface should answer:

> What are you trying to do?

It deliberately avoids:
- model leaderboards;
- generic AI tool directories;
- overall product scores;
- unsupported equivalence between different plans or surfaces.
