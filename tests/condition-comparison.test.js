const assert = require("node:assert/strict");
const test = require("node:test");
const config = require("../data/comparison-groups.json");
const comparison = require("../site/condition-comparison.js");

const records = [
  { id: "Q1", answers: [{ product: "ChatGPT", answer: "YES", plan: "Plan A", platform: "Web" }] },
  { id: "Q2", answers: [{ product: "Perplexity", answer: "UNKNOWN", plan: null, platform: null }] },
];

test("only explicitly enabled comparison groups appear", () => {
  const config = { groups: [
    { id: "on", condition_comparison: true },
    { id: "off", condition_comparison: false },
    { id: "unset" },
  ] };
  assert.deepEqual(comparison.conditionComparisonGroups(config).map((group) => group.id), ["on"]);
});

test("the initial selector is limited to three existing task groups", () => {
  const ids = comparison.conditionComparisonGroups(config).map((group) => group.id);
  assert.deepEqual(ids, ["spreadsheet-direct-edit", "editable-powerpoint", "deep-research-report"]);
  assert(ids.length >= 2 && ids.length <= 3);
});

test("direct task URLs accept only enabled canonical group ids", () => {
  assert.equal(comparison.selectedConditionTaskId(config, "spreadsheet-direct-edit"), "spreadsheet-direct-edit");
  assert.equal(comparison.selectedConditionTaskId(config, "spreadsheet-data-analysis"), "");
  assert.equal(comparison.selectedConditionTaskId(config, "unknown-task"), "");
});

test("products use exact labels and include existing comparison columns", () => {
  const group = { question_ids: ["Q1", "Q2"] };
  assert.deepEqual(
    comparison.productsForGroup(group, records, ["ChatGPT", "Claude"]),
    ["ChatGPT", "Claude", "Perplexity"]
  );
  assert.equal(comparison.productResult(group, records, "Copilot").kind, "NOT_RESEARCHED");
  assert.equal(comparison.productResult(group, records, "Microsoft Copilot").kind, "NOT_RESEARCHED");
});

test("recorded UNKNOWN is distinct from an unresearched product", () => {
  const group = { question_ids: ["Q1", "Q2"] };
  const unknown = comparison.productResult(group, records, "Perplexity");
  const unresearched = comparison.productResult(group, records, "Unstudied");
  assert.equal(unknown.kind, "ANSWER");
  assert.equal(unknown.answer.answer, "UNKNOWN");
  assert.equal(comparison.dispositionLabel(unknown), "判断保留");
  assert.equal(unresearched.kind, "NOT_RESEARCHED");
  assert.equal(comparison.dispositionLabel(unresearched), "未調査");
});

test("missing-product dispositions remain separate", () => {
  const group = {
    question_ids: [],
    missing_products: {
      Hold: { state: "INSUFFICIENT_EVIDENCE", note_ja: "根拠不足" },
      Other: { state: "OUT_OF_SCOPE", note_ja: "別製品として掲載" },
    },
  };
  assert.equal(comparison.productResult(group, [], "Hold").kind, "INSUFFICIENT_EVIDENCE");
  assert.equal(comparison.productResult(group, [], "Other").kind, "OUT_OF_SCOPE");
  assert.equal(comparison.productResult(group, [], "None").kind, "NOT_RESEARCHED");
  assert.equal(comparison.dispositionLabel(comparison.productResult(group, [], "Hold")), "判断保留");
  assert.equal(comparison.dispositionLabel(comparison.productResult(group, [], "Other")), "別製品");
});

test("expired answers are not presented as current yes/no conclusions", () => {
  const group = { question_ids: ["Q1"] };
  const yes = comparison.productResult(group, records, "ChatGPT");
  assert.equal(comparison.dispositionLabel(yes, true), "要再確認");
  assert.equal(comparison.dispositionLabel(yes, false), "できる");
});

test("an expired UNKNOWN stays on hold instead of becoming a negative answer", () => {
  const group = { question_ids: ["Q2"] };
  const unknown = comparison.productResult(group, records, "Perplexity");
  assert.equal(comparison.dispositionLabel(unknown, true), "判断保留");
});
