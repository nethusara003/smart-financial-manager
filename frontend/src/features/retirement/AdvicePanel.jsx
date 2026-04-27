const badgeByRisk = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Moderate: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-red-200 bg-red-50 text-red-700",
};

const AdvicePanel = ({ advice }) => {
  if (!advice) {
    return null;
  }

  const strategies = Array.isArray(advice.strategies) ? advice.strategies : [];
  const riskClass = badgeByRisk[advice.riskLevel] || "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-surface-secondary p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">AI Advisory</h2>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskClass}`}>
          Risk: {advice.riskLevel || "N/A"}
        </span>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-border-strong dark:bg-dark-surface-elevated">
        <p className="text-sm leading-6 text-gray-700 dark:text-dark-text-secondary">
          {advice.explanation || "No explanation available."}
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {strategies.map((strategy, index) => (
          <article
            key={`${strategy}-${index}`}
            className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-400/30 dark:bg-blue-900/20"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              Strategy {index + 1}
            </p>
            <p className="text-sm text-blue-900 dark:text-blue-100">{strategy}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdvicePanel;
