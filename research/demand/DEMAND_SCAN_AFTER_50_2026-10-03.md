# Demand scan after the 50-question first release — 2026-10-03

## Scope

This file is demand research only. It does **not** change canonical capability records and does not treat community reports as capability evidence.

Fresh baseline used for the final pass:

- `main` contains 50 published questions.
- Q0046–Q0048 add real-time voice conversation for ChatGPT, Claude, and Gemini.
- Q0049–Q0050 add spreadsheet/CSV analysis for ChatGPT and Claude.
- The repository's post-50 roadmap explicitly says not to grow question count automatically and to prioritize usability, comparison/discovery UX, demand validation, stronger VERIFIED evidence, and freshness.
- Existing open usability work should therefore remain a gate before a large content expansion.

Method: reconstruct current task coverage from all 50 canonical question records, then use recent web search, first-party support/product documentation, Reddit/community discussions, and Japanese task phrasing to find user goals that are not already represented. Community sources are used only as demand/pain signals.

## Current coverage: what should not be added again just for count

The 50-question set already has meaningful coverage for:

- current-web search with citations;
- PDF/file analysis;
- Deep Research;
- image generation and image editing;
- editable presentation creation;
- direct Google Sheets / Excel / Google Docs / Word editing in selected products;
- website/web-app creation;
- video generation;
- meeting recording/transcription;
- repository coding and pull-request workflows;
- guided learning, quizzes, and study materials;
- real-time voice conversation;
- spreadsheet/CSV analysis and chart/report generation.

Adding another record only because another product has the same broad feature would usually add less value than filling an action boundary that users actually encounter.

## Demand patterns

Three patterns recur across current discussions and first-party product changes.

1. **Users increasingly ask for completed actions, not answers.** Browser agents, email/calendar actions, spreadsheet edits, scheduled monitoring, and desktop work all sit beyond "tell me how."
2. **The action boundary is the confusing part.** Read vs edit, draft vs send, search vs monitor, browser vs local computer, ordinary voice vs camera/screen sharing, and memory vs project-scoped context are materially different tasks.
3. **Long-running context and source transformation are becoming normal consumer workflows.** Projects, source-grounded audio, and YouTube/source ingestion appear repeatedly in current usage discussions.

These are qualitative signals, not population-level demand estimates.

## Coverage classification

### COVERED

The following demand areas are already represented well enough that a new question should require a narrower unmet action boundary:

- web search with citations;
- Deep Research reports;
- PDF/file analysis;
- image generation/editing;
- presentation file creation;
- basic real-time voice conversation;
- meeting recording/transcription;
- tutoring/quizzes;
- GitHub repository editing and PR creation;
- spreadsheet/CSV analysis and chart generation.

### PARTIALLY_COVERED / GAP candidate pool

The strongest remaining candidates are below. This is a candidate pool, not a recommendation to add all of them.

| Classification | Natural user question | Demand evidence | Comparison candidates | First-party source availability | Existing overlap | Change velocity | Research difficulty |
|---|---|---|---|---|---|---|---|
| **GAP** | **AIにブラウザを操作して、予約・フォーム入力・買い物などを最後までやってほしい。できる？** | Recent users ask for agents that can take over authenticated web apps and complete multi-step forms. Browser-agent reliability and site blocking are recurring pain points. | ChatGPT Work/agent, Gemini in Chrome/Spark, Claude Cowork/computer use | **Strong.** OpenAI and Google explicitly document clicking, forms, signed-in sites, reservations, shopping, and confirmation boundaries. Anthropic documents browser/computer use. | Q0012/Q0036/Q0037 create apps, but do not perform arbitrary web tasks. | High | High |
| **PARTIALLY_COVERED** | **既存のExcelブックを開いたまま、数式や書式を保って直接直してほしい。できる？** | Multiple 2026 ClaudeAI threads show unusually strong engagement around in-place Excel editing, complex models, formula repair, and repeated revisions. | ChatGPT for Excel, Claude for Microsoft 365/Excel, Microsoft Copilot in Excel | **Strong.** OpenAI, Anthropic, and Microsoft all publish first-party Excel editing material. | Q0026 covers Copilot Excel; Q0049/Q0050 cover analysis, not native in-place editing across products. | Medium–High | Medium |
| **PARTIALLY_COVERED** | **スマホの画面やカメラをAIに見せながら、声でリアルタイムに手伝ってほしい。できる？** | Users report using camera-based voice assistance and also confusion when the camera control disappears or changes. | ChatGPT Voice/Advanced, Gemini Live | **Strong.** OpenAI distinguishes Live from Advanced video/screen sharing; Google documents camera and screen sharing in Gemini Live. | Q0046–Q0048 cover voice conversation, but the dedicated visual-sharing task boundary is not canonical. | High | Medium |
| **PARTIALLY_COVERED** | **複数のファイル・チャット・指示を1つのプロジェクトにまとめ、別チャットでも同じ文脈で続けたい。できる？** | Current users explicitly move long-running work into Projects/files because ordinary memory and very long chats can be inconsistent; small teams also ask for shared project knowledge. | ChatGPT Projects, Claude Projects; Gemini Notebook as an adjacent source-centered workspace | **Strong for ChatGPT/Claude.** Both have first-party project documentation. | Q0013 covers ChatGPT cross-chat memory, but project-scoped context, files, instructions, and collaboration are different. | Medium | Medium |
| **GAP** | **自分のPDF・資料・ノートから、通勤中に聞けるポッドキャスト風の音声解説を作りたい。できる？** | NotebookLM users describe audio as a primary learning format, especially for commuting/gym use; current discussions focus on source-to-audio quality and limits. | Gemini Notebook/NotebookLM Audio Overview; Gemini Audio Overview; Microsoft Teams audio recap as an adjacent meeting-derived workflow | **Strong for Google; adjacent Microsoft source exists.** | Q0043/Q0040 go from audio to transcript/summary, the reverse direction. | Medium | Low–Medium |
| **GAP** | **YouTubeのURLを渡して、動画の内容を要約したり質問したりしたい。できる？** | Repeated NotebookLM questions ask whether YouTube URLs work, caption requirements, and how to summarize many videos/channels. “YouTube 要約 AI” is also a natural Japanese search phrasing. | Gemini Notebook/NotebookLM; Gemini in Chrome as an adjacent page/video-context experience | **Strong for Gemini Notebook.** Google documents public-captioned YouTube URL ingestion and transcript-only boundaries. | No canonical question is about URL-based video understanding. | Medium | Medium |
| **PARTIALLY_COVERED** | **Webやメールを定期監視して、条件に合う変化があったときだけ知らせてほしい。できる？** | A recent ChatGPT thread with substantial engagement centers on scheduled email/calendar work; users also describe threshold-based price monitoring and dislike no-change notifications. | ChatGPT Scheduled/Work tasks, Gemini Spark schedules/monitors | **Strong.** OpenAI documents scheduled and event-triggered tasks; Google documents time-based, Gmail, and topic monitors. | Q0001 covers scheduled work and Q0003 Gmail-triggered work, but general condition monitoring and cross-product comparison remain incomplete. | High | Medium–High |
| **PARTIALLY_COVERED** | **AIにメールを読ませて、返信案だけでなく送信や予定作成まで任せられる？** | Recent users describe AI secretary workflows combining inboxes, calendar updates, and delayed/scheduled email; calendar/email coordination is a recurring pain point. | ChatGPT connected apps/Work, Gemini in Gmail/Calendar, Microsoft Copilot/Outlook | **Available but action-specific validation is required.** First-party docs clearly cover supported actions and calendar creation in some products; exact send/modify permissions differ. | Q0002 is read/use; Q0027 covers Copilot Outlook summaries/drafts/meeting coordination. The “actually act” boundary remains incomplete. | High | High |
| **GAP** | **SlackやTeamsの未読・重要メッセージをまとめて、必要な対応まで手伝ってほしい。できる？** | Work users increasingly want one assistant to catch up across collaboration systems rather than opening every thread manually. | ChatGPT + Slack, Microsoft Copilot in Teams, Claude + Slack/connected workflows | **Strong for OpenAI/Microsoft; Anthropic needs task-specific follow-up.** | Connected-app questions exist, but no canonical Slack/Teams task. | High | Medium–High |
| **GAP** | **AIにPC上のファイルやデスクトップアプリを実際に操作して、整理・入力・定型作業を終わらせてほしい。できる？** | Users ask for desktop agents that handle ERP/local-app routines; 2026 product releases increasingly expose local files, browser use, and computer use. | ChatGPT Work desktop, Claude Cowork/computer use | **Strong.** OpenAI documents local files/desktop apps in Work; Anthropic documents Cowork local file, browser, and computer use. | Q0041/Q0042 are coding-repository actions, not general desktop work. | High | High |

## Sources used for demand discovery

Community sources below are demand/pain evidence only.

- Browser/form automation: https://www.reddit.com/r/ChatGPT/comments/1uqkmiw/
- Scheduled personal-assistant workflows: https://www.reddit.com/r/ChatGPT/comments/1wg0edy/
- Scheduled-email workflow: https://www.reddit.com/r/ChatGPT/comments/1wqcb99/
- Claude/Excel demand:
  - https://www.reddit.com/r/ClaudeAI/comments/1rknoex/
  - https://www.reddit.com/r/ClaudeAI/comments/1ql5rme/
  - https://www.reddit.com/r/ClaudeAI/comments/1svv1at/
- ChatGPT camera/voice confusion: https://www.reddit.com/r/ChatGPT/comments/1u3jsow/
- Project/file-context demand:
  - https://www.reddit.com/r/ChatGPTcomplaints/comments/1tyv2f7/
  - https://www.reddit.com/r/ClaudeAI/comments/1uxoj5k/
- Source-to-audio learning: https://www.reddit.com/r/notebooklm/comments/1t7q04c/
- YouTube ingestion/summarization:
  - https://www.reddit.com/r/notebooklm/comments/1pm4tw6/
  - https://www.reddit.com/r/notebooklm/comments/1vbweor/
- Desktop/ERP agent request: https://www.reddit.com/r/AI_Agents/comments/1usmwe2/

## First-party sources confirming that these are researchable task boundaries

These sources are used to establish that current first-party documentation exists and that the candidate can be researched rigorously. They are **not** capability records in this file.

### Browser / action agents

- OpenAI — Using cloud browser in ChatGPT: https://help.openai.com/en/articles/20001280-using-cloud-browser-in-chatgpt
- Google — Gemini in Chrome auto browse: https://support.google.com/gemini/answer/16821166?hl=ja

### Native spreadsheet editing

- OpenAI — ChatGPT for Excel and Google Sheets: https://help.openai.com/en/articles/20001063-chatgpt-for-excel/
- Anthropic — Claude for Excel: https://www.anthropic.com/news/advancing-claude-for-financial-services
- Microsoft — Copilot in Excel FAQ: https://support.microsoft.com/en-us/excel/copilot/frequently-asked-questions-about-copilot-in-excel

### Camera / screen sharing

- OpenAI — ChatGPT Voice: https://help.openai.com/en/articles/20001274-chatgpt-voice
- Google — Gemini Live: https://support.google.com/gemini/answer/15274899

### Persistent project context

- OpenAI — Projects in ChatGPT: https://help.openai.com/ja-jp/articles/10169521-projects-in-chatgpt
- Anthropic — Projects: https://www.anthropic.com/news/projects

### Source-grounded audio / YouTube

- Google — Audio Overview: https://support.google.com/gemininotebook/answer/16212820
- Google — Supported sources / YouTube ingestion: https://support.google.com/gemininotebook/answer/16215270?hl=ja

### Scheduled / event-triggered monitoring

- OpenAI — Scheduled tasks in ChatGPT: https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt
- Google — Gemini Spark schedules and monitors: https://support.google.com/gemini/answer/17094710?hl=ja

### Connected collaboration and action workflows

- OpenAI — Connected apps in ChatGPT: https://help.openai.com/en/articles/11487775-connected-apps-in-chatgpt
- OpenAI — Slack in ChatGPT: https://help.openai.com/en/articles/12525822-using-slack-in-chatgpt
- Google — Gemini in Gmail: https://support.google.com/mail/answer/14355636?hl=ja
- Microsoft — Copilot in Teams chats/channels: https://support.microsoft.com/en-us/teams/copilot/how-to-use-microsoft-365-copilot-in-teams-chats-and-channels

### Local desktop work

- OpenAI — ChatGPT Work and Codex: https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex
- Anthropic — Claude Cowork across web/desktop/mobile: https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile

## Interpretation

There is enough demand evidence to justify a **small post-50 candidate pool**, but not an immediate 10- or 15-question expansion.

The strongest opportunities are tasks where:

- the current 50 questions stop at “understand/analyze” but the user wants the AI to **act**;
- current products have materially different plan/platform/permission boundaries;
- first-party sources are good enough to support a fail-closed canonical record;
- the task is understandable without knowing a feature name.

The browser-action, native-Excel-editing, condition-monitoring, visual live-assistance, and persistent-project-context tasks satisfy those conditions especially well.

The source-to-audio and YouTube candidates have clear consumer demand, but they also expand product scope toward Gemini Notebook/NotebookLM. That should be an explicit scope decision rather than an automatic content expansion.

## Recommended next step

Do **not** add all candidates now.

1. Complete the existing naive-user usability gate against the 50-question release.
2. Use the table above as the post-50 demand backlog.
3. If usability is acceptable, research a small batch (roughly 3–5 task boundaries) with the highest combination of demand signal, cross-product comparison value, and first-party evidence.
4. Prefer action-boundary questions over adding product variants to already-covered broad tasks.
5. Keep Reddit/community links in demand research only; capability answers should continue to rely on first-party documentation and direct tests.

