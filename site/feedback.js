const FEEDBACK_REPOSITORY = "Josh-Temple/can-ai-do-this";
const FEEDBACK_ISSUE_URL = `https://github.com/${FEEDBACK_REPOSITORY}/issues/new`;

function cleanPageUrl(rawUrl) {
  const url = new URL(rawUrl);
  const isQuestionPage = url.pathname.endsWith("/question.html");

  if (isQuestionPage) {
    const slug = url.searchParams.get("slug");
    const id = url.searchParams.get("id");
    url.search = "";
    if (slug) url.searchParams.set("slug", slug);
    else if (id) url.searchParams.set("id", id);
  } else {
    url.search = "";
  }

  url.hash = "";
  return url.toString();
}

function pageContext(doc = document, rawUrl = window.location.href) {
  const meta = doc.querySelector("#question-meta");
  const title = doc.querySelector("#question-title");
  const questionId = meta?.textContent?.match(/Q\d{4}/)?.[0] || "";
  const questionTitle = questionId ? (title?.textContent || "").trim() : "";

  return {
    questionId,
    questionTitle,
    pageUrl: cleanPageUrl(rawUrl),
  };
}

function buildFeedbackIssueUrl({ outcome, intent = "", confusion = "", context }) {
  const titleContext = context.questionId || "site";
  const title = `[Site feedback] ${titleContext} — ${outcome}`;

  const questionLine = context.questionId
    ? `- Question: ${context.questionId} — ${context.questionTitle || "(title unavailable)"}`
    : "- Question: site-wide / search";

  const body = [
    "## Context",
    questionLine,
    `- Page: ${context.pageUrl}`,
    `- Result: ${outcome}`,
    "",
    "## What I wanted to do",
    intent.trim() || "(not provided)",
    "",
    "## What was unclear",
    confusion.trim() || "(not provided)",
    "",
    "---",
    "Submitted from the public Can AI Do This? feedback form. No name or email address is requested.",
  ].join("\n");

  const params = new URLSearchParams({ title, body });
  return `${FEEDBACK_ISSUE_URL}?${params.toString()}`;
}

function initFeedbackForm(doc = document, win = window) {
  const form = doc.querySelector("#feedback-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const outcome = doc.querySelector("#feedback-outcome")?.value || "";
    if (!outcome) return;

    const intent = doc.querySelector("#feedback-intent")?.value || "";
    const confusion = doc.querySelector("#feedback-confusion")?.value || "";
    const context = pageContext(doc, win.location.href);
    const issueUrl = buildFeedbackIssueUrl({ outcome, intent, confusion, context });

    win.location.assign(issueUrl);
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    cleanPageUrl,
    buildFeedbackIssueUrl,
  };
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  initFeedbackForm();
}
