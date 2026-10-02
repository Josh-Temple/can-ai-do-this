# Naive-user usability gate — 2026-10-03

## Purpose

This protocol tests whether **Can AI Do This?** works for a person who does not know the product's feature names.

It is deliberately small. The goal is not to collect satisfaction scores or redesign the site from one person's taste. The goal is to detect concrete failures in task discovery, answer interpretation, and evidence inspection before expanding beyond the 15-question seed set.

## Participant

Use someone who:

- has not worked on this repository;
- can use a normal web browser;
- does not need to be an AI expert;
- has not been told which feature names or search terms to type.

Do not coach them toward exact product terminology while the test is running.

## Test URL

https://josh-temple.github.io/can-ai-do-this/

## Five tasks

Give the participant the prompts below one at a time.

### Task A — presentation

> ChatGPTかClaudeで、あとから編集できるパワポを作れるか知りたいです。

Success target: the participant can find the PowerPoint questions and notice that the ChatGPT and Claude answers are not identical.

### Task B — document

> PDFを読み込ませて内容を質問したいです。図やグラフも読めるのか知りたいです。

Success target: the participant can reach the PDF questions and identify that visual-PDF handling has plan/product/page-count conditions.

### Task C — automation

> 毎日決まった時間にAIに処理させたいです。チャットを開きっぱなしにする必要がありますか？

Success target: the participant can find the scheduled-task question without knowing the term "Scheduled tasks".

### Task D — web research

> AIに今のウェブを調べさせて、情報源も確認したいです。

Success target: the participant can find the web-search questions and see which product the answer applies to.

### Task E — website

> コードを書けなくても、要望を文章で伝えてWebサイトを作って公開できますか？

Success target: the participant can find the website-creation question without being told "ChatGPT Sites".

## What to observe

For each task, record only observable outcomes:

| Field | Allowed values |
|---|---|
| found_relevant_question | YES / NO |
| time_to_first_relevant_click_seconds | integer |
| search_terms_used | exact words typed |
| answer_interpreted_correctly | YES / NO |
| conditions_found | YES / NO |
| evidence_state_found | YES / NO |
| last_checked_found | YES / NO |
| source_opened | YES / NO |
| confusion_note | short factual note or blank |

Do not turn subjective impressions into capability claims.

## Interpretation questions

After each task, ask the participant to answer in their own words:

1. できる・条件付き・できない・未確認のどれですか？
2. 重要な条件は何ですか？
3. この情報はいつ確認されたものですか？
4. 根拠はどこで確認できますか？

For PARTIAL records, also ask:

5. なぜ「条件付き」なのですか？

## Seed-gate pass criteria

Treat the 15-question seed as usable enough for controlled expansion only when:

- relevant-question discovery succeeds on at least **4 of 5 tasks** for each participant;
- no task has a repeated discovery failure across participants;
- at least **80% of completed tasks** have correct answer interpretation;
- at least **80% of completed tasks** have the key condition identified;
- evidence state and last-checked date can each be found on at least **80% of completed tasks**;
- every repeated confusion produces either a search-alias fix, copy clarification, layout fix, or an explicit decision that no change is warranted.

These thresholds are a project gate, not a statistical usability benchmark.

## Minimum sample

Start with **3 naive users**.

This is enough to expose obvious discovery/copy problems but is not enough for broad population claims. If the three users show materially different failure patterns, run additional sessions before using the result to justify expansion.

## Recording

Save one de-identified result file per participant under:

`research/usability-results/`

Use IDs such as `U001`, `U002`, and `U003`. Do not store names, email addresses, account identifiers, or private conversation content.

A summary should distinguish:

- observed task failures;
- site changes made in response;
- unresolved problems;
- whether the seed gate passed.

## Expansion rule

Passing this gate permits **controlled expansion** beyond 15 questions. It does not require immediate expansion to 25–50, and it does not override freshness or evidence-quality requirements.
