(function exposeConditionComparison(root) {
  "use strict";

  function conditionComparisonGroups(config) {
    return (config?.groups || []).filter((group) => group.condition_comparison === true);
  }

  function selectedConditionTaskId(config, requestedId) {
    return conditionComparisonGroups(config).some((group) => group.id === requestedId)
      ? requestedId
      : "";
  }

  function productsForGroup(group, records, matrixProducts = []) {
    const ids = new Set(group?.question_ids || []);
    const observed = records
      .filter((record) => ids.has(record.id))
      .flatMap((record) => (record.answers || []).map((answer) => answer.product))
      .filter(Boolean);
    const result = [];
    for (const product of [...matrixProducts, ...observed.sort()]) {
      if (!result.includes(product)) result.push(product);
    }
    return result;
  }

  function productResult(group, records, product) {
    const ids = new Set(group?.question_ids || []);
    for (const record of records) {
      if (!ids.has(record.id)) continue;
      const answer = (record.answers || []).find((item) => item.product === product);
      if (answer) return { kind: "ANSWER", record, answer };
    }

    const missing = group?.missing_products?.[product];
    if (missing?.state === "INSUFFICIENT_EVIDENCE") {
      return { kind: "INSUFFICIENT_EVIDENCE", note: missing.note_ja || "" };
    }
    if (missing?.state === "OUT_OF_SCOPE") {
      return { kind: "OUT_OF_SCOPE", note: missing.note_ja || "" };
    }
    return { kind: "NOT_RESEARCHED" };
  }

  function dispositionLabel(result, isDue = false) {
    if (result.kind === "ANSWER") {
      if (result.answer.answer === "UNKNOWN") return "判断保留";
      if (isDue) return "要再確認";
      return {
        YES: "できる",
        PARTIAL: "条件付き",
        NO: "できない",
      }[result.answer.answer] || "判断保留";
    }
    return {
      INSUFFICIENT_EVIDENCE: "判断保留",
      OUT_OF_SCOPE: "別製品",
      NOT_RESEARCHED: "未調査",
    }[result.kind] || "未調査";
  }

  const api = {
    conditionComparisonGroups,
    selectedConditionTaskId,
    productsForGroup,
    productResult,
    dispositionLabel,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ConditionComparison = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
