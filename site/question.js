const DATA_URL = "./questions.json";

const els = {
  meta: document.querySelector("#question-meta"),
  title: document.querySelector("#question-title"),
  badge: document.querySelector("#question-badge"),
  answers: document.querySelector("#question-answers"),
  community: document.querySelector("#question-community"),
  comparisonPeersSection: document.querySelector("#comparison-peers-section"),
  comparisonPeers: document.querySelector("#comparison-peers-list"),
  related: document.querySelector("#related-list"),
  error: document.querySelector("#question-error"),
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeSearch(value = "") {
  return String(value).normalize("NFKC").toLowerCase();
}

function sourceLabel(type) {
  return {
    OFFICIAL_DOC: "公式ドキュメント",
    OFFICIAL_ANNOUNCEMENT: "公式発表",
    DIRECT_TEST: "直接テスト",
    SECONDARY: "二次情報",
    COMMUNITY: "コミュニティ",
  }[type] || type;
}

function evidenceLabel(state) {
  return {
    VERIFIED: "実測済み",
    DOCUMENTED: "公式確認",
    USER_REPORTED: "利用者報告",
    STALE: "要再確認",
  }[state] || state;
}

function answerLabel(answer) {
  return {
    YES: "できる",
    PARTIAL: "条件付き",
    NO: "できない",
    UNKNOWN: "未確認",
  }[answer] || answer;
}

function answerClass(answer) {
  return String(answer || "unknown").toLowerCase();
}

function freshnessInfo(record, answer) {
  return CapabilityFreshness.evaluate(record, answer);
}

function effectiveEvidenceLabel(record, answer) {
  return freshnessInfo(record, answer).isDue
    ? "要再確認"
    : evidenceLabel(answer.evidence_state);
}

function freshnessWarning(record, answer) {
  const freshness = freshnessInfo(record, answer);
  if (!freshness.isDue) return "";
  const deadline = freshness.nextReview ? `（確認期限 ${escapeHtml(freshness.nextReview)}）` : "";
  return `<p class="freshness-warning"><strong>要再確認</strong> この回答は確認期限を過ぎています${deadline}。前回確認時点の内容として参照し、公式情報を再確認してください。</p>`;
}

function categoryLabel(category) {
  return {
    automation: "自動化",
    "connected-apps": "外部アプリ連携",
    spreadsheets: "表計算",
    presentations: "プレゼン",
    "web-research": "ウェブ調査",
    "image-generation": "画像生成",
    "image-editing": "画像編集",
    documents: "文書・PDF",
    "website-creation": "Webサイト作成",
    memory: "記憶",
    "file-creation": "ファイル作成",
    "deep-research": "深掘り調査",
    "video-creation": "動画作成",
    "audio-transcription": "音声・文字起こし",
    coding: "プログラミング",
    learning: "学習",
    "voice-conversation": "音声会話",
    "data-analysis": "データ分析",
  }[category] || category;
}

function questionText(record) {
  return record.question_ja || record.question;
}

function answerText(answer, field) {
  return answer[`${field}_ja`] || answer[field] || "";
}

function answerList(answer, field) {
  return answer[`${field}_ja`] || answer[field] || [];
}

function questionUrl(record) {
  return `./question.html?slug=${encodeURIComponent(record.slug)}`;
}

function renderAnswer(record, answer) {
  const conditions = answerList(answer, "conditions")
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const limitations = answerList(answer, "limitations")
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const sources = (answer.sources || [])
    .map((source) => {
      const note = source.note ? ` — ${escapeHtml(source.note)}` : "";
      return `<li><a href="${escapeHtml(source.url)}" rel="noreferrer">${escapeHtml(sourceLabel(source.type))}</a><span class="source-kind"> · 確認 ${escapeHtml(source.accessed_at)}</span>${note}</li>`;
    })
    .join("");

  const freshness = freshnessInfo(record, answer);

  return `
    <div class="answer question-page-answer">
      <div class="answer-meta">
        <strong>${escapeHtml(answer.product)}</strong>
        <div>${escapeHtml(answer.plan || "プラン条件あり")}</div>
        <div>${escapeHtml(answer.platform || "利用画面による")}</div>
        <div class="${freshness.isDue ? "freshness-due" : ""}">${escapeHtml(effectiveEvidenceLabel(record, answer))}</div>
        <div>確認 ${escapeHtml(answer.last_checked)}</div>
        ${freshness.nextReview ? `<div>次回確認目安 ${escapeHtml(freshness.nextReview)}</div>` : ""}
      </div>
      <div class="answer-body">
        ${freshnessWarning(record, answer)}
        <p class="answer-summary">${escapeHtml(answerText(answer, "summary"))}</p>
        <div class="detail-grid">
          <div>
            <h3>条件</h3>
            <ul>${conditions || "<li>特記事項なし。</li>"}</ul>
          </div>
          <div>
            <h3>制限</h3>
            <ul>${limitations || "<li>特記事項なし。</li>"}</ul>
          </div>
        </div>
        <div class="sources">
          <h3>根拠</h3>
          <ul>${sources}</ul>
        </div>
      </div>
    </div>
  `;
}

function relatedRecords(record, records) {
  const products = new Set(record.answers.map((answer) => answer.product));
  return records
    .filter((candidate) => candidate.id !== record.id && candidate.status === "PUBLISHED")
    .map((candidate) => {
      const sameCategory = candidate.category === record.category ? 2 : 0;
      const sharedProduct = candidate.answers.some((answer) => products.has(answer.product)) ? 1 : 0;
      return { candidate, score: sameCategory + sharedProduct };
    })
    .sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id))
    .slice(0, 4)
    .map(({ candidate }) => candidate);
}

function updateMeta(record) {
  const text = questionText(record);
  document.title = `${text} | Can AI Do This?`;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    const summary = record.answers[0] ? answerText(record.answers[0], "summary") : "";
    description.setAttribute("content", summary || text);
  }
}

async function loadQuestion() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load capability records.");

    const records = (await response.json()).filter((record) => record.status === "PUBLISHED");
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    const id = params.get("id");
    const record = records.find((item) => (slug && item.slug === slug) || (id && item.id === id));
    if (!record) throw new Error("Question not found.");

    const primary = record.answers[0] || { answer: "UNKNOWN" };
    const freshness = CapabilityFreshness.recordStatus(record);
    els.meta.textContent = `${record.id} · ${categoryLabel(record.category)} · 最終確認 ${record.last_checked}${freshness.isDue ? " · 要再確認" : ""}`;
    els.title.textContent = questionText(record);
    els.badge.innerHTML = `<span class="answer-badge ${answerClass(primary.answer)}">${escapeHtml(answerLabel(primary.answer))}</span>${freshness.isDue ? '<span class="freshness-flag">要再確認</span>' : ""}`;
    els.answers.innerHTML = record.answers.map((answer) => renderAnswer(record, answer)).join("");

    const communityLinks = (record.demand?.community_links || [])
      .map((link) => `<a href="${escapeHtml(link.url)}" rel="noreferrer">関連する議論</a>`)
      .join(" · ");
    if (communityLinks) {
      els.community.innerHTML = `需要・エッジケースの参考: ${communityLinks}`;
      els.community.hidden = false;
    }

    const related = relatedRecords(record, records);
    els.related.innerHTML = related
      .map((item) => `<li><a href="${questionUrl(item)}">${escapeHtml(questionText(item))}</a><span>${escapeHtml(item.answers[0]?.product || "")}</span></li>`)
      .join("");

    updateMeta(record);
  } catch (error) {
    console.error(error);
    els.meta.textContent = "QUESTION";
    els.title.textContent = "質問が見つかりません";
    els.badge.innerHTML = "";
    els.error.hidden = false;
  }
}

loadQuestion();
