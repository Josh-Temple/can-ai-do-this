# Roadmap

## Stage 0 — Foundation

Goal: define a trustworthy data model before collecting at scale.

- [x] Define task-first scope
- [x] Define evidence states
- [x] Define community-source policy
- [x] Add initial schema and template
- [ ] Add automated schema validation
- [ ] Define freshness review rules

## Stage 1 — Seed set

Goal: publish a small set of high-demand, high-confidence questions.

Target: 25–50 questions.

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

Minimum interface:
- one prominent task search box;
- plain-language answer;
- product/plan/platform conditions;
- evidence state and last checked date;
- official source links;
- community discussion links where useful;
- related questions.

Avoid building a generic AI-tool directory.

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
