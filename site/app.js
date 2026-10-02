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

function categoryLabel(category) {
  return {
    automation: "自動化",
    "connected-apps": "外部アプリ連携",
    spreadsheets: "表計算",
    presentations: "プレゼン",
    "web-research": "ウェブ調査",
    images: "画像",
    documents: "文書・PDF",
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

  return [
    record.id,
    record.question,
    record.question_ja,
    record.category,
    record.demand?.summary,
    record.demand?.summary_ja,
    ...answerValues,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function renderComparisonRows(record) {
  return record.answers.map((answer) => `
    <tr>
      <td class="task-cell"><a href="#${escapeHtml(record.id)}">${escapeHtml(questionText(record))}</a></td>
      <td>${escapeHtml(answer.product)}</td>
      <td><span class="answer-badge ${answerClass(answer.answer)}">${escapeHtml(answerLabel(answer.answer))}</span></td>
      <td>${escapeHtml(answer.plan || "条件による")}</td>
      <td>${escapeHtml(evidenceLabel(answer.evidence_state))}</td>
      <td>${escapeHtml(answer.last_checked)}</td>
    </tr>
  `).join("");
}

function renderAnswer(answer) {
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

  return `
    <div class="answer">
      <div class="answer-meta">
        <strong>${escapeHtml(answer.product)}</strong>
        <div>${escapeHtml(answer.plan || "プラン条件あり")}</div>
        <div>${escapeHtml(answer.platform || "利用画面による")}</div>
        <div>${escapeHtml(evidenceLabel(answer.evidence_state))}</div>
        <div>確認 ${escapeHtml(answer.last_checked)}</div>
      </div>
      <div class="answer-body">
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
          <h2>${escapeHtml(questionText(record))}</h2>
        </div>
        <span class="answer-badge ${answerClass(primary.answer)}">${escapeHtml(answerLabel(primary.answer))}</span>
      </div>
      ${record.answers.map(renderAnswer).join("")}
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
  const query = els.search.value.trim().toLowerCase();
  const product = els.product.value;

  const filtered = records.filter((record) => {
    const queryMatch = !query || searchableText(record).includes(query);
    const productMatch = !product || record.answers.some((answer) => answer.product === product);
    return queryMatch && productMatch;
  });

  els.comparison.innerHTML = filtered.map(renderComparisonRows).join("");
  els.results.innerHTML = filtered.map(renderRecord).join("");
  els.count.textContent = `${filtered.length} / ${records.length} 件`;
  els.empty.hidden = filtered.length !== 0;

  const params = new URLSearchParams(window.location.search);
  query ? params.set("q", els.search.value.trim()) : params.delete("q");
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
      els.freshness.textContent = `最新確認日: ${dates.at(-1)}`;
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

loadRecords();
