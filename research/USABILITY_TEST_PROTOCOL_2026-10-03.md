# Naive-user usability gate — 50-question first release

## Purpose

This protocol tests whether **Can AI Do This?** works for a person who does not know the products' feature names.

The repository now has a **50-question first release**. The goal of this gate is not to justify automatic content growth. It is to detect concrete failures in task discovery, cross-product comparison, answer interpretation, condition visibility, evidence visibility, and freshness visibility before deciding what to improve or add next.

## Participant

Use someone who:

- has not worked on this repository;
- can use a normal web browser;
- does not need to be an AI expert;
- has not been told which feature names or exact search terms to type.

Do not coach them toward product feature names while the test is running.

## Test URL

https://josh-temple.github.io/can-ai-do-this/

## Five tasks

Give the participant the prompts below one at a time. The headings and success targets are for the observer only; do not show them before the participant attempts the task.

### Task A — Deep Research comparison

> AIに複数のWeb情報源を横断して詳しく調べてもらい、出典付きのレポートを作りたいです。どのAIでできるか比較したいです。

Success target: the participant can find relevant research questions for at least two products, including at least one product other than ChatGPT or Claude, and can compare conditions rather than treating all products as equivalent.

### Task B — spreadsheet editing / analysis

> ExcelやCSVを渡して、集計・グラフ・レポートを作ってほしいです。既存のExcelを直接編集できるかどうかも知りたいです。

Success target: the participant can find spreadsheet/data-analysis questions and distinguish analysis/report generation from direct in-place spreadsheet editing where the dataset makes that distinction.

### Task C — media / app creation

> コードを書けません。文章で要望を伝えてWebサイトや簡単なアプリを作り、公開までできるAIを比較したいです。

Success target: the participant can reach the relevant creation questions without being coached toward a branded feature name and can identify meaningful product/plan/platform differences.

### Task D — real-time voice comparison

> スマホでAIとリアルタイムに声で会話したいです。複数のAIでできるか、条件の違いも比較したいです。

Success target: the participant can find the real-time voice questions for multiple products, including a non-ChatGPT/Claude product, and can distinguish the ordinary voice capability from narrower plan/platform boundaries.

### Task E — recording / transcription

> 会議や音声をAIに録音・文字起こしさせて、要約まで作りたいです。どの製品でできるか知りたいです。

Success target: the participant can find the recording/transcription questions, identify which product each answer applies to, and locate the relevant conditions and evidence.

## What to observe

For each task, record only observable outcomes:

| Field | Allowed values |
|---|---|
| found_relevant_question | YES / NO |
| time_to_first_relevant_click_seconds | integer |
| search_terms_used | exact words typed |
| products_reached | product names actually opened |
| cross_product_comparison_completed | YES / NO / NOT_APPLICABLE |
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

## 50-question gate pass criteria

Treat the 50-question first release as usable enough to guide the next improvement cycle only when:

- relevant-question discovery succeeds on at least **4 of 5 tasks** for each participant;
- no task has a repeated discovery failure across participants without an explicit fix or no-change rationale;
- at least **80% of completed tasks** have correct answer interpretation;
- at least **80% of completed tasks** have the key condition identified;
- evidence state and last-checked date can each be found on at least **80% of completed tasks**;
- across the recorded sessions, users successfully reach at least **three product families**;
- attempts include at least **two products other than ChatGPT or Claude**;
- at least **two cross-product comparison paths** are observed successfully;
- every repeated confusion produces either a search-alias fix, copy clarification, layout/navigation fix, or an explicit decision that no change is warranted.

These thresholds are a project gate, not a statistical usability benchmark.

## Minimum sample

Start with **3 naive users**.

This is enough to expose obvious discovery/copy problems but is not enough for broad population claims. If the three users show materially different failure patterns, run additional sessions before using the result to justify new product/task coverage.

## Recording

Save one de-identified result file per participant under:

`research/usability-results/`

Use IDs such as `U001`, `U002`, and `U003`. Do not store names, email addresses, account identifiers, or private conversation content.

A summary should distinguish:

- observed task failures;
- successful cross-product paths;
- product families actually reached;
- site changes made in response;
- unresolved problems;
- whether the 50-question gate passed.

## Decision rule after the gate

Passing this gate does **not** create a new question-count target.

Use the observed failures, public feedback, demand research, freshness work, and VERIFIED-evidence opportunities to decide the next small batch of work. A future capability question still requires first-party or direct evidence under the repository methodology.

## Relationship to public site feedback

The public site collects lightweight feedback through a GitHub Issue link. That feedback is useful for discovering search, copy, comparison, and interpretation problems, but it does **not** by itself complete this usability gate.

A submission counts toward the minimum naive-user sample only when the participant actually completes the protocol above and a de-identified result file is recorded under `research/usability-results/`. Do not infer timing, search paths, or interpretation success from a general feedback issue.
