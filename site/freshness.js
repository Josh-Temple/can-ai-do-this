const CapabilityFreshness = (() => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  function parseIsoDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return null;
    const [, year, month, day] = match;
    return Date.UTC(Number(year), Number(month) - 1, Number(day));
  }

  function todayUtcDay(now = new Date()) {
    return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function formatIsoDay(timestamp) {
    return new Date(timestamp).toISOString().slice(0, 10);
  }

  function evaluate(record, answer, now = new Date()) {
    const checked = parseIsoDate(answer?.last_checked);
    const windowDays = Number(record?.review_window_days);

    if (checked === null || ![14, 30].includes(windowDays)) {
      return {
        state: "UNKNOWN",
        isDue: true,
        nextReview: null,
        daysLeft: null,
      };
    }

    const nextReviewAt = checked + windowDays * MS_PER_DAY;
    const daysLeft = Math.round((nextReviewAt - todayUtcDay(now)) / MS_PER_DAY);

    return {
      state: daysLeft <= 0 ? "DUE" : "CURRENT",
      isDue: daysLeft <= 0,
      nextReview: formatIsoDay(nextReviewAt),
      daysLeft,
    };
  }

  function recordStatus(record, now = new Date()) {
    const answers = record?.answers || [];
    const states = answers.map((answer) => evaluate(record, answer, now));
    const dueCount = states.filter((item) => item.isDue).length;
    return {
      dueCount,
      isDue: dueCount > 0,
      states,
    };
  }

  return { evaluate, recordStatus };
})();

if (typeof window !== "undefined") {
  window.CapabilityFreshness = CapabilityFreshness;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CapabilityFreshness;
}
