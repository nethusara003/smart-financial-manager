import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import MonthlyBudgetSnapshot from "../models/MonthlyBudgetSnapshot.js";

const MIN_USABLE_BUDGET_THRESHOLD = 1000;
const HISTORY_MONTHS = 3;
const DEFAULT_BUDGET_PERIOD_DAYS = 30;
const MIN_BUDGET_PERIOD_DAYS = 1;
const MAX_BUDGET_PERIOD_DAYS = 365;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const DEFAULT_CATEGORIES = [
  { name: "food", type: "ESSENTIAL", priority: 1 },
  { name: "rent", type: "ESSENTIAL", priority: 1 },
  { name: "transport", type: "ESSENTIAL", priority: 1 },
  { name: "utilities", type: "ESSENTIAL", priority: 1 },
  { name: "healthcare", type: "ESSENTIAL", priority: 1 },
  { name: "insurance", type: "ESSENTIAL", priority: 1 },
  { name: "education", type: "ESSENTIAL", priority: 2 },
  { name: "bills", type: "ESSENTIAL", priority: 1 },
  { name: "entertainment", type: "NON_ESSENTIAL", priority: 3 },
  { name: "shopping", type: "NON_ESSENTIAL", priority: 3 },
  { name: "subscriptions", type: "NON_ESSENTIAL", priority: 3 },
  { name: "luxury", type: "NON_ESSENTIAL", priority: 4 },
  { name: "travel", type: "NON_ESSENTIAL", priority: 3 },
];

const CATEGORY_LOOKUP = new Map(
  DEFAULT_CATEGORIES.map((category) => [category.name, category])
);

export class AdaptiveBudgetValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AdaptiveBudgetValidationError";
    this.statusCode = 400;
  }
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function normalizeCategoryName(value) {
  return String(value || "").trim().toLowerCase();
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthBounds(referenceDate) {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
  return { start, end };
}

function normalizeBudgetPeriodDays(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_BUDGET_PERIOD_DAYS;
  }

  const integerDays = Math.round(parsed);
  return Math.max(MIN_BUDGET_PERIOD_DAYS, Math.min(MAX_BUDGET_PERIOD_DAYS, integerDays));
}

function resolveBudgetPeriodWindow({ now, configuredStartDate, periodDays }) {
  const safePeriodDays = normalizeBudgetPeriodDays(periodDays);
  let anchorStart = toDateOrNull(configuredStartDate) || now;

  if (anchorStart.getTime() > now.getTime()) {
    anchorStart = now;
  }

  const elapsedMs = Math.max(0, now.getTime() - anchorStart.getTime());
  const elapsedDaysSinceAnchor = Math.floor(elapsedMs / MS_PER_DAY);
  const cyclesPassed = Math.floor(elapsedDaysSinceAnchor / safePeriodDays);

  const periodStart = new Date(anchorStart.getTime() + cyclesPassed * safePeriodDays * MS_PER_DAY);
  const periodEnd = new Date(periodStart.getTime() + safePeriodDays * MS_PER_DAY);

  const elapsedMsInCycle = Math.max(0, now.getTime() - periodStart.getTime());
  const currentDay = Math.min(safePeriodDays, Math.floor(elapsedMsInCycle / MS_PER_DAY) + 1);
  const daysLeft = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / MS_PER_DAY));

  return {
    periodDays: safePeriodDays,
    periodStart,
    periodEnd,
    currentDay,
    daysLeft,
  };
}

function toDateOrNull(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveExpenseWindowStart({ periodStart, mode, configuredStartDate, now }) {
  if (mode !== "start_from_now") {
    return periodStart;
  }

  const explicitStart = toDateOrNull(configuredStartDate) || now;
  if (explicitStart.getTime() <= periodStart.getTime()) {
    return periodStart;
  }

  return explicitStart;
}

function getHistoryStartDate(referenceDate, months) {
  return new Date(referenceDate.getFullYear(), referenceDate.getMonth() - (months - 1), 1);
}

function buildMonthSeries(referenceDate, months) {
  const result = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const point = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - offset, 1);
    result.push(getMonthKey(point));
  }

  return result;
}

function resolveCategoryMetadata(categoryName, dynamicCategoryMap) {
  const normalized = normalizeCategoryName(categoryName);

  if (dynamicCategoryMap.has(normalized)) {
    return dynamicCategoryMap.get(normalized);
  }

  if (CATEGORY_LOOKUP.has(normalized)) {
    return CATEGORY_LOOKUP.get(normalized);
  }

  return {
    name: normalized,
    type: "NON_ESSENTIAL",
    priority: 4,
  };
}

function deriveSavingsAndBudget(monthlySalary, savingsPercentage) {
  if (!Number.isFinite(monthlySalary) || monthlySalary <= 0) {
    throw new AdaptiveBudgetValidationError("Monthly salary must be a positive number.");
  }

  if (!Number.isFinite(savingsPercentage) || savingsPercentage < 0) {
    throw new AdaptiveBudgetValidationError("Savings percentage must be between 0 and 99.99.");
  }

  if (savingsPercentage >= 100) {
    throw new AdaptiveBudgetValidationError("Savings percentage must be less than 100.");
  }

  const savingsAmount = monthlySalary * (savingsPercentage / 100);
  const usableBudget = monthlySalary - savingsAmount;

  if (usableBudget <= 0) {
    throw new AdaptiveBudgetValidationError("Usable budget must be greater than 0.");
  }

  return {
    savingsAmount: roundMoney(savingsAmount),
    usableBudget: roundMoney(usableBudget),
  };
}

async function getCategoryTypeMap() {
  const categories = await Category.find({}, { name: 1, type: 1, priority: 1, _id: 0 }).lean();

  if (!categories.length) {
    return new Map(
      DEFAULT_CATEGORIES.map((category) => [
        category.name,
        {
          name: category.name,
          type: category.type,
          priority: category.priority,
        },
      ])
    );
  }

  return new Map(
    categories.map((category) => {
      const normalizedName = normalizeCategoryName(category.name);
      return [
        normalizedName,
        {
          name: normalizedName,
          type: category.type,
          priority: category.priority,
        },
      ];
    })
  );
}

async function aggregateCategorySpend(userId, startDate, endDate) {
  const docs = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: "expense",
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $project: {
        normalizedCategory: {
          $toLower: {
            $trim: { input: "$category" },
          },
        },
        amount: "$amount",
      },
    },
    {
      $group: {
        _id: "$normalizedCategory",
        total: { $sum: "$amount" },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  return new Map(docs.map((doc) => [normalizeCategoryName(doc._id), roundMoney(doc.total)]));
}

async function aggregateMonthlyTotals(userId, startDate, endDate) {
  const docs = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: "expense",
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  return docs.map((doc) => ({
    month: `${doc._id.year}-${String(doc._id.month).padStart(2, "0")}`,
    total: roundMoney(doc.total),
  }));
}

async function aggregateTotalSpent(userId, startDate, endDate) {
  const [result] = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: "expense",
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  return roundMoney(result?.total || 0);
}

function determineStatus({ remaining, usableBudget, daysLeft, isOverspending }) {
  const isEndOfMonthWindow = daysLeft <= 3;

  if (remaining <= 0) {
    return "CRISIS";
  }

  if (!isEndOfMonthWindow && remaining < usableBudget * 0.3 && daysLeft > 7) {
    return "CRISIS";
  }

  if (isOverspending) {
    return "WARNING";
  }

  return "SAFE";
}

function computeLimit(remaining, divisor) {
  if (remaining <= 0) {
    return 0;
  }

  const safeDivisor = Math.max(1, divisor);
  return roundMoney(remaining / safeDivisor);
}

function getEssentialReductionPercent(remaining, usableBudget, isOverspending) {
  const ratio = usableBudget > 0 ? remaining / usableBudget : 0;

  if (ratio <= 0.1) {
    return 50;
  }

  if (ratio <= 0.2) {
    return 40;
  }

  if (ratio <= 0.3) {
    return 30;
  }

  if (isOverspending) {
    return 25;
  }

  return 20;
}

function buildCrisisPlan({
  remaining,
  daysLeft,
  usableBudget,
  currentSpendByCategory,
  historySpendByCategory,
  categoryTypeMap,
  isOverspending,
}) {
  if (remaining <= 0) {
    return {
      mode: "CRISIS",
      remaining: 0,
      weeklyLimit: 0,
      dailyLimit: 0,
      allowedCategories: [],
      blockedCategories: ["all"],
      actions: ["Stop all spending immediately"],
      categoryPlan: [],
    };
  }

  const safeDaysLeft = Math.max(1, daysLeft);
  const weeksLeft = Math.max(1, Math.ceil(safeDaysLeft / 7));
  const dailyLimit = computeLimit(remaining, safeDaysLeft);
  const weeklyLimit = computeLimit(remaining, weeksLeft);
  const essentialReductionPercent = getEssentialReductionPercent(
    remaining,
    usableBudget,
    isOverspending
  );

  const categoryNames = new Set([
    ...DEFAULT_CATEGORIES.map((category) => category.name),
    ...currentSpendByCategory.keys(),
    ...historySpendByCategory.keys(),
    ...categoryTypeMap.keys(),
  ]);

  const blockedCategories = [];
  const allowedCategories = [];
  const categoryPlan = [];

  categoryNames.forEach((categoryName) => {
    const normalized = normalizeCategoryName(categoryName);

    if (!normalized) {
      return;
    }

    const metadata = resolveCategoryMetadata(normalized, categoryTypeMap);
    const currentSpent = roundMoney(currentSpendByCategory.get(normalized) || 0);
    const historicalTotal = roundMoney(historySpendByCategory.get(normalized) || 0);
    const historicalAverageMonthly = roundMoney(historicalTotal / HISTORY_MONTHS);

    if (metadata.type === "NON_ESSENTIAL") {
      blockedCategories.push(normalized);
      categoryPlan.push({
        category: normalized,
        type: metadata.type,
        priority: metadata.priority,
        currentMonthSpent: currentSpent,
        historicalAverageMonthly,
        allowedBudget: 0,
      });
      return;
    }

    const baseline = historicalAverageMonthly > 0 ? historicalAverageMonthly : currentSpent;
    const allowedBudget = roundMoney(Math.max(0, baseline * (1 - essentialReductionPercent / 100)));

    allowedCategories.push(normalized);
    categoryPlan.push({
      category: normalized,
      type: metadata.type,
      priority: metadata.priority,
      currentMonthSpent: currentSpent,
      historicalAverageMonthly,
      allowedBudget,
    });
  });

  const uniqueAllowedCategories = [...new Set(allowedCategories)].sort((a, b) => a.localeCompare(b));
  const uniqueBlockedCategories = [...new Set(blockedCategories)].sort((a, b) => a.localeCompare(b));

  return {
    mode: "CRISIS",
    remaining: roundMoney(remaining),
    weeklyLimit,
    dailyLimit,
    allowedCategories: uniqueAllowedCategories,
    blockedCategories: uniqueBlockedCategories,
    actions: [
      "Strict survival mode activated",
      "Cut all non-essential expenses",
      `Reduce essential spending by ${essentialReductionPercent}%`,
      `Do not exceed daily limit of ${dailyLimit}`,
    ],
    categoryPlan: categoryPlan.sort((a, b) => a.priority - b.priority || b.currentMonthSpent - a.currentMonthSpent),
  };
}

function buildWarningActions(expectedSpend, spent, dailyLimit) {
  return [
    `You are spending faster than plan (${roundMoney(spent - expectedSpend)} above expected).`,
    "Reduce non-essential spending this week.",
    `Keep daily spending below ${dailyLimit} until month end.`,
  ];
}

function buildSafetyWarnings(usableBudget, currency) {
  if (usableBudget >= MIN_USABLE_BUDGET_THRESHOLD) {
    return [];
  }

  return [
    `Usable monthly budget is very low (${roundMoney(usableBudget)} ${currency}). Consider reducing savings percentage.`,
  ];
}

async function buildHistoryInsights(userId, now, categoryTypeMap) {
  const historyStart = getHistoryStartDate(now, HISTORY_MONTHS);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthSeries = buildMonthSeries(now, HISTORY_MONTHS);

  const [historySpendByCategory, monthlyTotalsRaw] = await Promise.all([
    aggregateCategorySpend(userId, historyStart, currentMonthEnd),
    aggregateMonthlyTotals(userId, historyStart, currentMonthEnd),
  ]);

  const monthTotalMap = new Map(monthlyTotalsRaw.map((row) => [row.month, row.total]));
  const monthlyTotals = monthSeries.map((month) => ({
    month,
    total: roundMoney(monthTotalMap.get(month) || 0),
  }));

  const totalHistorySpend = monthlyTotals.reduce((sum, row) => sum + row.total, 0);
  const avgMonthlySpend = roundMoney(totalHistorySpend / HISTORY_MONTHS);

  const categoryTotals = [...historySpendByCategory.entries()].map(([category, total]) => {
    const metadata = resolveCategoryMetadata(category, categoryTypeMap);

    return {
      category,
      total: roundMoney(total),
      type: metadata.type,
      priority: metadata.priority,
    };
  });

  categoryTotals.sort((a, b) => b.total - a.total);

  return {
    monthlyTotals,
    totalHistorySpend: roundMoney(totalHistorySpend),
    avgMonthlySpend,
    topSpendingCategories: categoryTotals.slice(0, 5),
    biggestLeaks: categoryTotals
      .filter((item) => item.type === "NON_ESSENTIAL")
      .slice(0, 5),
    historySpendByCategory,
  };
}

async function saveMonthlySnapshot({
  userId,
  month,
  salary,
  savings,
  usableBudget,
  spent,
  remaining,
  status,
  dailyLimit,
  weeklyLimit,
}) {
  await MonthlyBudgetSnapshot.findOneAndUpdate(
    { userId, month },
    {
      userId,
      month,
      salary,
      savings,
      usableBudget,
      spent,
      remaining,
      status,
      dailyLimit,
      weeklyLimit,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
}

export async function computeAdaptiveBudgetStatus(user) {
  if (!user) {
    throw new AdaptiveBudgetValidationError("User was not provided.");
  }

  if (user.isGuest) {
    throw new AdaptiveBudgetValidationError("Guest users cannot access adaptive budget status.");
  }

  const monthlySalary = Number(user.monthlySalary);
  const savingsPercentage = Number(user.savingsPercentage);
  const currency = user.currency || "LKR";

  const { savingsAmount, usableBudget } = deriveSavingsAndBudget(
    monthlySalary,
    savingsPercentage
  );

  const now = new Date();
  const configuredPeriodStartDate = toDateOrNull(user.budgetPeriodStartDate);
  const budgetPeriodDays = normalizeBudgetPeriodDays(user.budgetPeriodDays);
  let periodWindow;

  if (configuredPeriodStartDate) {
    periodWindow = resolveBudgetPeriodWindow({
      now,
      configuredStartDate: configuredPeriodStartDate,
      periodDays: budgetPeriodDays,
    });
  } else {
    // Preserve month behavior only when period length exactly matches this calendar month.
    const { start: monthStart, end: monthEnd } = getMonthBounds(now);
    const monthDays = Math.max(1, Math.ceil((monthEnd.getTime() - monthStart.getTime()) / MS_PER_DAY));

    if (budgetPeriodDays === monthDays) {
      periodWindow = {
        periodDays: monthDays,
        periodStart: monthStart,
        periodEnd: monthEnd,
        currentDay: now.getDate(),
        daysLeft: Math.max(0, monthDays - now.getDate()),
      };
    } else {
      periodWindow = resolveBudgetPeriodWindow({
        now,
        configuredStartDate: now,
        periodDays: budgetPeriodDays,
      });
    }
  }
  const expenseStartMode = user.expenseStartMode === "start_from_now"
    ? "start_from_now"
    : "include_existing";
  const effectiveExpenseStartDate = resolveExpenseWindowStart({
    periodStart: periodWindow.periodStart,
    mode: expenseStartMode,
    configuredStartDate: user.expenseStartDate,
    now,
  });
  const categoryTypeMap = await getCategoryTypeMap();

  const [spent, currentSpendByCategory, historyInsights] = await Promise.all([
    aggregateTotalSpent(user._id, effectiveExpenseStartDate, periodWindow.periodEnd),
    aggregateCategorySpend(user._id, effectiveExpenseStartDate, periodWindow.periodEnd),
    buildHistoryInsights(user._id, now, categoryTypeMap),
  ]);

  const currentDay = periodWindow.currentDay;
  const totalDays = periodWindow.periodDays;
  const daysLeft = periodWindow.daysLeft;

  const remaining = roundMoney(usableBudget - spent);
  const expectedSpend = roundMoney((currentDay / totalDays) * usableBudget);
  const isOverspending = spent > expectedSpend;
  const status = determineStatus({ remaining, usableBudget, daysLeft, isOverspending });

  const safeDaysLeft = Math.max(1, daysLeft);
  const weeksLeft = Math.max(1, Math.ceil(safeDaysLeft / 7));
  const dailyLimit = computeLimit(remaining, safeDaysLeft);
  const weeklyLimit = computeLimit(remaining, weeksLeft);

  const baseResponse = {
    status,
    month: getMonthKey(now),
    salary: roundMoney(monthlySalary),
    savingsPercentage: roundMoney(savingsPercentage),
    savings: savingsAmount,
    usableBudget,
    spent,
    remaining: roundMoney(Math.max(remaining, 0)),
    expectedSpend,
    currentDay,
    totalDays,
    daysLeft,
    dailyLimit,
    weeklyLimit,
    isOverspending,
    currency,
    periodDays: periodWindow.periodDays,
    periodStart: periodWindow.periodStart,
    periodEnd: periodWindow.periodEnd,
    expenseStartMode,
    expenseStartDate: effectiveExpenseStartDate,
    recommendations: [],
    warnings: buildSafetyWarnings(usableBudget, currency),
  };

  if (status === "CRISIS") {
    const crisisPlan = buildCrisisPlan({
      remaining,
      daysLeft,
      usableBudget,
      currentSpendByCategory,
      historySpendByCategory: historyInsights.historySpendByCategory,
      categoryTypeMap,
      isOverspending,
    });

    baseResponse.mode = "CRISIS";
    baseResponse.dailyLimit = crisisPlan.dailyLimit;
    baseResponse.weeklyLimit = crisisPlan.weeklyLimit;
    baseResponse.allowedCategories = crisisPlan.allowedCategories;
    baseResponse.blockedCategories = crisisPlan.blockedCategories;
    baseResponse.actions = crisisPlan.actions;
    baseResponse.categoryPlan = crisisPlan.categoryPlan;
  } else if (status === "WARNING") {
    baseResponse.mode = "WARNING";
    baseResponse.recommendations = buildWarningActions(expectedSpend, spent, dailyLimit);
  } else {
    baseResponse.mode = "SAFE";
  }

  await saveMonthlySnapshot({
    userId: user._id,
    month: getMonthKey(now),
    salary: roundMoney(monthlySalary),
    savings: savingsAmount,
    usableBudget,
    spent,
    remaining,
    status,
    dailyLimit: baseResponse.dailyLimit,
    weeklyLimit: baseResponse.weeklyLimit,
  });

  return baseResponse;
}

export async function getAdaptiveBudgetAnalysis(user) {
  if (!user) {
    throw new AdaptiveBudgetValidationError("User was not provided.");
  }

  if (user.isGuest) {
    throw new AdaptiveBudgetValidationError("Guest users cannot access adaptive budget analysis.");
  }

  const now = new Date();
  const categoryTypeMap = await getCategoryTypeMap();
  const status = await computeAdaptiveBudgetStatus(user);

  const statusPeriodStartDate = toDateOrNull(status?.periodStart);
  const statusPeriodEndDate = toDateOrNull(status?.periodEnd);
  const { start: monthStart, end: monthEnd } = getMonthBounds(now);
  const periodStartDate = statusPeriodStartDate || monthStart;
  const periodEndDate = statusPeriodEndDate || monthEnd;
  const statusStartDate = toDateOrNull(status?.expenseStartDate);
  const analysisStartDate =
    statusStartDate && statusStartDate.getTime() > periodStartDate.getTime()
      ? statusStartDate
      : periodStartDate;
  const [currentSpendByCategory, historyInsights] = await Promise.all([
    aggregateCategorySpend(user._id, analysisStartDate, periodEndDate),
    buildHistoryInsights(user._id, now, categoryTypeMap),
  ]);

  const categorySet = new Set([
    ...currentSpendByCategory.keys(),
    ...historyInsights.historySpendByCategory.keys(),
  ]);

  const categoryBreakdown = [...categorySet]
    .map((categoryName) => {
      const metadata = resolveCategoryMetadata(categoryName, categoryTypeMap);
      const currentMonthSpent = roundMoney(currentSpendByCategory.get(categoryName) || 0);
      const last3MonthTotal = roundMoney(historyInsights.historySpendByCategory.get(categoryName) || 0);
      const averageMonthly = roundMoney(last3MonthTotal / HISTORY_MONTHS);

      return {
        category: categoryName,
        type: metadata.type,
        priority: metadata.priority,
        currentMonthSpent,
        last3MonthTotal,
        averageMonthly,
        isLeak: metadata.type === "NON_ESSENTIAL" && currentMonthSpent > averageMonthly,
      };
    })
    .sort((a, b) => b.currentMonthSpent - a.currentMonthSpent);

  return {
    status,
    categoryBreakdown,
    historyInsights: {
      topSpendingCategories: historyInsights.topSpendingCategories,
      avgMonthlySpend: historyInsights.avgMonthlySpend,
      biggestLeaks: historyInsights.biggestLeaks,
      monthlyTotals: historyInsights.monthlyTotals,
    },
  };
}
