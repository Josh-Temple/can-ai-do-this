const DATA_URL = "./questions.json";

const els = {
  search: document.querySelector("#search"),
  product: document.querySelector("#product-filter"),
  comparisonSection: document.querySelector("#comparison-section"),
  comparison: document.querySelector("#comparison-body"),
  comparisonNote: document.querySelector("#comparison-note"),
  count: document.querySelector("#result-count"),
  freshness: document.querySelector("#freshness"),
  showAll: document.querySelector("#show-all"),
  feedbackSection: document.querySelector("#feedback-section"),
  empty: document.querySelector("#empty"),
  emptyFeedback: document.querySelector("#empty-feedback-button"),
  error: document.querySelector("#error"),
};

let records = [];
let showAllRecords = false;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeSearch(value = "") {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u3000\s]+/g, " ")
    .trim();
}

function compactSearch(value = "") {
  return normalizeSearch(value).replace(/\s+/g, "");
}

const SEARCH_CONCEPTS = [
  {
    id: "pdf",
    queryGroups: [["pdf"]],
    categories: ["documents"],
    terms: ["pdf", "pdf分析", "pdf要約", "文書分析", "図表", "グラフ"],
  },
  {
    id: "transcription",
    queryGroups: [["文字起こし", "録音", "議事録", "transcription", "transcribe", "音声メモ"]],
    categories: ["audio-transcription"],
    terms: ["文字起こし", "録音", "議事録", "transcription", "transcribe", "音声", "会議", "要約"],
  },
  {
    id: "spreadsheet-edit",
    queryGroups: [
      ["excel", "エクセル", "スプレッドシート", "表計算", "google sheets"],
      ["編集", "直接", "数式", "書式", "セル", "ブック"],
    ],
    categories: ["spreadsheets"],
    terms: ["excel", "エクセル", "スプレッドシート", "表計算", "編集", "直接編集", "セル編集", "シート編集", "ブック編集", "数式"],
  },
  {
    id: "data-analysis",
    queryGroups: [
      ["excel", "エクセル", "csv", "データ", "表計算"],
      ["分析", "集計", "グラフ", "レポート", "可視化", "統計"],
    ],
    categories: ["data-analysis"],
    terms: ["データ分析", "excel 分析", "エクセル 分析", "csv 分析", "集計", "グラフ", "可視化", "統計", "レポート"],
  },
  {
    id: "website",
    queryGroups: [["webサイト", "ウェブサイト", "ホームページ", "webアプリ", "ウェブアプリ", "サイトを作", "アプリを作", "簡単なアプリ"]],
    categories: ["website-creation"],
    terms: ["webサイト", "ウェブサイト", "ホームページ", "webアプリ", "ウェブアプリ", "webページ", "アプリ作成", "公開", "共有"],
  },
  {
    id: "learning",
    queryGroups: [["勉強", "学習", "家庭教師", "チューター", "フラッシュカード", "クイズ", "練習問題"]],
    categories: ["learning"],
    terms: ["勉強", "学習", "家庭教師", "チューター", "フラッシュカード", "クイズ", "練習問題"],
  },
  {
    id: "coding",
    queryGroups: [
      ["github", "コード", "リポジトリ", "repository"],
      ["直", "修正", "編集", "pr", "プルリク", "実装"],
    ],
    categories: ["coding"],
    terms: ["github", "コード修正", "コード変更", "バグ修正", "リポジトリ", "repository", "pr", "プルリクエスト"],
  },
  {
    id: "web-search",
    queryGroups: [["ネットで調べ", "ウェブで調べ", "webで調べ", "ウェブ検索", "web検索", "ネット検索", "最新情報", "現在のウェブ"]],
    categories: ["web-research"],
    terms: ["ウェブ検索", "web検索", "ネット検索", "現在のウェブ", "最新情報", "出典", "引用"],
  },
  {
    id: "deep-research",
    queryGroups: [["deep research", "深掘り", "深く調べ", "詳しく調べ", "詳細調査", "詳細に調べ", "複数の情報源", "複数のweb情報源", "横断して", "調査レポート", "出典付きのレポート"]],
    categories: ["deep-research"],
    terms: ["deep research", "深掘り調査", "詳細調査", "調査レポート", "複数段階", "複数の情報源", "出典", "レポート"],
  },
  {
    id: "image-generation",
    queryGroups: [["画像を作", "写真を作", "画像生成", "イラストを作", "生成画像"]],
    categories: ["image-generation"],
    terms: ["画像生成", "画像を作る", "写真を作る", "生成画像", "text to image"],
  },
  {
    id: "image-editing",
    queryGroups: [["画像編集", "写真編集", "画像を直", "写真を直", "画像加工", "レタッチ"]],
    categories: ["image-editing"],
    terms: ["画像編集", "写真編集", "画像を直す", "写真を直す", "画像加工", "レタッチ"],
  },
  {
    id: "presentations",
    queryGroups: [["パワポ", "powerpoint", "スライドを作", "プレゼンを作", "プレゼン資料"]],
    categories: ["presentations"],
    terms: ["パワポ", "powerpoint", "pptx", "スライド", "スライド作成", "プレゼン", "プレゼン資料"],
  },
  {
    id: "voice",
    queryGroups: [["aiと話", "声で話", "声で会話", "音声会話", "音声で会話", "リアルタイムに声", "リアルタイムで声", "話しかけ"]],
    categories: ["voice-conversation"],
    terms: ["音声会話", "aiと話す", "声で会話", "リアルタイム会話", "話しかける", "voice", "live"],
  },
  {
    id: "video",
    queryGroups: [["動画を作", "動画作成", "動画生成", "video"]],
    categories: ["video-creation"],
    terms: ["動画", "動画作成", "動画生成", "video"],
  },
  {
    id: "automation",
    queryGroups: [["毎日", "定期", "指定時刻", "スケジュール", "自動で実行"]],
    categories: ["automation"],
    terms: ["毎日", "定期", "指定時刻", "スケジュール", "scheduled", "task"],
  },
];

const PRODUCT_SEARCH_GROUPS = [
  { name: "Claude Code", triggers: ["claude code"] },
  { name: "Microsoft Copilot", triggers: ["microsoft copilot", "copilot"] },
  { name: "ChatGPT", triggers: ["chatgpt"] },
  { name: "Claude", triggers: ["claude"] },
  { name: "Gemini", triggers: ["gemini"] },
  { name: "Perplexity", triggers: ["perplexity"] },
  { name: "Codex", triggers: ["codex"] },
];

const STOP_TOKENS = new Set([
  "ai", "できる", "できます", "したい", "ほしい", "欲しい", "知りたい", "比較したい",
  "です", "ます", "どの", "どれ", "か", "を", "に", "で", "と", "や", "も", "の",
]);

function conceptMatchesQuery(concept, rawQuery) {
  const compactQuery = compactSearch(rawQuery);
  return concept.queryGroups.every((group) =>
    group.some((term) => compactQuery.includes(compactSearch(term)))
  );
}

function matchedConcepts(rawQuery) {
  return SEARCH_CONCEPTS.filter((concept) => conceptMatchesQuery(concept, rawQuery));
}

function mentionedProducts(rawQuery) {
  const query = normalizeSearch(rawQuery);
  const compact = compactSearch(rawQuery);
  const found = [];

  for (const group of PRODUCT_SEARCH_GROUPS) {
    const matches = group.triggers.some((trigger) =>
      query.includes(normalizeSearch(trigger)) || compact.includes(compactSearch(trigger))
    );
    if (!matches) continue;
    if (group.name === "Claude" && found.includes("Claude Code")) continue;
    found.push(group.name);
  }
  return found;
}

function primarySearchText(record) {
  return normalizeSearch([
    record.id,
    record.question,
    record.question_ja,
    record.category,
    ...(record.search_terms || []),
    ...record.answers.flatMap((answer) => [answer.product]),
  ].filter(Boolean).join(" "));
}

function secondarySearchText(record) {
  return normalizeSearch([
    record.demand?.summary,
    record.demand?.summary_ja,
    ...record.answers.flatMap((answer) => [
      answer.summary,
      answer.summary_ja,
    ]),
  ].filter(Boolean).join(" "));
}

function queryTokens(rawQuery) {
  return normalizeSearch(rawQuery)
    .split(/[\s、。・,./／()（）「」『』：:!?！？]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOP_TOKENS.has(token));
}

function scoreRecord(record, rawQuery, concepts) {
  const primary = primarySearchText(record);
  const secondary = secondarySearchText(record);
  const question = normalizeSearch([record.question_ja, record.question].filter(Boolean).join(" "));
  const searchTerms = normalizeSearch((record.search_terms || []).join(" "));
  const categoryConcepts = concepts.filter((concept) => concept.categories.includes(record.category));

  if (concepts.length && !categoryConcepts.length) return null;

  let score = 0;
  for (const concept of categoryConcepts) {
    score += 100;
    for (const term of concept.terms) {
      const normalized = normalizeSearch(term);
      if (question.includes(normalized)) score += 8;
      else if (searchTerms.includes(normalized)) score += 6;
      else if (secondary.includes(normalized)) score += 1;
    }
  }

  const tokens = queryTokens(rawQuery);
  if (!concepts.length && tokens.length) {
    const matches = tokens.filter((token) => primary.includes(token));
    const needed = tokens.length <= 2 ? tokens.length : Math.max(1, Math.ceil(tokens.length * 0.6));
    if (matches.length < needed) return null;
    score += matches.length * 12;
  }

  for (const token of tokens) {
    if (question.includes(token)) score += 5;
    else if (searchTerms.includes(token)) score += 3;
    else if (secondary.includes(token)) score += 1;
  }

  if (compactSearch(question).includes(compactSearch(rawQuery))) score += 20;
  return score;
}

function searchRecords(rawQuery, product, sourceRecords = records) {
  const query = normalizeSearch(rawQuery);
  const concepts = matchedConcepts(query);
  const queryProducts = mentionedProducts(query);
  const allowedProducts = product ? [product] : queryProducts;

  return sourceRecords
    .filter((record) => !allowedProducts.length
      || record.answers.some((answer) => allowedProducts.includes(answer.product)))
    .map((record) => ({ record, score: scoreRecord(record, query, concepts) }))
    .filter(({ score }) => score !== null && (concepts.length || query || product))
    .sort((a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id))
    .map(({ record }) => record);
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

function questionText(record) {
  return record.question_ja || record.question;
}

function questionUrl(record) {
  return `./question.html?slug=${encodeURIComponent(record.slug)}`;
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

function updateUrl(rawQuery, product) {
  const params = new URLSearchParams();
  if (rawQuery) params.set("q", rawQuery);
  if (product) params.set("product", product);
  if (showAllRecords && !rawQuery && !product) params.set("all", "1");
  const next = params.toString() ? `?${params}` : window.location.pathname;
  history.replaceState(null, "", next);
}

function applyFilters() {
  const rawQuery = els.search.value.trim();
  const product = els.product.value;
  const hasSearch = Boolean(rawQuery || product);

  let filtered = [];
  if (hasSearch) {
    filtered = searchRecords(rawQuery, product);
  } else if (showAllRecords) {
    filtered = [...records].sort((a, b) => a.id.localeCompare(b.id));
  }

  const active = hasSearch || showAllRecords;
  els.comparisonSection.hidden = !active || filtered.length === 0;
  els.feedbackSection.hidden = !active;
  els.comparison.innerHTML = filtered.map(renderComparisonRows).join("");
  els.empty.hidden = !active || filtered.length !== 0;

  if (!active) {
    const productCount = new Set(records.flatMap((record) => record.answers.map((answer) => answer.product))).size;
    const categoryCount = new Set(records.map((record) => record.category)).size;
    els.count.textContent = `${records.length}問 · ${productCount}製品 · ${categoryCount}カテゴリ`;
  } else if (filtered.length) {
    els.count.textContent = `${filtered.length}件見つかりました`;
  } else {
    els.count.textContent = "0件";
  }

  els.comparisonNote.textContent = showAllRecords && !hasSearch
    ? "全質問を収録順に表示しています。検索すると、意図との近さを優先した順に切り替わります。"
    : "検索意図との近さを優先して表示しています。質問を開くと、条件・制限・一次資料を確認できます。";

  updateUrl(rawQuery, product);
}

async function loadRecords() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load capability records.");

    records = (await response.json())
      .filter((record) => record.status === "PUBLISHED")
      .sort((a, b) => a.id.localeCompare(b.id));

    populateProductFilter();

    const params = new URLSearchParams(window.location.search);
    els.search.value = params.get("q") || "";
    els.product.value = params.get("product") || "";
    showAllRecords = params.get("all") === "1";

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
        ? `要再確認 ${dueAnswers}回答 · 最新確認 ${dates.at(-1)}`
        : `最新確認 ${dates.at(-1)} · 確認期限内`;
    }

    els.showAll.textContent = `全${records.length}問を見る`;

    applyFilters();
  } catch (error) {
    console.error(error);
    els.count.textContent = "データを利用できません";
    els.error.hidden = false;
  }
}

els.search.addEventListener("input", () => {
  showAllRecords = false;
  applyFilters();
});

els.product.addEventListener("change", () => {
  showAllRecords = false;
  applyFilters();
});

els.showAll.addEventListener("click", () => {
  els.search.value = "";
  els.product.value = "";
  showAllRecords = true;
  applyFilters();
  els.comparisonSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

els.emptyFeedback.addEventListener("click", () => {
  const outcome = document.querySelector("#feedback-outcome");
  if (outcome) outcome.value = "見つからなかった";
  document.querySelector("#feedback-section, .feedback-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector("#feedback-intent")?.focus({ preventScroll: true });
});

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    els.search.value = button.dataset.query || "";
    showAllRecords = false;
    applyFilters();
    els.comparisonSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    normalizeSearch,
    matchedConcepts,
    mentionedProducts,
    queryTokens,
    scoreRecord,
    searchRecords,
  };
}

loadRecords();
