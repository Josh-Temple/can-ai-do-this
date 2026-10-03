const DATA_URL = "./questions.json";

const els = {
  search: document.querySelector("#search"),
  product: document.querySelector("#product-filter"),
  comparison: document.querySelector("#comparison-body"),
  results: document.querySelector("#results"),
  count: document.querySelector("#result-count"),
  freshness: document.querySelector("#freshness"),
  empty: document.querySelector("#empty"),
  error: document.querySelector("#error"),
  detailSection: document.querySelector(".detail-section"),
};

let records = [];

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


const SEARCH_CONCEPTS = [
  {
    triggers: ["pdfを読み", "pdfを読ん", "pdfの内容", "pdfを要約", "pdfを分析"],
    requirements: [["pdf分析", "pdf要約", "pdfを読む", "文書分析"]],
  },
  {
    triggers: ["会議を文字起こし", "文字起こしした", "録音して文字起こし", "議事録を作"],
    requirements: [["文字起こし", "議事録", "transcription", "transcribe"]],
  },
  {
    triggers: ["エクセルを編集", "excelを編集", "スプレッドシートを編集", "表計算を編集"],
    requirements: [
      ["エクセル", "excel", "スプレッドシート", "表計算"],
      ["編集", "直接編集", "セル編集", "シート編集", "ブック編集", "更新"],
    ],
  },
  {
    triggers: ["サイトを作", "webサイト", "ウェブサイト", "ホームページを作", "webアプリ"],
    requirements: [["webサイト", "ウェブサイト", "ホームページ", "webアプリ", "ウェブアプリ", "webページ"]],
  },
  {
    triggers: ["勉強を教え", "勉強したい", "学習したい", "家庭教師", "チューター", "フラッシュカード"],
    requirements: [["勉強", "学習", "家庭教師", "チューター", "クイズ", "練習問題", "フラッシュカード"]],
  },
  {
    triggers: ["コードを直", "コードを修正", "バグを直", "githubのコード"],
    requirements: [["コード修正", "コード変更", "バグ修正", "実装", "リポジトリ", "repository"]],
  },
  {
    triggers: ["ネットで調べ", "ウェブで調べ", "webで調べ", "ウェブ検索", "web検索", "ネット検索", "最新情報"],
    requirements: [["ウェブ検索", "web検索", "ネット検索", "現在のウェブ", "最新情報"]],
  },
  {
    triggers: ["深く調べ", "深掘り", "詳細調査", "deep research"],
    requirements: [["deep research", "深掘り調査", "詳細調査", "調査レポート", "複数段階"]],
  },
  {
    triggers: ["画像を作", "写真を作", "画像生成", "イラストを作"],
    requirements: [["画像生成", "画像を作る", "写真を作る", "生成画像", "text to image"]],
  },
  {
    triggers: ["画像編集", "写真編集", "画像を直", "写真を直", "画像加工", "レタッチ"],
    requirements: [["画像編集", "写真編集", "画像を直す", "写真を直す", "画像加工", "レタッチ"]],
  },
  {
    triggers: ["パワポを作", "powerpointを作", "スライドを作", "プレゼンを作"],
    requirements: [["パワポ", "powerpoint", "スライド作成", "プレゼン資料"]],
  },
  {
    triggers: ["aiと話した", "声で話した", "音声で会話", "リアルタイムに会話", "話しかけたい"],
    requirements: [["音声会話", "aiと話す", "声で会話", "リアルタイム会話", "話しかける"]],
  },
  {
    triggers: ["excelを分析", "エクセルを分析", "csvを分析", "データを分析", "データを見て"],
    requirements: [
      ["データ分析", "excel 分析", "エクセル 分析", "csv 分析", "表計算 分析", "データを見て"],
      ["集計", "グラフ", "可視化", "統計", "分析"],
    ],
  },
];

const PRODUCT_SEARCH_GROUPS = [
  { triggers: ["chatgpt"], terms: ["chatgpt"] },
  { triggers: ["claude code"], terms: ["claude code"] },
  { triggers: ["claude"], terms: ["claude"] },
  { triggers: ["gemini"], terms: ["gemini"] },
  { triggers: ["microsoft copilot", "copilot"], terms: ["microsoft copilot", "copilot"] },
  { triggers: ["perplexity"], terms: ["perplexity"] },
  { triggers: ["codex"], terms: ["codex"] },
];

function queryRequirements(value = "") {
  const query = normalizeSearch(value).trim();
  if (!query) return [];

  const requirements = [];
  for (const concept of SEARCH_CONCEPTS) {
    if (concept.triggers.some((trigger) => query.includes(normalizeSearch(trigger)))) {
      requirements.push(...concept.requirements.map((group) => group.map(normalizeSearch)));
    }
  }

  for (const group of PRODUCT_SEARCH_GROUPS) {
    if (group.triggers.some((trigger) => query.includes(normalizeSearch(trigger)))) {
      requirements.push(group.terms.map(normalizeSearch));
    }
  }

  if (requirements.length) return requirements;
  return query.split(/\s+/).filter(Boolean).map((token) => [token]);
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

function questionUrl(record) {
  return `./question.html?slug=${encodeURIComponent(record.slug)}`;
}

function answerText(answer, field) {
  return answer[`${field}_ja`] || answer[field] || "";
}

function answerList(answer, field) {
  return answer[`${field}_ja`] || answer[field] || [];
}

function searchableText(record) {
  const answerValues = record.answers.flatMap((answer) => [
    answer.product,
    answer.plan,
    answer.platform,
    answer.region,
    answer.answer,
    answer.summary,
    answer.summary_ja,
    ...(answer.conditions || []),
    ...(answer.conditions_ja || []),
    ...(answer.limitations || []),
    ...(answer.limitations_ja || []),
  ]);

  const values = [
    record.id,
    record.question,
    record.question_ja,
    record.category,
    ...(record.search_terms || []),
    record.demand?.summary,
    record.demand?.summary_ja,
    ...answerValues,
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeSearch(values);
}

function renderComparisonRows(record) {
  return record.answers.map((answer) => {
    const freshness = freshnessInfo(record, answer);
    const review = freshness.nextReview
      ? `<div class="review-hint ${freshness.isDue ? "due" : ""}">次回確認目安 ${escapeHtml(freshness.nextReview)}${freshness.isDue ? " · 期限超過" : ""}</div>`
      : "";
    return `
      <tr>
        <td class="task-cell" data-label="やりたいこと"><a href="${questionUrl(record)}">${escapeHtml(questionText(record))}</a></td>
        <td data-label="製品">${escapeHtml(answer.product)}</td>
        <td data-label="回答"><span class="answer-badge ${answerClass(answer.answer)}">${escapeHtml(answerLabel(answer.answer))}</span></td>
        <td data-label="プラン">${escapeHtml(answer.plan || "条件による")}</td>
        <td data-label="根拠" class="${freshness.isDue ? "freshness-due" : ""}">${escapeHtml(effectiveEvidenceLabel(record, answer))}</td>
        <td data-label="確認日">${escapeHtml(answer.last_checked)}${review}</td>
      </tr>
    `;
  }).join("");
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
    <div class="answer">
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
        <details class="details">
          <summary>条件・制限・根拠を見る</summary>
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
        </details>
      </div>
    </div>
  `;
}

function renderRecord(record) {
  const primary = record.answers[0] || { answer: "UNKNOWN" };
  const communityLinks = (record.demand?.community_links || [])
    .map((link) => `<a href="${escapeHtml(link.url)}" rel="noreferrer">関連する議論</a>`)
    .join(" · ");

  return `
    <article class="question" id="${escapeHtml(record.id)}">
      <div class="question-head">
        <div>
          <p class="question-id">${escapeHtml(record.id)} · ${escapeHtml(categoryLabel(record.category))}</p>
          <h2><a href="${questionUrl(record)}">${escapeHtml(questionText(record))}</a></h2>
        </div>
        <span class="answer-badge ${answerClass(primary.answer)}">${escapeHtml(answerLabel(primary.answer))}</span>
      </div>
      ${record.answers.map((answer) => renderAnswer(record, answer)).join("")}
      ${communityLinks ? `<p class="community">需要・エッジケースの参考: ${communityLinks}</p>` : ""}
    </article>
  `;
}

function populateProductFilter() {
  const products = [...new Set(
    records.flatMap((record) => record.answers.map((answer) => answer.product))
  )].sort();

  for (const product of products) {
    const option = document.createElement("option");
    option.value = product;
    option.textContent = product;
    els.product.append(option);
  }
}

function applyFilters() {
  const rawQuery = els.search.value.trim();
  const requirements = queryRequirements(rawQuery);
  const product = els.product.value;

  const filtered = records.filter((record) => {
    const haystack = searchableText(record);
    const queryMatch = requirements.length === 0
      || requirements.every((group) => group.some((term) => haystack.includes(term)));
    const productMatch = !product || record.answers.some((answer) => answer.product === product);
    return queryMatch && productMatch;
  });

  els.comparison.innerHTML = filtered.map(renderComparisonRows).join("");
  const hasActiveFilter = Boolean(rawQuery || product);
  els.detailSection.hidden = !hasActiveFilter;
  els.results.innerHTML = hasActiveFilter ? filtered.map(renderRecord).join("") : "";
  els.count.textContent = `${filtered.length} / ${records.length} 件`;
  els.empty.hidden = filtered.length !== 0;

  const params = new URLSearchParams(window.location.search);
  rawQuery ? params.set("q", rawQuery) : params.delete("q");
  product ? params.set("product", product) : params.delete("product");
  const next = params.toString() ? `?${params}` : window.location.pathname;
  history.replaceState(null, "", next);
}
async function loadRecords() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load capability records.");

    records = await response.json();
    records = records
      .filter((record) => record.status === "PUBLISHED")
      .sort((a, b) => a.id.localeCompare(b.id));

    populateProductFilter();

    const params = new URLSearchParams(window.location.search);
    els.search.value = params.get("q") || "";
    els.product.value = params.get("product") || "";

    const dates = records
      .map((record) => record.last_checked)
      .filter(Boolean)
      .sort();

    if (dates.length) {
      const dueAnswers = records.reduce(
        (count, record) => count + CapabilityFreshness.recordStatus(record).dueCount,
        0
      );
      els.freshness.textContent = dueAnswers
        ? `要再確認: ${dueAnswers}回答 · 最新確認日: ${dates.at(-1)}`
        : `確認期限内 · 最新確認日: ${dates.at(-1)}`;
    }

    applyFilters();
  } catch (error) {
    console.error(error);
    els.count.textContent = "データを利用できません";
    els.error.hidden = false;
  }
}

els.search.addEventListener("input", applyFilters);
els.product.addEventListener("change", applyFilters);

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    els.search.value = button.dataset.query || "";
    applyFilters();
    els.search.focus();
  });
});

loadRecords();
