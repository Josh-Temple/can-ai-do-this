const DATA_URL = "./questions.json";

const els = {
  search: document.querySelector("#search"),
  product: document.querySelector("#product-filter"),
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
    OFFICIAL_DOC: "Official documentation",
    OFFICIAL_ANNOUNCEMENT: "Official announcement",
    DIRECT_TEST: "Direct test",
    SECONDARY: "Secondary source",
    COMMUNITY: "Community source",
  }[type] || type;
}

function answerClass(answer) {
  return String(answer || "unknown").toLowerCase();
}

function searchableText(record) {
  const answerText = record.answers.flatMap((a) => [
    a.product,
    a.plan,
    a.platform,
    a.region,
    a.answer,
    a.summary,
    ...(a.conditions || []),
    ...(a.limitations || []),
  ]);

  return [
    record.id,
    record.question,
    record.category,
    record.demand?.summary,
    ...answerText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function renderAnswer(answer) {
  const conditions = (answer.conditions || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const limitations = (answer.limitations || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const sources = (answer.sources || [])
    .map((source) => {
      const note = source.note ? ` — ${escapeHtml(source.note)}` : "";
      return `<li><a href="${escapeHtml(source.url)}" rel="noreferrer">${escapeHtml(sourceLabel(source.type))}</a><span class="source-kind"> · checked ${escapeHtml(source.accessed_at)}</span>${note}</li>`;
    })
    .join("");

  return `
    <div class="answer">
      <div class="answer-meta">
        <strong>${escapeHtml(answer.product)}</strong>
        <div>${escapeHtml(answer.plan || "Plan varies")}</div>
        <div>${escapeHtml(answer.platform || "Platform varies")}</div>
        <div>${escapeHtml(answer.evidence_state)}</div>
        <div>Checked ${escapeHtml(answer.last_checked)}</div>
      </div>
      <div class="answer-body">
        <p>${escapeHtml(answer.summary || "")}</p>
        <details class="details">
          <summary>Conditions, limitations, and evidence</summary>
          <div class="detail-grid">
            <div>
              <h3>Conditions</h3>
              <ul>${conditions || "<li>None recorded.</li>"}</ul>
            </div>
            <div>
              <h3>Limitations</h3>
              <ul>${limitations || "<li>None recorded.</li>"}</ul>
            </div>
          </div>
          <div class="sources">
            <h3>Sources</h3>
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
    .map((link) => `<a href="${escapeHtml(link.url)}" rel="noreferrer">discussion</a>`)
    .join(" · ");

  return `
    <article class="question">
      <div class="question-head">
        <div>
          <p class="question-id">${escapeHtml(record.id)} · ${escapeHtml(record.category)}</p>
          <h2>${escapeHtml(record.question)}</h2>
        </div>
        <span class="answer-badge ${answerClass(primary.answer)}">${escapeHtml(primary.answer)}</span>
      </div>
      ${record.answers.map(renderAnswer).join("")}
      ${communityLinks ? `<p class="community">Demand / edge-case links: ${communityLinks}</p>` : ""}
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

  els.results.innerHTML = filtered.map(renderRecord).join("");
  els.count.textContent = `${filtered.length} of ${records.length} questions`;
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
    records.sort((a, b) => a.id.localeCompare(b.id));

    populateProductFilter();

    const params = new URLSearchParams(window.location.search);
    els.search.value = params.get("q") || "";
    els.product.value = params.get("product") || "";

    const dates = records
      .map((record) => record.last_checked)
      .filter(Boolean)
      .sort();

    if (dates.length) {
      els.freshness.textContent = `Latest check: ${dates.at(-1)}`;
    }

    applyFilters();
  } catch (error) {
    console.error(error);
    els.count.textContent = "Data unavailable";
    els.error.hidden = false;
  }
}

els.search.addEventListener("input", applyFilters);
els.product.addEventListener("change", applyFilters);

loadRecords();
