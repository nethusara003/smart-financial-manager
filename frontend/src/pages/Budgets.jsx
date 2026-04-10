import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Flame,
  LineChart,
  RefreshCw,
  Save,
  ShieldAlert,
  Wallet,
} from "lucide-react";

import GuestRestricted from "../components/GuestRestricted";
import { useToast } from "../components/ui";
import { CURRENCIES, useCurrency } from "../context/CurrencyContext";
import {
  useAdaptiveBudgetAnalysis,
  useAdaptiveBudgetSettings,
  useAdaptiveBudgetStatus,
  useUpdateAdaptiveBudgetSettings,
} from "../hooks/useAdaptiveBudget";

const STATUS_STYLE = {
  SAFE: {
    container: "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-500/30",
    text: "text-success-700 dark:text-success-300",
    icon: CheckCircle2,
    title: "Stable",
  },
  WARNING: {
    container: "bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-500/30",
    text: "text-warning-700 dark:text-warning-300",
    icon: AlertTriangle,
    title: "Overspending Detected",
  },
  CRISIS: {
    container: "bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-500/30",
    text: "text-danger-700 dark:text-danger-300",
    icon: ShieldAlert,
    title: "Survival Mode",
  },
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPercent(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.min(99.99, parsed));
}

function formatAmount(value, currencyCode) {
  const symbol = CURRENCIES[currencyCode]?.symbol || "";
  const formatted = toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`.trim();
}

function normalizeStatus(statusPayload) {
  if (!statusPayload || typeof statusPayload !== "object") {
    return null;
  }

  return {
    ...statusPayload,
    status: statusPayload.status || "SAFE",
    mode: statusPayload.mode || statusPayload.status || "SAFE",
    recommendations: Array.isArray(statusPayload.recommendations)
      ? statusPayload.recommendations
      : [],
    actions: Array.isArray(statusPayload.actions) ? statusPayload.actions : [],
    allowedCategories: Array.isArray(statusPayload.allowedCategories)
      ? statusPayload.allowedCategories
      : [],
    blockedCategories: Array.isArray(statusPayload.blockedCategories)
      ? statusPayload.blockedCategories
      : [],
  };
}

export default function Budgets({ auth }) {
  const toast = useToast();
  const { currentCurrency, changeCurrency } = useCurrency();

  const isGuest = Boolean(auth?.isGuest);

  const {
    data: budgetProfile,
    isLoading: isProfileLoading,
  } = useAdaptiveBudgetSettings({ enabled: !isGuest });

  const {
    data: statusData,
    isLoading: isStatusLoading,
    isFetching: isStatusFetching,
    refetch: refetchStatus,
    error: statusError,
  } = useAdaptiveBudgetStatus({ enabled: !isGuest });

  const normalizedStatus = normalizeStatus(statusData);

  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isFetching: isAnalysisFetching,
    refetch: refetchAnalysis,
  } = useAdaptiveBudgetAnalysis({
    enabled: !isGuest && Boolean(normalizedStatus?.usableBudget),
  });

  const updateSettingsMutation = useUpdateAdaptiveBudgetSettings();

  const profileForm = useMemo(
    () => ({
      monthlySalary:
        budgetProfile?.monthlySalary === null || budgetProfile?.monthlySalary === undefined
          ? ""
          : String(budgetProfile?.monthlySalary),
      savingsPercentage: String(budgetProfile?.savingsPercentage ?? 20),
      currency: budgetProfile?.currency || currentCurrency || "LKR",
    }),
    [budgetProfile, currentCurrency]
  );

  const [draftForm, setDraftForm] = useState(null);
  const form = draftForm ?? profileForm;

  const updateFormField = (field, value) => {
    setDraftForm((previous) => ({
      ...(previous ?? profileForm),
      [field]: value,
    }));
  };

  const selectedCurrency = form.currency || normalizedStatus?.currency || currentCurrency || "LKR";

  const salaryPreview = toNumber(form.monthlySalary);
  const savingsPreview = toPercent(form.savingsPercentage);
  const savingsAmountPreview = salaryPreview * (savingsPreview / 100);
  const usableBudgetPreview = Math.max(0, salaryPreview - savingsAmountPreview);

  const statusKey = normalizedStatus?.status || "SAFE";
  const statusStyle = STATUS_STYLE[statusKey] || STATUS_STYLE.SAFE;
  const StatusIcon = statusStyle.icon;

  const categoryBreakdown = analysisData?.categoryBreakdown || [];
  const historyInsights = analysisData?.historyInsights || {};
  const topSpendingCategories = historyInsights.topSpendingCategories || [];
  const biggestLeaks = historyInsights.biggestLeaks || [];
  const monthlyTotals = historyInsights.monthlyTotals || [];

  const spentPercentage = useMemo(() => {
    const usable = toNumber(normalizedStatus?.usableBudget);
    const spent = toNumber(normalizedStatus?.spent);

    if (usable <= 0) {
      return 0;
    }

    return Math.min(100, (spent / usable) * 100);
  }, [normalizedStatus]);

  const handleRefresh = async () => {
    await Promise.all([refetchStatus(), refetchAnalysis()]);
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();

    const monthlySalary = toNumber(form.monthlySalary);
    const savingsPercentage = toPercent(form.savingsPercentage);

    if (!Number.isFinite(monthlySalary) || monthlySalary <= 0) {
      toast.error("Monthly salary must be greater than 0");
      return;
    }

    if (!Number.isFinite(savingsPercentage) || savingsPercentage < 0 || savingsPercentage >= 100) {
      toast.error("Savings percentage must be between 0 and less than 100");
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        monthlySalary,
        savingsPercentage,
        currency: form.currency,
      });

      changeCurrency(form.currency);
      toast.success("Adaptive budget settings saved");
    } catch (error) {
      toast.error(error?.message || "Failed to save adaptive budget settings");
    }
  };

  if (isGuest) {
    return <GuestRestricted featureName="Adaptive Budgeting" />;
  }

  if (isProfileLoading && isStatusLoading && !normalizedStatus) {
    return (
      <div className="flex min-h-[480px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-3 text-light-text-secondary dark:text-dark-text-secondary">Loading adaptive budget engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-2xl border border-light-border-default dark:border-dark-border-strong bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-2xl dark:shadow-glow-blue">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Deterministic Protection Engine</p>
            <h1 className="mt-2 text-3xl font-bold">Adaptive Budget System</h1>
            <p className="mt-2 text-sm text-blue-100">
              Savings is locked. Budget risk is tracked in real-time. Crisis controls activate automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-300/40 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/35"
          >
            <RefreshCw className={`h-4 w-4 ${(isStatusFetching || isAnalysisFetching) ? "animate-spin" : ""}`} />
            Refresh Status
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-light-border-default dark:border-dark-border-strong bg-light-surface-secondary dark:bg-dark-surface-primary p-6 shadow-premium dark:shadow-card-dark">
        <div className="mb-4 flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">Budget Configuration</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-light-text-secondary dark:text-dark-text-secondary">Monthly Salary</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monthlySalary}
              onChange={(event) => updateFormField("monthlySalary", event.target.value)}
              className="w-full rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary focus:border-blue-500 focus:outline-none"
              placeholder="Enter salary"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-light-text-secondary dark:text-dark-text-secondary">Savings %</span>
            <input
              type="number"
              min="0"
              max="99.99"
              step="0.01"
              value={form.savingsPercentage}
              onChange={(event) => updateFormField("savingsPercentage", event.target.value)}
              className="w-full rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-light-text-secondary dark:text-dark-text-secondary">Currency</span>
            <select
              value={form.currency}
              onChange={(event) => updateFormField("currency", event.target.value)}
              className="w-full rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary focus:border-blue-500 focus:outline-none"
            >
              {Object.keys(CURRENCIES).map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        </form>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary p-3">
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Preview Savings Amount</p>
            <p className="mt-1 text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              {formatAmount(savingsAmountPreview, selectedCurrency)}
            </p>
          </div>
          <div className="rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary p-3">
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Preview Usable Budget</p>
            <p className="mt-1 text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              {formatAmount(usableBudgetPreview, selectedCurrency)}
            </p>
          </div>
          <div className="rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary p-3">
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Savings Lock Rule</p>
            <p className="mt-1 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Locked and never spendable</p>
          </div>
        </div>
      </section>

      {statusError && !normalizedStatus && (
        <section className="rounded-2xl border border-warning-300 dark:border-warning-500/30 bg-warning-50 dark:bg-warning-900/20 p-4">
          <p className="text-sm font-medium text-warning-800 dark:text-warning-200">{statusError.message}</p>
          <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
            Set monthly salary and savings percentage above to activate adaptive budgeting.
          </p>
        </section>
      )}

      {normalizedStatus && (
        <>
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <article className={`rounded-2xl border p-4 ${statusStyle.container}`}>
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${statusStyle.text}`} />
                <p className={`text-sm font-semibold ${statusStyle.text}`}>{statusStyle.title}</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{normalizedStatus.status}</p>
              <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">{normalizedStatus.daysLeft} days left this month</p>
            </article>

            <article className="rounded-2xl border border-light-border-default dark:border-dark-border-strong bg-light-surface-secondary dark:bg-dark-surface-primary p-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Remaining</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {formatAmount(normalizedStatus.remaining, selectedCurrency)}
              </p>
              <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                From usable {formatAmount(normalizedStatus.usableBudget, selectedCurrency)}
              </p>
            </article>

            <article className="rounded-2xl border border-light-border-default dark:border-dark-border-strong bg-light-surface-secondary dark:bg-dark-surface-primary p-4">
              <div className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Daily Limit</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {formatAmount(normalizedStatus.dailyLimit, selectedCurrency)}
              </p>
              <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">Strict cap for the rest of month</p>
            </article>

            <article className="rounded-2xl border border-light-border-default dark:border-dark-border-strong bg-light-surface-secondary dark:bg-dark-surface-primary p-4">
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Weekly Limit</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {formatAmount(normalizedStatus.weeklyLimit, selectedCurrency)}
              </p>
              <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">Recomputed after each refresh</p>
            </article>
          </section>

          <section className="rounded-2xl border border-light-border-default dark:border-dark-border-strong bg-light-surface-secondary dark:bg-dark-surface-primary p-6 shadow-premium dark:shadow-card-dark">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Monthly Burn Curve</h2>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Spent {formatAmount(normalizedStatus.spent, selectedCurrency)} vs expected {formatAmount(normalizedStatus.expectedSpend, selectedCurrency)}
              </p>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-light-bg-accent dark:bg-dark-surface-secondary">
              <div
                className={`h-full rounded-full ${normalizedStatus.status === "CRISIS" ? "bg-danger-500" : normalizedStatus.status === "WARNING" ? "bg-warning-500" : "bg-success-500"}`}
                style={{ width: `${spentPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">{spentPercentage.toFixed(1)}% of usable budget consumed</p>
          </section>

          {normalizedStatus.mode === "CRISIS" && (
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <article className="rounded-2xl border border-danger-200 dark:border-danger-500/30 bg-danger-50 dark:bg-danger-900/20 p-4 lg:col-span-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-danger-600 dark:text-danger-400" />
                  <h3 className="text-lg font-semibold text-danger-700 dark:text-danger-300">Crisis Actions</h3>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-danger-800 dark:text-danger-200">
                  {normalizedStatus.actions.map((action) => (
                    <li key={action}>• {action}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-danger-200 dark:border-danger-500/30 bg-light-surface-secondary dark:bg-dark-surface-primary p-4">
                <h4 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Blocked Categories</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {normalizedStatus.blockedCategories.length === 0 && (
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">None</span>
                  )}
                  {normalizedStatus.blockedCategories.map((category) => (
                    <span key={category} className="rounded-full bg-danger-100 px-2.5 py-1 text-xs font-medium text-danger-700 dark:bg-danger-500/20 dark:text-danger-300">
                      {category}
                    </span>
                  ))}
                </div>
                <h4 className="mt-4 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Allowed Categories</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {normalizedStatus.allowedCategories.length === 0 && (
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">None</span>
                  )}
                  {normalizedStatus.allowedCategories.map((category) => (
                    <span key={category} className="rounded-full bg-success-100 px-2.5 py-1 text-xs font-medium text-success-700 dark:bg-success-500/20 dark:text-success-300">
                      {category}
                    </span>
                  ))}
                </div>
              </article>
            </section>
          )}

          {normalizedStatus.mode === "WARNING" && (
            <section className="rounded-2xl border border-warning-200 dark:border-warning-500/30 bg-warning-50 dark:bg-warning-900/20 p-4">
              <h3 className="text-lg font-semibold text-warning-800 dark:text-warning-200">Warning Recommendations</h3>
              <ul className="mt-3 space-y-2 text-sm text-warning-800 dark:text-warning-200">
                {normalizedStatus.recommendations.map((recommendation) => (
                  <li key={recommendation}>• {recommendation}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <section className="rounded-2xl border border-light-border-default dark:border-dark-border-strong bg-light-surface-secondary dark:bg-dark-surface-primary p-6 shadow-premium dark:shadow-card-dark">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Historical Analysis</h2>
          {(isAnalysisLoading || isAnalysisFetching) && (
            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Refreshing analysis...</span>
          )}
        </div>

        {categoryBreakdown.length === 0 ? (
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Add expense transactions to unlock category-level leak detection and survival budget optimization.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-light-border-default dark:border-dark-border-default">
                    <th className="px-3 py-2 text-left text-light-text-secondary dark:text-dark-text-secondary">Category</th>
                    <th className="px-3 py-2 text-left text-light-text-secondary dark:text-dark-text-secondary">Type</th>
                    <th className="px-3 py-2 text-right text-light-text-secondary dark:text-dark-text-secondary">Current Month</th>
                    <th className="px-3 py-2 text-right text-light-text-secondary dark:text-dark-text-secondary">Avg Monthly</th>
                    <th className="px-3 py-2 text-right text-light-text-secondary dark:text-dark-text-secondary">Leak</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map((item) => (
                    <tr key={item.category} className="border-b border-light-border-subtle dark:border-dark-border-default/60">
                      <td className="px-3 py-2 font-medium text-light-text-primary dark:text-dark-text-primary">{item.category}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.type === "ESSENTIAL" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" : "bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-300"}`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-light-text-primary dark:text-dark-text-primary">{formatAmount(item.currentMonthSpent, selectedCurrency)}</td>
                      <td className="px-3 py-2 text-right text-light-text-primary dark:text-dark-text-primary">{formatAmount(item.averageMonthly, selectedCurrency)}</td>
                      <td className="px-3 py-2 text-right">
                        {item.isLeak ? (
                          <span className="text-danger-600 dark:text-danger-400">Yes</span>
                        ) : (
                          <span className="text-success-600 dark:text-success-400">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <article className="rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary p-4">
                <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Average Monthly Spend</h3>
                <p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                  {formatAmount(historyInsights.avgMonthlySpend || 0, selectedCurrency)}
                </p>
              </article>

              <article className="rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary p-4 lg:col-span-2">
                <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Top Spending Categories</h3>
                <div className="mt-3 space-y-2">
                  {topSpendingCategories.length === 0 && (
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No history yet</p>
                  )}
                  {topSpendingCategories.map((item) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                      <span className="text-light-text-primary dark:text-dark-text-primary">{item.category}</span>
                      <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{formatAmount(item.total, selectedCurrency)}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary p-4">
                <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Biggest Non-Essential Leaks</h3>
                <div className="mt-3 space-y-2">
                  {biggestLeaks.length === 0 && (
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No non-essential leaks found</p>
                  )}
                  {biggestLeaks.map((item) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                      <span className="text-light-text-primary dark:text-dark-text-primary">{item.category}</span>
                      <span className="font-semibold text-danger-600 dark:text-danger-400">{formatAmount(item.total, selectedCurrency)}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary p-4">
                <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">3-Month Totals</h3>
                <div className="mt-3 space-y-2">
                  {monthlyTotals.length === 0 && (
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No monthly totals yet</p>
                  )}
                  {monthlyTotals.map((entry) => (
                    <div key={entry.month} className="flex items-center justify-between text-sm">
                      <span className="text-light-text-primary dark:text-dark-text-primary">{entry.month}</span>
                      <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{formatAmount(entry.total, selectedCurrency)}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
