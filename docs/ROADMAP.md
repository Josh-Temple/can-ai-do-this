# Roadmap

## Stage 0 — Foundation

Goal: define a trustworthy data model before collecting at scale.

- [x] Define task-first scope
- [x] Define evidence states
- [x] Define community-source policy
- [x] Add initial schema and template
- [x] Add automated schema validation
- [x] Define freshness review rules

## Stage 1 — Seed set

Goal: publish a small set of high-demand, high-confidence questions.

Initial public milestone: **10–15 questions**. Current published set: **11 questions**. Expand toward **25–50** only after the small public set is usable and the update burden is sustainable.

Selection signals:
- recurring questions in Reddit and other public communities;
- common web-search phrasing;
- recurring confusion in official support forums;
- major newly released AI capabilities;
- tasks that ordinary users can understand without specialist knowledge.

For the seed set, prioritize tasks involving:
- email;
- documents and PDFs;
- spreadsheets;
- presentations;
- web research;
- image creation/editing;
- coding and website creation;
- memory;
- scheduled or autonomous work;
- external app connections.

## Stage 2 — Public browsing experience

Goal: make the dataset useful to non-technical users.

Current prototype:
- [x] prominent keyword search;
- [x] simple comparison table;
- [x] plain-language Japanese answer with English fallback;
- [x] product/plan/platform conditions;
- [x] evidence state and last checked date;
- [x] official source links;
- [x] community discussion links where useful;
- [x] dedicated question pages / stable share links;
- [x] related-question navigation;
- [x] live public deployment verified.

Avoid building a generic AI-tool directory.

Before expanding beyond 10–15 questions, test whether users can:
- find the relevant task without knowing the product feature name;
- understand the answer and its plan/platform conditions;
- find the evidence state and last-checked date;
- identify when the answer is conditional or not yet verified.

## Stage 3 — Community contribution

Goal: accept structured reports without treating them as verified facts.

Potential flow:
- user selects task/product/plan/platform;
- reports Worked / Partially worked / Failed;
- may attach evidence;
- submission enters USER_REPORTED state;
- maintainers can independently reproduce and promote evidence to VERIFIED.

## Stage 4 — Freshness and change tracking

Goal: detect when an answer may have changed.

The operating review windows are defined in `docs/METHODOLOGY.md`. Automation may identify review candidates, but current capability claims must still be re-checked against evidence.

Potential signals:
- official documentation changes;
- major product releases;
- new contradictory reports;
- stale last-checked dates.

## Non-goals for now

- exhaustive coverage of every AI product;
- synthetic model intelligence benchmarks;
- overall model rankings;
- scraping and republishing large amounts of community content;
- automatic commercial use of third-party community datasets.
