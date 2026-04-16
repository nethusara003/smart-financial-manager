import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";
import Bill from "../models/Bill.js";

const SCORE_WEIGHTS = {
  savingsRatio: 30,
  expenseToIncomeRatio: 30,
  debtRatio: 20,
  budgetAdherence: 10,
  goalProgress: 10,
};

const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value) => Number(Number(value || 0).toFixed(2));
const normalizeCategory = (value) => String(value || "").trim().toLowerCase();

function interpolateScore(value, points) {
  if (!Array.isArray(points) || points.length === 0) {
    return 0;
  }

  if (value <= points[0].x) {
    return points[0].y;
  }

  for (let i = 1; i < points.length; i += 1) {
    const left = points[i - 1];
    const right = points[i];

    if (value <= right.x) {
      const span = right.x - left.x;
      if (span <= 0) {
        return right.y;
      }
      const ratio = (value - left.x) / span;
      return left.y + (right.y - left.y) * ratio;
    }
  }

  return points[points.length - 1].y;
}

function getCategoryByScore(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 30) return "Poor";
  return "Critical";
}

function getTransactionsForPeriod(userId, months = 3, referenceDate = new Date()) {
  const endDate = new Date(referenceDate);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - months);

  return Transaction.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
    scope: { $ne: "wallet" },
  });
}

function calculateSavingsRatio(income, expenses) {
  const weight = SCORE_WEIGHTS.savingsRatio;

  if (income <= 0) {
    return {
      score: 0,
      ratio: 0,
      category: "No Data",
      weight,
      weightedScore: 0,
      details: {
        monthlySavings: 0,
        savingsPercentage: "0%",
        trend: "unknown",
      },
    };
  }

  const savings = income - expenses;
  const ratio = (savings / income) * 100;

  const score = clamp(
    round(
      interpolateScore(ratio, [
        { x: -20, y: 0 },
        { x: 0, y: 35 },
        { x: 10, y: 60 },
        { x: 20, y: 80 },
        { x: 35, y: 95 },
        { x: 50, y: 100 },
      ])
    ),
    0,
    100
  );

  const trend = ratio >= 20 ? "improving" : ratio >= 10 ? "stable" : "declining";

  return {
    score,
    ratio: round(ratio),
    category: getCategoryByScore(score),
    weight,
    weightedScore: round((score * weight) / 100),
    details: {
      monthlySavings: round(savings),
      savingsPercentage: `${round(ratio)}%`,
      trend,
    },
  };
}

function calculateExpenseToIncomeRatio(income, expenses) {
  const weight = SCORE_WEIGHTS.expenseToIncomeRatio;

  if (income <= 0) {
    return {
      score: 0,
      ratio: 0,
      category: "No Data",
      weight,
      weightedScore: 0,
      details: {
        monthlyExpenses: 0,
        expensePercentage: "0%",
        efficiency: "unknown",
      },
    };
  }

  const ratio = (expenses / income) * 100;

  const score = clamp(
    round(
      interpolateScore(ratio, [
        { x: 40, y: 100 },
        { x: 55, y: 90 },
        { x: 70, y: 75 },
        { x: 85, y: 55 },
        { x: 100, y: 25 },
        { x: 120, y: 0 },
      ])
    ),
    0,
    100
  );

  const efficiency = ratio <= 60 ? "high" : ratio <= 80 ? "moderate" : "low";

  return {
    score,
    ratio: round(ratio),
    category: getCategoryByScore(score),
    weight,
    weightedScore: round((score * weight) / 100),
    details: {
      monthlyExpenses: round(expenses),
      expensePercentage: `${round(ratio)}%`,
      efficiency,
    },
  };
}

function toMonthlyEquivalent(amount, frequency) {
  const value = Number(amount || 0);
  if (value <= 0) {
    return 0;
  }

  switch (String(frequency || "monthly").toLowerCase()) {
    case "weekly":
      return (value * 52) / 12;
    case "biweekly":
      return (value * 26) / 12;
    case "quarterly":
      return value / 3;
    case "yearly":
      return value / 12;
    case "monthly":
    default:
      return value;
  }
}

async function calculateDebtRatio(userId, monthlyIncome) {
  const weight = SCORE_WEIGHTS.debtRatio;

  if (monthlyIncome <= 0) {
    return {
      score: 0,
      ratio: 0,
      category: "No Data",
      weight,
      weightedScore: 0,
      details: {
        monthlyDebtPayments: 0,
        debtPercentage: "0%",
        numberOfDebts: 0,
        status: "unknown",
      },
    };
  }

  const debtCategories = ["loan", "credit_card", "mortgage", "emi"];
  const debtBills = await Bill.find({
    userId,
    category: { $in: debtCategories },
    recurring: true,
  });

  const monthlyDebtPayments = debtBills.reduce(
    (sum, bill) => sum + toMonthlyEquivalent(bill.amount, bill.frequency),
    0
  );

  const ratio = (monthlyDebtPayments / monthlyIncome) * 100;

  const score = clamp(
    round(
      interpolateScore(ratio, [
        { x: 5, y: 100 },
        { x: 15, y: 88 },
        { x: 25, y: 72 },
        { x: 35, y: 55 },
        { x: 50, y: 30 },
        { x: 70, y: 5 },
        { x: 90, y: 0 },
      ])
    ),
    0,
    100
  );

  const status =
    ratio < 20 ? "manageable" : ratio < 35 ? "watch" : ratio < 50 ? "high_pressure" : "critical";

  return {
    score,
    ratio: round(ratio),
    category: getCategoryByScore(score),
    weight,
    weightedScore: round((score * weight) / 100),
    details: {
      monthlyDebtPayments: round(monthlyDebtPayments),
      debtPercentage: `${round(ratio)}%`,
      numberOfDebts: debtBills.length,
      status,
    },
  };
}

function getBudgetUtilizationScore(utilization) {
  if (!Number.isFinite(utilization) || utilization < 0) {
    return 0;
  }

  if (utilization <= 0.2) {
    return interpolateScore(utilization, [
      { x: 0, y: 65 },
      { x: 0.2, y: 75 },
    ]);
  }

  if (utilization <= 0.8) {
    return interpolateScore(utilization, [
      { x: 0.2, y: 75 },
      { x: 0.8, y: 95 },
    ]);
  }

  if (utilization <= 1.0) {
    return interpolateScore(utilization, [
      { x: 0.8, y: 95 },
      { x: 1.0, y: 85 },
    ]);
  }

  if (utilization <= 1.2) {
    return interpolateScore(utilization, [
      { x: 1.0, y: 85 },
      { x: 1.2, y: 60 },
    ]);
  }

  if (utilization <= 1.5) {
    return interpolateScore(utilization, [
      { x: 1.2, y: 60 },
      { x: 1.5, y: 30 },
    ]);
  }

  return interpolateScore(utilization, [
    { x: 1.5, y: 30 },
    { x: 2.0, y: 0 },
  ]);
}

async function calculateBudgetAdherence(userId, months = 3, referenceDate = new Date()) {
  const weight = SCORE_WEIGHTS.budgetAdherence;
  const budgets = await Budget.find({ userId, active: true });

  if (budgets.length === 0) {
    return {
      score: 55,
      adherence: 0,
      category: "No Budgets",
      weight,
      weightedScore: round((55 * weight) / 100),
      details: {
        totalBudgets: 0,
        categoriesOnTrack: 0,
        adherenceRate: "0%",
        categoryBreakdown: {},
      },
    };
  }

  const periodEnd = new Date(referenceDate);
  const periodStart = new Date(periodEnd);
  periodStart.setMonth(periodStart.getMonth() - months);

  const expenses = await Transaction.find({
    user: userId,
    type: "expense",
    date: { $gte: periodStart, $lte: periodEnd },
    scope: { $ne: "wallet" },
  });

  const expenseByCategory = expenses.reduce((acc, tx) => {
    const key = normalizeCategory(tx.category);
    const amount = Number(tx.amount || 0);
    acc[key] = (acc[key] || 0) + amount;
    return acc;
  }, {});

  let categoriesOnTrack = 0;
  const totalBudgetedCategories = budgets.length;
  const categoryAnalysis = {};

  let weightedScoreSum = 0;
  let totalWeight = 0;

  for (const budget of budgets) {
    const key = normalizeCategory(budget.category);
    const totalSpent = Number(expenseByCategory[key] || 0);
    const avgMonthlySpend = totalSpent / Math.max(1, months);
    const budgetLimit = Math.max(1, Number(budget.limit || 0));
    const utilization = avgMonthlySpend / budgetLimit;

    if (utilization <= 1) {
      categoriesOnTrack += 1;
    }

    const categoryScore = clamp(round(getBudgetUtilizationScore(utilization)), 0, 100);
    weightedScoreSum += categoryScore * budgetLimit;
    totalWeight += budgetLimit;

    categoryAnalysis[budget.category] = {
      spent: round(avgMonthlySpend),
      budget: round(budgetLimit),
      adherencePercent: round(utilization * 100),
      status: utilization <= 1 ? "on_track" : "exceeded",
    };
  }

  const adherenceRate = (categoriesOnTrack / totalBudgetedCategories) * 100;
  const qualityScore = totalWeight > 0 ? weightedScoreSum / totalWeight : 55;
  const score = clamp(round(qualityScore * 0.7 + adherenceRate * 0.3), 0, 100);

  return {
    score,
    adherence: round(adherenceRate),
    category: getCategoryByScore(score),
    weight,
    weightedScore: round((score * weight) / 100),
    details: {
      totalBudgets: totalBudgetedCategories,
      categoriesOnTrack,
      adherenceRate: `${round(adherenceRate)}%`,
      categoryBreakdown: categoryAnalysis,
    },
  };
}

async function calculateGoalProgress(userId) {
  const weight = SCORE_WEIGHTS.goalProgress;
  const goals = await Goal.find({ user: userId });

  if (goals.length === 0) {
    return {
      score: 55,
      progress: 0,
      category: "No Goals",
      weight,
      weightedScore: round((55 * weight) / 100),
      details: {
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        goalsOnTrack: 0,
        avgProgress: "0%",
        completionRate: "0%",
      },
    };
  }

  const completedGoals = goals.filter((goal) => goal.status === "completed");
  const activeGoals = goals.filter((goal) => goal.status !== "completed" && goal.status !== "cancelled");

  const now = new Date();
  let progressSum = 0;
  let paceScoreSum = 0;
  let goalsOnTrack = 0;

  for (const goal of activeGoals) {
    const targetAmount = Math.max(1, Number(goal.targetAmount || 0));
    const currentAmount = Number(goal.currentAmount || 0);
    const progress = clamp(currentAmount / targetAmount, 0, 1.5);

    const createdAt = new Date(goal.createdAt || now);
    const targetDate = new Date(goal.targetDate || now);

    const totalDays = Math.max(1, Math.round((targetDate.getTime() - createdAt.getTime()) / DAY_MS));
    const elapsedDays = clamp(Math.round((now.getTime() - createdAt.getTime()) / DAY_MS), 0, totalDays);

    const expectedProgress = clamp(elapsedDays / totalDays, 0.05, 1);
    const paceRatio = progress >= 1 ? 1.5 : progress / expectedProgress;

    const paceScore = clamp(
      round(
        interpolateScore(paceRatio, [
          { x: 0.3, y: 10 },
          { x: 0.6, y: 45 },
          { x: 0.8, y: 65 },
          { x: 1.0, y: 80 },
          { x: 1.2, y: 92 },
          { x: 1.5, y: 100 },
        ])
      ),
      0,
      100
    );

    progressSum += clamp(progress, 0, 1) * 100;
    paceScoreSum += paceScore;

    if (progress >= Math.min(1, expectedProgress * 0.9)) {
      goalsOnTrack += 1;
    }
  }

  const avgProgress = activeGoals.length > 0 ? progressSum / activeGoals.length : 0;
  const avgPaceScore = activeGoals.length > 0 ? paceScoreSum / activeGoals.length : 70;
  const completionRate = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;

  const score = clamp(
    round(activeGoals.length > 0 ? avgPaceScore * 0.65 + completionRate * 0.35 : completionRate),
    0,
    100
  );

  return {
    score,
    progress: round(avgProgress),
    category: getCategoryByScore(score),
    weight,
    weightedScore: round((score * weight) / 100),
    details: {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      goalsOnTrack,
      avgProgress: `${round(avgProgress)}%`,
      completionRate: `${round(completionRate)}%`,
    },
  };
}

function calculateDataQuality(monthsAnalyzed, transactionsAnalyzed) {
  const safeMonths = Math.max(1, Number(monthsAnalyzed || 1));
  const txCount = Math.max(0, Number(transactionsAnalyzed || 0));

  const historyCoverage = clamp(safeMonths / 3, 0.45, 1);
  const txPerMonth = txCount / safeMonths;
  const volumeCoverage = clamp(txPerMonth / 20, 0.35, 1);

  const confidence = round((historyCoverage * 0.55 + volumeCoverage * 0.45) * 100);

  let reliability = "Low";
  if (confidence >= 80) {
    reliability = "High";
  } else if (confidence >= 60) {
    reliability = "Medium";
  }

  return {
    confidence,
    reliability,
  };
}

function generateOverallStatus(score) {
  if (score >= 80) {
    return {
      category: "Excellent",
      status: "Your financial health is outstanding!",
      color: "green",
    };
  }

  if (score >= 60) {
    return {
      category: "Good",
      status: "Your financial health is stable with room for optimization.",
      color: "blue",
    };
  }

  if (score >= 40) {
    return {
      category: "Fair",
      status: "Your finances need focused improvements in key areas.",
      color: "yellow",
    };
  }

  return {
    category: "Poor",
    status: "Your financial health requires immediate corrective actions.",
    color: "red",
  };
}

function generateHealthRecommendations(components, overallScore) {
  const recommendations = [];

  if (components.savingsRatio.score < 65) {
    recommendations.push({
      priority: "high",
      category: "Savings",
      title: "Increase monthly savings buffer",
      description: `Savings rate is ${components.savingsRatio.ratio}%. Target at least 20% to improve resilience.`,
      actionItems: [
        "Automate savings transfer on salary day",
        "Cut discretionary spend by 8-12% for the next 30 days",
        "Move windfall income directly to savings",
      ],
    });
  }

  if (components.expenseToIncomeRatio.ratio > 75) {
    recommendations.push({
      priority: "high",
      category: "Expenses",
      title: "Lower expense pressure",
      description: `Expenses consume ${components.expenseToIncomeRatio.ratio}% of income. Keep this below 70%.`,
      actionItems: [
        "Review top 3 expense categories and set weekly caps",
        "Pause non-essential subscriptions for one cycle",
        "Shift variable purchases to a fixed weekly allowance",
      ],
    });
  }

  if (components.debtRatio.details.numberOfDebts > 0 && components.debtRatio.ratio > 35) {
    recommendations.push({
      priority: "high",
      category: "Debt",
      title: "Reduce debt service burden",
      description: `Debt service is ${components.debtRatio.ratio}% of monthly income. Bring it below 35%.`,
      actionItems: [
        "Prioritize high-interest debt payoff",
        "Refinance or consolidate expensive liabilities",
        "Direct at least 10% of surplus to debt prepayment",
      ],
    });
  }

  if (components.budgetAdherence.score < 70) {
    recommendations.push({
      priority: "medium",
      category: "Budget",
      title: "Tighten budget execution",
      description: `Budget adherence is ${components.budgetAdherence.adherence}%. Improve category-level control.`,
      actionItems: [
        "Set alerts at 70% and 90% category utilization",
        "Adjust unrealistic limits based on recent averages",
        "Review overspent categories every weekend",
      ],
    });
  }

  if (components.goalProgress.score < 70) {
    recommendations.push({
      priority: "medium",
      category: "Goals",
      title: "Improve goal pacing",
      description: `Goal progress is ${components.goalProgress.progress}% and needs stronger monthly momentum.`,
      actionItems: [
        "Convert goals into weekly contribution targets",
        "Auto-contribute to top priority goal",
        "Rebalance goal dates if targets are unrealistic",
      ],
    });
  }

  if (recommendations.length === 0 || overallScore >= 80) {
    recommendations.push({
      priority: "low",
      category: "Momentum",
      title: "Maintain high-quality financial habits",
      description: "Your core financial ratios are healthy. Focus on consistency and long-term growth.",
      actionItems: [
        "Increase investment allocation for surplus cash",
        "Keep monthly review cadence to sustain performance",
      ],
    });
  }

  return recommendations;
}

export const calculateFinancialHealthScore = async (userId, months = 1, options = {}) => {
  try {
    const requestedMonths = Number(months);
    const actualMonths = clamp(Number.isFinite(requestedMonths) ? Math.round(requestedMonths) : 1, 1, 24);
    const referenceDate = options?.referenceDate ? new Date(options.referenceDate) : new Date();

    const transactions = await getTransactionsForPeriod(userId, actualMonths, referenceDate);

    if (!transactions || transactions.length === 0) {
      return {
        success: false,
        message: "No transaction data available. Add income and expense transactions to unlock your financial health score.",
        score: 0,
      };
    }

    const incomeTotal = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const expenseTotal = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const monthlyIncome = incomeTotal / actualMonths;
    const monthlyExpenses = expenseTotal / actualMonths;

    if (monthlyIncome <= 0) {
      return {
        success: false,
        message: "No income data found for the selected period. Add income transactions to calculate health score.",
        score: 0,
      };
    }

    const savingsRatio = calculateSavingsRatio(monthlyIncome, monthlyExpenses);
    const expenseRatio = calculateExpenseToIncomeRatio(monthlyIncome, monthlyExpenses);

    const [debtRatio, budgetAdherence, goalProgress] = await Promise.all([
      calculateDebtRatio(userId, monthlyIncome),
      calculateBudgetAdherence(userId, actualMonths, referenceDate),
      calculateGoalProgress(userId),
    ]);

    const components = {
      savingsRatio,
      expenseToIncomeRatio: expenseRatio,
      debtRatio,
      budgetAdherence,
      goalProgress,
    };

    const rawScore = round(
      savingsRatio.weightedScore +
        expenseRatio.weightedScore +
        debtRatio.weightedScore +
        budgetAdherence.weightedScore +
        goalProgress.weightedScore
    );

    const quality = calculateDataQuality(actualMonths, transactions.length);
    const confidenceFactor = quality.confidence / 100;

    const confidenceAdjustedScore = round(rawScore * confidenceFactor + 50 * (1 - confidenceFactor));
    const score = clamp(Math.round(confidenceAdjustedScore), 0, 100);

    const overall = generateOverallStatus(score);
    const recommendations = generateHealthRecommendations(components, score);

    return {
      success: true,
      score,
      category: overall.category,
      status: overall.status,
      color: overall.color,
      timestamp: new Date(),
      dataQuality: {
        monthsAnalyzed: actualMonths,
        transactionsAnalyzed: transactions.length,
        reliability: quality.reliability,
        confidence: quality.confidence,
      },
      components,
      summary: {
        monthlyIncome: Math.round(monthlyIncome),
        monthlyExpenses: Math.round(monthlyExpenses),
        monthlySavings: Math.round(monthlyIncome - monthlyExpenses),
        savingsRate: `${savingsRatio.ratio}%`,
      },
      recommendations,
    };
  } catch (error) {
    throw new Error(`Financial health calculation failed: ${error.message}`);
  }
};

export const getFinancialHealthHistory = async (userId, months = 6) => {
  const historyMonths = clamp(Math.round(Number(months) || 6), 1, 24);
  const history = [];

  for (let i = historyMonths - 1; i >= 0; i -= 1) {
    const referenceDate = new Date();
    referenceDate.setMonth(referenceDate.getMonth() - i);

    const scoreData = await calculateFinancialHealthScore(userId, 1, { referenceDate });

    history.push({
      month: referenceDate.toLocaleString("default", { month: "short", year: "numeric" }),
      score: scoreData?.success ? scoreData.score : 0,
      category: scoreData?.success ? scoreData.category : "No Data",
    });
  }

  return history;
};
