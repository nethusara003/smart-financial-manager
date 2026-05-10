import { useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const buildHistogram = (values, binCount = 16) => {
  if (!Array.isArray(values) || values.length === 0) {
    return { labels: [], counts: [] };
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
    return { labels: [], counts: [] };
  }

  if (minValue === maxValue) {
    return {
      labels: [`${minValue.toFixed(0)}`],
      counts: [values.length],
    };
  }

  const width = (maxValue - minValue) / binCount;
  const counts = Array.from({ length: binCount }, () => 0);
  const labels = Array.from({ length: binCount }, (_, index) => {
    const lower = minValue + index * width;
    const upper = lower + width;
    return `${Math.round(lower).toLocaleString()} - ${Math.round(upper).toLocaleString()}`;
  });

  values.forEach((value) => {
    const safeValue = Number(value);
    if (!Number.isFinite(safeValue)) {
      return;
    }

    const rawIndex = Math.floor((safeValue - minValue) / width);
    const index = Math.min(binCount - 1, Math.max(0, rawIndex));
    counts[index] += 1;
  });

  return { labels, counts };
};

const formatCurrency = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "0.00";
  }
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Compact formatter for chart axis labels (e.g. 42.0M, 850K)
const formatCompact = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  if (Math.abs(number) >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(number) >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`;
  if (Math.abs(number) >= 1_000) return `${(number / 1_000).toFixed(1)}K`;
  return number.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

const formatProbability = (value) => {
  const safeValue = Math.max(0, Math.min(1, Number(value) || 0));
  return `${(safeValue * 100).toFixed(2)}%`;
};

const formatWholeNumber = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
};

const RetirementResult = ({ deterministic, simulation, planInput = null }) => {
  const [showDetails, setShowDetails] = useState(false);

  const histogram = useMemo(
    () => buildHistogram(simulation?.allSimulations || []),
    [simulation?.allSimulations]
  );

  const simulationCount = simulation?.allSimulations?.length || 0;
  const targetAmount = Number(planInput?.targetAmount || 0);
  const projectedFund = Number(deterministic?.projectedFund || 0);
  const medianOutcome = Number(simulation?.median || deterministic?.projectedFund || 0);
  const confidenceRange = `${formatCurrency(simulation?.percentile10)} to ${formatCurrency(simulation?.percentile90)}`;
  const planGap = Number.isFinite(targetAmount) && targetAmount > 0 ? targetAmount - projectedFund : null;
  const goalStatus =
    Number.isFinite(targetAmount) && targetAmount > 0
      ? projectedFund >= targetAmount
        ? "Projected outcome is above your target."
        : `Projected outcome is ${formatCurrency(Math.abs(planGap || 0))} below your target.`
      : "Add a target amount to compare your projected outcome against your goal.";

  const highestBinIndex = histogram.counts.length ? histogram.counts.indexOf(Math.max(...histogram.counts)) : -1;
  const highestBinLabel = histogram.labels[highestBinIndex] || "No distribution data";

  const chartData = useMemo(
    () => ({
      labels: histogram.labels,
      datasets: [
        {
          label: "Simulation Frequency",
          data: histogram.counts,
          backgroundColor: histogram.counts.map((count, index) => {
            const spread = histogram.counts.length > 0 ? (index + 1) / histogram.counts.length : 1;
            const boost = Math.min(0.18, count / Math.max(1, simulationCount * 0.02));
            return `rgba(37, 99, 235, ${Math.min(0.92, 0.35 + spread * 0.45 + boost)})`;
          }),
          borderColor: "rgba(37, 99, 235, 1)",
          borderWidth: 1.5,
          borderRadius: 8,
          barPercentage: 0.95,
          categoryPercentage: 0.82,
          maxBarThickness: 36,
        },
      ],
    }),
    [histogram.counts, histogram.labels, simulationCount]
  );

  if (!deterministic || !simulation) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-surface-secondary p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
        Retirement Forecast Results
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">Projected Fund</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {formatCurrency(deterministic.projectedFund)}
          </p>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">Probability of Success</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">
            {formatProbability(simulation.probabilityOfSuccess)}
          </p>
        </div>

        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm text-indigo-700">P10 (Downside)</p>
          <p className="mt-1 text-2xl font-bold text-indigo-900">
            {formatCurrency(simulation.percentile10)}
          </p>
        </div>

        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm text-purple-700">P90 (Upside)</p>
          <p className="mt-1 text-2xl font-bold text-purple-900">
            {formatCurrency(simulation.percentile90)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/50 p-4 shadow-sm dark:border-dark-border-default dark:from-dark-surface-secondary dark:via-dark-surface-secondary dark:to-dark-surface-elevated">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-dark-text-primary">
              Plan Snapshot
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-dark-text-secondary">
              Your current plan is based on {formatWholeNumber(simulationCount)} simulated futures. The middle band shows where most outcomes landed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((previous) => !previous)}
            className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-dark-border-strong dark:bg-dark-surface-primary dark:text-dark-text-primary dark:hover:bg-dark-surface-elevated"
          >
            {showDetails ? "Hide the details" : "Show the details"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-white/90 p-3 shadow-sm dark:bg-dark-surface-primary">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-dark-text-secondary">Typical outcome</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              {formatCurrency(medianOutcome)}
            </p>
          </div>
          <div className="rounded-xl bg-white/90 p-3 shadow-sm dark:bg-dark-surface-primary">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-dark-text-secondary">Middle 80% range</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              {confidenceRange}
            </p>
          </div>
          <div className="rounded-xl bg-white/90 p-3 shadow-sm dark:bg-dark-surface-primary">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-dark-text-secondary">Most common band</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              {highestBinLabel}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900 dark:border-dark-border-strong dark:bg-dark-surface-elevated dark:text-dark-text-secondary">
          <p className="font-semibold text-blue-800 dark:text-dark-text-primary">How to read this</p>
          <p className="mt-1">
            Higher bars mean more simulated outcomes landed in that fund range. The summary cards above explain the most likely result, the middle range, and the strongest concentration of outcomes in plain language.
          </p>
          <p className="mt-2 font-medium">{goalStatus}</p>
        </div>

        {showDetails && (
          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-border-default dark:bg-dark-surface-primary">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-semibold text-gray-800 dark:text-dark-text-primary">
                    Monte Carlo Distribution
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    This chart shows where the simulated ending balances cluster.
                  </p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-dark-surface-elevated dark:text-dark-text-primary">
                  80% confidence band
                </span>
              </div>

              <div className="h-[360px]">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => ` ${context.parsed.y} simulations fell in this range`,
                        },
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          maxRotation: 45,
                          minRotation: 30,
                          autoSkip: true,
                          maxTicksLimit: 8,
                          color: "#6b7280",
                          // Show compact label from just the lower bound of each bin
                          callback: (_, index) => {
                            const label = histogram.labels[index] || "";
                            const lower = label.split(" - ")[0]?.replace(/,/g, "");
                            return formatCompact(Number(lower));
                          },
                        },
                        grid: {
                          display: false,
                        },
                      },
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: "#6b7280",
                          precision: 0,
                        },
                        grid: {
                          color: "rgba(148, 163, 184, 0.18)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-border-default dark:bg-dark-surface-primary">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-dark-text-secondary">Current plan context</p>
                <div className="mt-3 space-y-3 text-sm text-gray-700 dark:text-dark-text-secondary">
                  <div className="flex items-center justify-between gap-3">
                    <span>Current savings used</span>
                    <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                      {formatCurrency(planInput?.currentSavings || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Monthly savings used</span>
                    <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                      {formatCurrency(planInput?.monthlySavings || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Planning years</span>
                    <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                      {planInput?.years || "n/a"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Target amount</span>
                    <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                      {formatCurrency(targetAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-dark-border-strong dark:bg-dark-surface-elevated">
                <p className="text-sm font-semibold text-emerald-800 dark:text-dark-text-primary">Plain-language takeaway</p>
                <p className="mt-2 text-sm text-emerald-900 dark:text-dark-text-secondary">
                  If the bars cluster well above your target, your plan has breathing room. If they sit below it, the result is more sensitive to market swings and contribution changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RetirementResult;
