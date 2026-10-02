# Seed demand scan — 2026-10-02

This is a **demand-discovery artifact**, not a capability answer set.

The links below show real user questions, use cases, or failure reports that may be worth converting into canonical task records. Community claims are not treated as authoritative evidence.

## Candidate questions

| Priority | Candidate task-first question | Why it is useful | Demand signal |
|---|---|---|---|
| P0 | Can ChatGPT run scheduled or recurring tasks without an open chat? | Scheduling is moving AI from chat to ongoing assistance, but plan and execution limits are confusing. | https://www.reddit.com/r/ChatGPT/comments/1wg0edy/what_are_people_actually_using_chatgpt_scheduled/ |
| P0 | Can ChatGPT read Gmail and use Google Calendar in a scheduled workflow? | Users are already attempting daily briefings and cross-app workflows; permissions and availability matter. | https://www.reddit.com/r/ChatGPT/comments/1wg0edy/what_are_people_actually_using_chatgpt_scheduled/ |
| P0 | Can ChatGPT access Gmail and Google Calendar, and where are those connections configured? | A basic capability is still hard for users to locate and understand. | https://www.reddit.com/r/ChatGPT/comments/1uhsn0y/gmail_and_calendar/ |
| P0 | Can ChatGPT edit an existing Google Sheet, not just analyze a spreadsheet? | "Read/analyze" and "write/edit" are materially different capabilities that users often conflate. | https://www.reddit.com/r/ChatGPT/comments/1vi7ekk/since_its_google_can_i_task_it_to_do_my/ |
| P0 | Can ChatGPT create an actual editable PowerPoint file from source material? | Users repeatedly ask whether AI can generate a real .pptx rather than an outline or workaround. | https://www.reddit.com/r/ChatGPT/comments/1fqko3q/can_chatgpt_be_used_to_generate_ppt/ |
| P0 | Can Claude create or export an editable PowerPoint deck? | Community reports show a distinction between visually good HTML decks and editable office-format output. | https://www.reddit.com/r/ClaudeAI/comments/1t9uvsd/claude_design_any_better_way_to_export_slide/ |
| P1 | What can Claude actually do with a connected Google Drive beyond search? | Users understand connection availability but not practical task-level value. | https://www.reddit.com/r/ClaudeAI/comments/1wpnd37/what_are_real_use_cases_for_connecting_google/ |
| P1 | Can ChatGPT monitor jobs, prices, or websites and alert only when criteria are met? | This is a clear everyday-agent use case with important scheduling, browsing, and notification conditions. | https://www.reddit.com/r/ChatGPT/comments/1wg0edy/what_are_people_actually_using_chatgpt_scheduled/ |
| P1 | Can a non-coder use an AI assistant to build and deploy a working website? | "Generate code" is much weaker than "produce a working deployed site"; users care about the latter. | https://www.reddit.com/r/ChatGPT/comments/1315y8b/chatgpt_created_a_website_for_me_and_ive_never/ |
| P1 | When an AI is connected to email, what exactly can it access and when? | Capability, permissions, proactive access, and privacy expectations are easily confused. | https://www.reddit.com/r/ChatGPTcomplaints/comments/1wsxikd/chatgpt_reading_my_inbox_after_i_told_it_not_to/ |

## Early pattern

The strongest recurring pattern is not "Which model is smartest?"

It is:

> I can see that this feature exists. What can it actually do in my real workflow, under my plan and platform, and what are the limits?

The first seed set should therefore favor questions where product marketing language hides an important action boundary, for example:

- read vs edit;
- draft vs send;
- generate an outline vs create the real file;
- connect vs act;
- run now vs run later;
- search vs monitor continuously;
- create code vs deploy a usable application;
- documented capability vs capability actually available on a given account.

## Next research step

For each P0 item:

1. read the current official documentation;
2. split broad questions into distinct actions where necessary;
3. record plan/platform/region constraints;
4. directly test when the required environment is available;
5. create canonical records under `data/questions/`;
6. retain the Reddit URL only as demand/edge-case evidence.

No community claim in this file should be copied into a published answer without independent support.
