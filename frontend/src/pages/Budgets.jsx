import { useCallback, useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  Flame,
  Gauge,
  FileSpreadsheet,
  FileText,
  LineChart,
  RefreshCw,
  Save,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import GuestRestricted from "../components/GuestRestricted";
import { useToast } from "../components/ui";
import { CURRENCIES, useCurrency } from "../context/CurrencyContext";
import { fetchWithAuth } from "../services/apiClient";
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

const ADAPTIVE_PROFILE_STORAGE_KEY = "adaptive_budget_profiles_v1";
const MAX_SAVED_ADAPTIVE_PROFILES = 8;
const EXPENSE_START_MODE_OPTIONS = [
  {
    value: "start_from_now",
    label: "Start from now (zero baseline)",
    description: "Ignore earlier expenses for this month and start tracking from this save.",
  },
  {
    value: "include_existing",
    label: "Include current month expenses",
    description: "Use all expenses already recorded this month in budget calculations.",
  },
];

function safeDecodePathSegment(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getBudgetPlanPath(planId) {
  return `/budgets/${encodeURIComponent(planId)}`;
}

function loadSavedAdaptiveProfiles() {
  try {
    const raw = localStorage.getItem(ADAPTIVE_PROFILE_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.currency === "string"
    );
  } catch {
    return [];
  }
}

function persistSavedAdaptiveProfiles(profiles) {
  try {
    localStorage.setItem(ADAPTIVE_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Ignore storage failures so budgeting flow remains usable.
  }
}

function createAdaptiveProfile({
  monthlySalary,
  savingsPercentage,
  currency,
  expenseStartMode,
  budgetPeriodDays,
}) {
  const now = new Date();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `Plan ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    monthlySalary: toNumber(monthlySalary),
    savingsPercentage: toPercent(savingsPercentage),
    currency,
    expenseStartMode: expenseStartMode || "include_existing",
    budgetPeriodDays: Number(budgetPeriodDays) || 30,
    savedAt: now.toISOString(),
  };
}

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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDateOrNull(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function computeSpendPacing(remainingAmount, periodEnd) {
  const remaining = Math.max(0, toNumber(remainingAmount));
  const endDate = toDateOrNull(periodEnd);

  if (!endDate || remaining <= 0) {
    return {
      daysRemaining: 0,
      dailyTarget: 0,
      weeklyTarget: 0,
    };
  }

  const now = new Date();
  const millisRemaining = endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(1, Math.ceil(millisRemaining / MS_PER_DAY));
  const dailyTarget = remaining / daysRemaining;
  const weeklyTarget = Math.min(remaining, dailyTarget * 7);

  return {
    daysRemaining,
    dailyTarget,
    weeklyTarget,
  };
}

async function parseApiMessage(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
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
  const navigate = useNavigate();
  const { planId: rawPlanId } = useParams();
  const planId =
    typeof rawPlanId === "string" && rawPlanId.length > 0
      ? safeDecodePathSegment(rawPlanId)
      : null;
  const isPlanRoute = Boolean(planId);
  const [showDashboardMetrics, setShowDashboardMetrics] = useState(false);

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
  } = useAdaptiveBudgetStatus({ enabled: !isGuest && !isPlanRoute && showDashboardMetrics });

  const normalizedStatus = isPlanRoute || !showDashboardMetrics ? null : normalizeStatus(statusData);

  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isFetching: isAnalysisFetching,
    refetch: refetchAnalysis,
  } = useAdaptiveBudgetAnalysis({
    enabled: !isGuest && !isPlanRoute && showDashboardMetrics && Boolean(normalizedStatus?.usableBudget),
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
      expenseStartMode: budgetProfile?.expenseStartMode || "include_existing",
      budgetPeriodDays: String(Number(budgetProfile?.budgetPeriodDays) || 30),
    }),
    [budgetProfile, currentCurrency]
  );

  const inactiveMainForm = useMemo(
    () => ({
      monthlySalary: "",
      savingsPercentage: "",
      currency: currentCurrency || "LKR",
      expenseStartMode: "include_existing",
      budgetPeriodDays: "30",
    }),
    [currentCurrency]
  );

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSavedProfiles, setShowSavedProfiles] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState(() => loadSavedAdaptiveProfiles());
  const [categoryBudgets, setCategoryBudgets] = useState([]);
  const [isCategoryBudgetsLoading, setIsCategoryBudgetsLoading] = useState(false);
  const [isSyncingProfessionalPlan, setIsSyncingProfessionalPlan] = useState(false);

  const shouldShowProfessionalPlan = isPlanRoute || showDashboardMetrics;

  const activeSavedProfile = useMemo(() => {
    if (!isPlanRoute) {
      return null;
    }

    return savedProfiles.find((profile) => profile.id === planId) || null;
  }, [isPlanRoute, planId, savedProfiles]);

  const activeProfileForm = useMemo(() => {
    if (!activeSavedProfile) {
      return null;
    }

    return {
      monthlySalary:
        activeSavedProfile.monthlySalary === null || activeSavedProfile.monthlySalary === undefined
          ? ""
          : String(activeSavedProfile.monthlySalary),
      savingsPercentage: String(activeSavedProfile.savingsPercentage ?? 20),
      currency: activeSavedProfile.currency || currentCurrency || "LKR",
      expenseStartMode: activeSavedProfile.expenseStartMode || "include_existing",
      budgetPeriodDays: String(Number(activeSavedProfile.budgetPeriodDays) || 30),
    };
  }, [activeSavedProfile, currentCurrency]);

  const [draftForm, setDraftForm] = useState(null);
  const mainFormBase = showDashboardMetrics ? profileForm : inactiveMainForm;
  const form = draftForm ?? activeProfileForm ?? mainFormBase;

  const updateFormField = (field, value) => {
    setDraftForm((previous) => ({
      ...(previous ?? profileForm),
      [field]: value,
    }));
  };

  const selectedCurrency = form.currency || normalizedStatus?.currency || currentCurrency || "LKR";
  const selectedExpenseStartMode = form.expenseStartMode || "include_existing";
  const selectedBudgetPeriodDays = Number(form.budgetPeriodDays) || 30;

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

  const updateSavedProfiles = (updater) => {
    setSavedProfiles((previous) => {
      const next = typeof updater === "function" ? updater(previous) : updater;
      persistSavedAdaptiveProfiles(next);
      return next;
    });
  };

  const fetchCategoryBudgets = useCallback(async () => {
    const response = await fetchWithAuth("/budgets/with-spending");

    if (!response.ok) {
      throw new Error(await parseApiMessage(response, "Failed to load category budgets"));
    }

    const payload = await response.json();
    return Array.isArray(payload?.budgets) ? payload.budgets : [];
  }, []);

  const loadCategoryBudgets = useCallback(async () => {
    try {
      setIsCategoryBudgetsLoading(true);
      const budgets = await fetchCategoryBudgets();
      setCategoryBudgets(budgets);
      return budgets;
    } catch (error) {
      toast.error(error?.message || "Failed to load category budgets");
      return [];
    } finally {
      setIsCategoryBudgetsLoading(false);
    }
  }, [fetchCategoryBudgets, toast]);

  const syncProfessionalCategoryBudgets = useCallback(
    async ({ monthlySalary, savingsPercentage, expenseStartMode = "include_existing", silent = false }) => {
      const usableBudget = Math.max(0, monthlySalary - monthlySalary * (savingsPercentage / 100));

      if (usableBudget <= 0) {
        if (!silent) {
          toast.error("Usable budget is 0. Increase salary or reduce savings percentage.");
        }
        return;
      }

      try {
        setIsSyncingProfessionalPlan(true);

        const recommendationResponse = await fetchWithAuth("/budgets/generate-from-income", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monthlyIncome: usableBudget,
            maxLookbackMonths: 3,
          }),
        });

        if (!recommendationResponse.ok) {
          throw new Error(
            await parseApiMessage(recommendationResponse, "Failed to generate smart budget recommendations")
          );
        }

        const recommendationPayload = await recommendationResponse.json();
        const recommendations = Array.isArray(recommendationPayload?.recommendations)
          ? recommendationPayload.recommendations
          : [];

        const actionableRecommendations = recommendations
          .filter((entry) => Number(entry?.recommendedAmount) > 0 && typeof entry?.category === "string")
          .slice(0, 10);

        const existingBudgets = await fetchCategoryBudgets();
        const existingBudgetMap = new Map(
          existingBudgets.map((entry) => [
            `${String(entry.category || "").trim().toLowerCase()}|${String(entry.period || "monthly")}`,
            entry,
          ])
        );

        await Promise.all(
          actionableRecommendations.map(async (entry) => {
            const key = `${entry.category.trim().toLowerCase()}|monthly`;
            const limit = Math.max(10, Math.round(Number(entry.recommendedAmount)));
            const existing = existingBudgetMap.get(key);

            if (existing?._id) {
              await fetchWithAuth(`/budgets/${existing._id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  limit,
                  alertThreshold: 85,
                  active: true,
                  expenseStartMode,
                }),
              });
              return;
            }

            await fetchWithAuth("/budgets", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                category: entry.category,
                limit,
                period: "monthly",
                alertThreshold: 85,
                color: entry.type === "essential" ? "blue" : "cyan",
                expenseStartMode,
              }),
            });
          })
        );

        await loadCategoryBudgets();

        if (!silent) {
          toast.success("Professional category budgets synced with your spending data");
        }
      } catch (error) {
        if (!silent) {
          toast.error(error?.message || "Failed to sync professional category budgets");
        }
      } finally {
        setIsSyncingProfessionalPlan(false);
      }
    },
    [fetchCategoryBudgets, loadCategoryBudgets, toast]
  );

  useEffect(() => {
    if (!shouldShowProfessionalPlan || isGuest) {
      setCategoryBudgets([]);
      return;
    }

    let disposed = false;

    const initializeCategoryBudgets = async () => {
      setIsCategoryBudgetsLoading(true);
      try {
        const budgets = await fetchCategoryBudgets();
        if (!disposed) {
          setCategoryBudgets(budgets);
        }
      } catch {
        if (!disposed) {
          setCategoryBudgets([]);
        }
      } finally {
        if (!disposed) {
          setIsCategoryBudgetsLoading(false);
        }
      }
    };

    initializeCategoryBudgets();

    return () => {
      disposed = true;
    };
  }, [fetchCategoryBudgets, isGuest, shouldShowProfessionalPlan]);

  const spentPercentage = useMemo(() => {
    const usable = toNumber(normalizedStatus?.usableBudget);
    const spent = toNumber(normalizedStatus?.spent);

    if (usable <= 0) {
      return 0;
    }

    return Math.min(100, (spent / usable) * 100);
  }, [normalizedStatus]);

  const expenseWindowLabel = useMemo(() => {
    if (!normalizedStatus) {
      return "";
    }

    if (normalizedStatus.expenseStartMode !== "start_from_now") {
      return "Expense window: includes all expenses recorded in the current period.";
    }

    const start = toDateOrNull(normalizedStatus.expenseStartDate);
    if (!start) {
      return "Expense window: started from now (zero baseline).";
    }

    return `Expense window: started ${start.toLocaleDateString()} ${start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}.`;
  }, [normalizedStatus]);

  const runwayForecast = useMemo(() => {
    if (!normalizedStatus) {
      return {
        currentDailySpend: 0,
        projectedMonthSpend: 0,
        projectedEndBalance: 0,
        runwayDays: 0,
      };
    }

    const now = new Date();
    const currentDay = now.getDate();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const spent = toNumber(normalizedStatus.spent);
    const usableBudget = toNumber(normalizedStatus.usableBudget);
    const remaining = toNumber(normalizedStatus.remaining);
    const currentDailySpend = spent / Math.max(1, currentDay);
    const projectedMonthSpend = currentDailySpend * totalDays;
    const projectedEndBalance = usableBudget - projectedMonthSpend;
    const runwayDays = currentDailySpend > 0 ? remaining / currentDailySpend : 0;

    return {
      currentDailySpend,
      projectedMonthSpend,
      projectedEndBalance,
      runwayDays,
    };
  }, [normalizedStatus]);

  const handleRefresh = async () => {
    if (isPlanRoute) {
      if (shouldShowProfessionalPlan) {
        await loadCategoryBudgets();
      }
      return;
    }

    const tasks = [refetchStatus(), refetchAnalysis()];
    if (shouldShowProfessionalPlan) {
      tasks.push(loadCategoryBudgets());
    }

    await Promise.all(tasks);
  };

  const saveSettings = async ({ createAnother = false } = {}) => {
    const monthlySalary = toNumber(form.monthlySalary);
    const savingsPercentage = toPercent(form.savingsPercentage);
    const rawBudgetPeriodDays = Number(form.budgetPeriodDays);
    const budgetPeriodDays = Math.round(rawBudgetPeriodDays);

    if (!Number.isFinite(monthlySalary) || monthlySalary <= 0) {
      toast.error("Monthly salary must be greater than 0");
      return;
    }

    if (!Number.isFinite(savingsPercentage) || savingsPercentage < 0 || savingsPercentage >= 100) {
      toast.error("Savings percentage must be between 0 and less than 100");
      return;
    }

    if (
      !Number.isFinite(rawBudgetPeriodDays) ||
      !Number.isInteger(budgetPeriodDays) ||
      budgetPeriodDays < 1 ||
      budgetPeriodDays > 365
    ) {
      toast.error("Budget period must be an integer between 1 and 365 days");
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        monthlySalary,
        savingsPercentage,
        currency: form.currency,
        expenseStartMode: selectedExpenseStartMode,
        budgetPeriodDays,
      });

      changeCurrency(form.currency);

      if (isPlanRoute && planId && !createAnother) {
        updateSavedProfiles((previous) =>
          previous.map((profile) =>
            profile.id === planId
              ? {
                  ...profile,
                  monthlySalary,
                  savingsPercentage,
                  currency: form.currency,
                  expenseStartMode: selectedExpenseStartMode,
                  budgetPeriodDays,
                  savedAt: new Date().toISOString(),
                }
              : profile
          )
        );

        void syncProfessionalCategoryBudgets({
          monthlySalary,
          savingsPercentage,
          expenseStartMode: selectedExpenseStartMode,
          silent: true,
        });

        toast.success("Budget updated successfully");
        return;
      }

      if (createAnother) {
        const profile = createAdaptiveProfile({
          monthlySalary,
          savingsPercentage,
          currency: form.currency,
          expenseStartMode: selectedExpenseStartMode,
          budgetPeriodDays,
        });

        updateSavedProfiles((previous) => [profile, ...previous].slice(0, MAX_SAVED_ADAPTIVE_PROFILES));
        setShowSavedProfiles(true);
        setDraftForm({
          monthlySalary: "",
          savingsPercentage: String(savingsPercentage),
          currency: form.currency,
          expenseStartMode: selectedExpenseStartMode,
          budgetPeriodDays: String(budgetPeriodDays),
        });
        setShowDashboardMetrics(false);

        if (isPlanRoute) {
          navigate("/budgets");
        }

        toast.success("Budget saved. Previous budget is kept in Saved Plans.");
      } else {
        if (!isPlanRoute) {
          setShowDashboardMetrics(true);
        }
        void syncProfessionalCategoryBudgets({
          monthlySalary,
          savingsPercentage,
          expenseStartMode: selectedExpenseStartMode,
          silent: true,
        });
        toast.success("Adaptive budget settings saved");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to save adaptive budget settings");
    }
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    await saveSettings();
  };

  const handleSaveAndCreateAnother = async () => {
    await saveSettings({ createAnother: true });
  };

  const handleOpenSavedProfile = (profile) => {
    setDraftForm(null);
    navigate(getBudgetPlanPath(profile.id));
  };

  const handleDeleteSavedProfile = (profileId) => {
    updateSavedProfiles((previous) => previous.filter((profile) => profile.id !== profileId));

    if (isPlanRoute && planId === profileId) {
      setDraftForm(null);
      navigate("/budgets");
      toast.success("Saved plan removed");
    }
  };

  const handleBackToBudgets = () => {
    setDraftForm(null);
    setShowDashboardMetrics(false);
    navigate("/budgets");
  };

  const exportBudgetPdf = () => {
    if (!normalizedStatus) {
      toast.error("Budget status is not ready to export yet");
      return;
    }

    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text("Adaptive Budget Report", 14, 18);
    doc.setFontSize(11);
    doc.text(`Generated: ${generatedAt}`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [["Metric", "Value"]],
      body: [
        ["Status", normalizedStatus.status],
        ["Remaining Budget", formatAmount(normalizedStatus.remaining, selectedCurrency)],
        ["Daily Limit", formatAmount(normalizedStatus.dailyLimit, selectedCurrency)],
        ["Weekly Limit", formatAmount(normalizedStatus.weeklyLimit, selectedCurrency)],
        ["Spent", formatAmount(normalizedStatus.spent, selectedCurrency)],
        ["Expected Spend", formatAmount(normalizedStatus.expectedSpend, selectedCurrency)],
        ["Budget Used", `${spentPercentage.toFixed(1)}%`],
      ],
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 14, right: 14 },
    });

    if (categoryBreakdown.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Category", "Type", "Current Month", "Avg Monthly", "Leak"]],
        body: categoryBreakdown.map((item) => [
          item.category,
          item.type,
          formatAmount(item.currentMonthSpent, selectedCurrency),
          formatAmount(item.averageMonthly, selectedCurrency),
          item.isLeak ? "Yes" : "No",
        ]),
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 41, 59] },
        margin: { left: 14, right: 14 },
      });
    }

    doc.save(`budget-report-${new Date().toISOString().split("T")[0]}.pdf`);
    setShowExportMenu(false);
  };

  const exportBudgetCsv = () => {
    if (!normalizedStatus) {
      toast.error("Budget status is not ready to export yet");
      return;
    }

    const rows = [
      ["Metric", "Value"],
      ["Status", normalizedStatus.status],
      ["Remaining Budget", formatAmount(normalizedStatus.remaining, selectedCurrency)],
      ["Daily Limit", formatAmount(normalizedStatus.dailyLimit, selectedCurrency)],
      ["Weekly Limit", formatAmount(normalizedStatus.weeklyLimit, selectedCurrency)],
      ["Spent", formatAmount(normalizedStatus.spent, selectedCurrency)],
      ["Expected Spend", formatAmount(normalizedStatus.expectedSpend, selectedCurrency)],
      ["Budget Used", `${spentPercentage.toFixed(1)}%`],
      [],
      ["Category", "Type", "Current Month", "Avg Monthly", "Leak"],
      ...categoryBreakdown.map((item) => [
        item.category,
        item.type,
        item.currentMonthSpent,
        item.averageMonthly,
        item.isLeak ? "Yes" : "No",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `budget-report-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    setShowExportMenu(false);
  };

  if (isGuest) {
    return <GuestRestricted featureName="Adaptive Budgeting" />;
  }

  if (isPlanRoute && !activeSavedProfile) {
    return (
      <div className="rounded-2xl border border-light-border-default dark:border-dark-border-default bg-light-surface-secondary dark:bg-dark-surface-primary p-6 shadow-premium dark:shadow-card-dark">
        <p className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">This saved budget could not be found.</p>
        <button
          type="button"
          onClick={handleBackToBudgets}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-light-border-default dark:border-dark-border-default px-3 py-2 text-sm font-semibold text-light-text-primary transition hover:bg-light-bg-accent dark:text-dark-text-primary dark:hover:bg-dark-surface-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Budgets
        </button>
      </div>
    );
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
              {isPlanRoute
                ? "Editing a saved budget plan. Update values and save changes instantly."
                : "Savings is locked. Budget risk is tracked in real-time. Crisis controls activate automatically."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isPlanRoute && (
              <button
                type="button"
                onClick={handleBackToBudgets}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-300/40 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/35"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            {!isPlanRoute && showDashboardMetrics && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((previous) => !previous)}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-300/40 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/35"
              >
                <Download className="h-4 w-4" />
                Export Budget
                <ChevronDown className={`h-4 w-4 transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-light-border-default dark:border-dark-border-strong bg-white shadow-xl dark:bg-dark-surface-primary dark:shadow-glow-gold/20">
                  <button
                    type="button"
                    onClick={exportBudgetPdf}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-light-text-primary transition-colors hover:bg-blue-50 dark:text-dark-text-primary dark:hover:bg-blue-500/10"
                  >
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">Export as PDF</p>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Formatted budget summary</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={exportBudgetCsv}
                    className="flex w-full items-center gap-3 border-t border-light-border-default px-4 py-3 text-left text-light-text-primary transition-colors hover:bg-blue-50 dark:border-dark-border-default dark:text-dark-text-primary dark:hover:bg-blue-500/10"
                  >
                    <FileSpreadsheet className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Export as CSV</p>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Spreadsheet compatible</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
            )}

            {!isPlanRoute && showDashboardMetrics && (
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-300/40 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/35"
              >
                <RefreshCw className={`h-4 w-4 ${(isStatusFetching || isAnalysisFetching) ? "animate-spin" : ""}`} />
                Refresh Status
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-light-border-default dark:border-dark-border-strong bg-light-surface-secondary dark:bg-dark-surface-primary p-6 shadow-premium dark:shadow-card-dark">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
              {isPlanRoute ? "Edit Saved Budget" : "Budget Configuration"}
            </h2>
          </div>

          {isPlanRoute && activeSavedProfile && (
            <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              {activeSavedProfile.name}
            </p>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-light-text-secondary dark:text-dark-text-secondary">Monthly Salary</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monthlySalary ?? ""}
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
              value={form.savingsPercentage ?? ""}
              onChange={(event) => updateFormField("savingsPercentage", event.target.value)}
              className="w-full rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-light-text-secondary dark:text-dark-text-secondary">Currency</span>
            <select
              value={form.currency ?? "LKR"}
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

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-light-text-secondary dark:text-dark-text-secondary">Budget Period (Days)</span>
            <input
              type="number"
              min="1"
              max="365"
              step="1"
              value={form.budgetPeriodDays ?? "30"}
              onChange={(event) => updateFormField("budgetPeriodDays", event.target.value)}
              className="w-full rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary focus:border-blue-500 focus:outline-none"
              placeholder="e.g. 30"
            />
          </label>

          <div className="flex items-end">
            <div className="w-full space-y-2">
              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isPlanRoute ? "Save Changes" : "Save Settings"}
              </button>

              <button
                type="button"
                onClick={handleSaveAndCreateAnother}
                disabled={updateSettingsMutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary px-4 py-2.5 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary transition hover:bg-light-bg-accent dark:hover:bg-dark-surface-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPlanRoute ? "Save as New Plan" : "Save and Create Another"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-light-text-secondary dark:text-dark-text-secondary">
            New Budget Expense Start
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {EXPENSE_START_MODE_OPTIONS.map((option) => {
              const isActive = selectedExpenseStartMode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateFormField("expenseStartMode", option.value)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    isActive
                      ? "border-blue-500 bg-blue-50/80 dark:border-blue-400 dark:bg-blue-500/15"
                      : "border-light-border-default bg-light-surface-secondary hover:bg-light-bg-accent dark:border-dark-border-default dark:bg-dark-surface-primary dark:hover:bg-dark-surface-secondary"
                  }`}
                >
                  <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">{option.label}</p>
                  <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

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

        {!isPlanRoute && (
        <div className="mt-4 rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary p-3">
          <button
            type="button"
            onClick={() => setShowSavedProfiles((previous) => !previous)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
              Saved Plans ({savedProfiles.length})
            </span>
            <ChevronDown className={`h-4 w-4 text-light-text-secondary transition-transform dark:text-dark-text-secondary ${showSavedProfiles ? "rotate-180" : ""}`} />
          </button>

          {showSavedProfiles && (
            <div className="mt-3 space-y-2">
              {savedProfiles.length === 0 && (
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  No saved plans yet. Use Save and Create Another to keep this budget and start a new one.
                </p>
              )}

              {savedProfiles.map((profile) => (
                <div
                  key={profile.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenSavedProfile(profile)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleOpenSavedProfile(profile);
                    }
                  }}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg border border-light-border-default px-3 py-2 transition hover:bg-light-bg-accent/60 dark:border-dark-border-default dark:hover:bg-dark-surface-primary"
                >
                  <div>
                    <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">{profile.name}</p>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      {formatAmount(profile.monthlySalary, profile.currency)} | {profile.savingsPercentage}% savings | {Number(profile.budgetPeriodDays) || 30} day period | {profile.currency}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenSavedProfile(profile);
                      }}
                      className="rounded-md border border-light-border-default dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-light-text-primary transition hover:bg-light-bg-accent dark:text-dark-text-primary dark:hover:bg-dark-surface-primary"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteSavedProfile(profile.id);
                      }}
                      className="rounded-md border border-danger-200 px-2.5 py-1.5 text-xs font-semibold text-danger-700 transition hover:bg-danger-50 dark:border-danger-500/40 dark:text-danger-300 dark:hover:bg-danger-500/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </section>

      {shouldShowProfessionalPlan && (
        <section className="rounded-2xl border border-light-border-default dark:border-dark-border-strong bg-light-surface-secondary dark:bg-dark-surface-primary p-6 shadow-premium dark:shadow-card-dark">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Professional Budget Plan</h2>
            <button
              type="button"
              onClick={() => {
                const monthlySalary = toNumber(form.monthlySalary);
                const savingsPercentage = toPercent(form.savingsPercentage);

                if (!Number.isFinite(monthlySalary) || monthlySalary <= 0) {
                  toast.error("Add monthly salary to generate your professional category plan");
                  return;
                }

                void syncProfessionalCategoryBudgets({
                  monthlySalary,
                  savingsPercentage,
                  expenseStartMode: selectedExpenseStartMode,
                });
              }}
              disabled={isSyncingProfessionalPlan}
              className="inline-flex items-center gap-2 rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary px-3 py-2 text-sm font-semibold text-light-text-primary transition hover:bg-light-bg-accent dark:text-dark-text-primary dark:hover:bg-dark-surface-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSyncingProfessionalPlan ? "Syncing plan..." : "Regenerate Smart Plan"}
            </button>
          </div>

          {isCategoryBudgetsLoading ? (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Loading category budgets...</p>
          ) : categoryBudgets.length === 0 ? (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              No category budgets yet. Save your budget settings to auto-generate a transaction-aware spending plan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-light-border-default dark:border-dark-border-default">
                    <th className="px-3 py-2 text-left text-light-text-secondary dark:text-dark-text-secondary">Category</th>
                    <th className="px-3 py-2 text-right text-light-text-secondary dark:text-dark-text-secondary">Budget</th>
                    <th className="px-3 py-2 text-right text-light-text-secondary dark:text-dark-text-secondary">Spent</th>
                    <th className="px-3 py-2 text-right text-light-text-secondary dark:text-dark-text-secondary">Remaining</th>
                    <th className="px-3 py-2 text-right text-light-text-secondary dark:text-dark-text-secondary">Daily Target</th>
                    <th className="px-3 py-2 text-right text-light-text-secondary dark:text-dark-text-secondary">Weekly Target</th>
                    <th className="px-3 py-2 text-right text-light-text-secondary dark:text-dark-text-secondary">Used</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBudgets.map((budget) => {
                    const usage = Math.max(0, Number(budget.percentage || 0));
                    const pacing = computeSpendPacing(budget.remaining, budget.periodEnd);
                    const usageClassName =
                      usage >= 100
                        ? "text-danger-600 dark:text-danger-400"
                        : usage >= 85
                        ? "text-warning-600 dark:text-warning-400"
                        : "text-success-600 dark:text-success-400";

                    return (
                      <tr key={budget._id} className="border-b border-light-border-subtle dark:border-dark-border-default/60">
                        <td className="px-3 py-2 font-medium text-light-text-primary dark:text-dark-text-primary">{budget.category}</td>
                        <td className="px-3 py-2 text-right text-light-text-primary dark:text-dark-text-primary">
                          {formatAmount(budget.limit, selectedCurrency)}
                        </td>
                        <td className="px-3 py-2 text-right text-light-text-primary dark:text-dark-text-primary">
                          {formatAmount(budget.spent, selectedCurrency)}
                        </td>
                        <td className="px-3 py-2 text-right text-light-text-primary dark:text-dark-text-primary">
                          {formatAmount(budget.remaining, selectedCurrency)}
                        </td>
                        <td className="px-3 py-2 text-right text-light-text-primary dark:text-dark-text-primary">
                          {formatAmount(pacing.dailyTarget, selectedCurrency)}
                        </td>
                        <td className="px-3 py-2 text-right text-light-text-primary dark:text-dark-text-primary">
                          {formatAmount(pacing.weeklyTarget, selectedCurrency)}
                        </td>
                        <td className={`px-3 py-2 text-right font-semibold ${usageClassName}`}>{usage.toFixed(0)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {showDashboardMetrics && statusError && !normalizedStatus && (
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
              <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {normalizedStatus.daysLeft} day(s) left in this {normalizedStatus.periodDays || selectedBudgetPeriodDays}-day period
              </p>
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
              <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">Strict cap for the remaining period</p>
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
              <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Budget Burn Curve</h2>
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
            <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">{expenseWindowLabel}</p>
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

      {showDashboardMetrics && !isPlanRoute && (
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

            <article className="rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary p-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Spending Runway Forecast</h3>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-surface-secondary/80 dark:bg-dark-surface-primary/80 p-3">
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Current Daily Spend</p>
                  <p className="mt-1 text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {formatAmount(runwayForecast.currentDailySpend, selectedCurrency)}
                  </p>
                </div>

                <div className="rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-surface-secondary/80 dark:bg-dark-surface-primary/80 p-3">
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Projected Month Spend</p>
                  <p className="mt-1 text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {formatAmount(runwayForecast.projectedMonthSpend, selectedCurrency)}
                  </p>
                </div>

                <div className="rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-surface-secondary/80 dark:bg-dark-surface-primary/80 p-3">
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Projected End Balance</p>
                  <p className={`mt-1 text-base font-semibold ${runwayForecast.projectedEndBalance < 0 ? "text-danger-600 dark:text-danger-400" : "text-success-600 dark:text-success-400"}`}>
                    {formatAmount(runwayForecast.projectedEndBalance, selectedCurrency)}
                  </p>
                  <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {runwayForecast.runwayDays > 0
                      ? `Runway: ${Math.max(0, runwayForecast.runwayDays).toFixed(1)} day(s) at current pace`
                      : "Runway data appears after spending activity"}
                  </p>
                </div>
              </div>
            </article>
          </div>
        )}
      </section>
      )}
    </div>
  );
}
