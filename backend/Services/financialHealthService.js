import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";
import Bill from "../models/Bill.js";

/* =========================
   FINANCIAL HEALTH SCORING SYSTEM
   - Savings ratio (30% weight)
   - Expense-to-income ratio (30% weight)
   - Debt ratio (20% weight)
   - Budget adherence (10% weight)
   - Goal progress (10% weight)
========================= */

/**
 * Get transactions for a specific period
 */
const getTransactionsForPeriod = async (userId, months = 3) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return await Transaction.find({
    user: userId,
    date: { $gte: startDate },
  });
};

/**
 * Calculate Savings Ratio (30% weight)
 * Formula: (Total Savings / Total Income) × 100
 */
const calculateSavingsRatio = (income, expenses) => {
  if (income === 0) {
    return { score: 0, ratio: 0, category: "No Data", weight: 30 };
  }

  const savings = income - expenses;
  const ratio = (savings / income) * 100;

  let score = 0;
  let category = "";

  if (ratio > 30) {
    score = 100;
    category = "Excellent";
  } else if (ratio >= 20) {
    score = 85;
    category = "Good";
  } else if (ratio >= 10) {
    score = 60;
    category = "Fair";
  } else if (ratio >= 0) {
    score = 30;
    category = "Poor";
  } else {
    score = 0;
    category = "Critical";
  }

  return {
    score,
    ratio: ratio.toFixed(2),
    category,
    weight: 30,
    weightedScore: (score * 30) / 100,
    details: {
      monthlySavings: savings,
      savingsPercentage: ratio.toFixed(2) + "%",
      trend: ratio >= 20 ? "improving" : ratio >= 10 ? "stable" : "declining",
    },
  };
};

/**
 * Calculate Expense-to-Income Ratio (30% weight)
 * Formula: (Total Expenses / Total Income) × 100
 */
const calculateExpenseToIncomeRatio = (income, expenses) => {
  if (income === 0) {
    return { score: 0, ratio: 0, category: "No Data", weight: 30 };
  }

  const ratio = (expenses / income) * 100;

  let score = 0;
  let category = "";

  if (ratio < 50) {
    score = 100;
    category = "Excellent";
  } else if (ratio < 70) {
    score = 80;
    category = "Good";
  } else if (ratio < 90) {
    score = 50;
    category = "Fair";
  } else if (ratio < 100) {
    score = 25;
    category = "Poor";
  } else {
    score = 0;
    category = "Critical";
  }

  return {
    score,
    ratio: ratio.toFixed(2),
    category,
    weight: 30,
    weightedScore: (score * 30) / 100,
    details: {
      monthlyExpenses: expenses,
      expensePercentage: ratio.toFixed(2) + "%",
      efficiency: ratio < 70 ? "high" : ratio < 90 ? "moderate" : "low",
    },
  };
};

/**
 * Calculate Debt Ratio (20% weight)
 * Formula: (Total Monthly Debt Payments / Monthly Income) × 100
 */
const calculateDebtRatio = async (userId, monthlyIncome) => {
  if (monthlyIncome === 0) {
    return { score: 0, ratio: 0, category: "No Data", weight: 20 };
  }

  // Get recurring bills that represent debt payments
  const debtCategories = ["loan", "credit_card", "mortgage", "emi"];
  const debtBills = await Bill.find({
    userId,
    category: { $in: debtCategories },
    recurring: true,
  });

  const monthlyDebtPayments = debtBills.reduce((sum, bill) => {
    if (bill.frequency === "monthly") {
      return sum + bill.amount;
    } else if (bill.frequency === "yearly") {
      return sum + bill.amount / 12;
    }
    return sum;
  }, 0);

  const ratio = (monthlyDebtPayments / monthlyIncome) * 100;

  let score = 0;
  let category = "";

  if (ratio < 20) {
    score = 100;
    category = "Excellent";
  } else if (ratio < 35) {
    score = 75;
    category = "Good";
  } else if (ratio < 50) {
    score = 45;
    category = "Fair";
  } else {
    score = 15;
    category = "Poor";
  }

  return {
    score,
    ratio: ratio.toFixed(2),
    category,
    weight: 20,
    weightedScore: (score * 20) / 100,
    details: {
      monthlyDebtPayments,
      debtPercentage: ratio.toFixed(2) + "%",
      numberOfDebts: debtBills.length,
      status: ratio < 35 ? "manageable" : "concerning",
    },
  };
};

/**
 * Calculate Budget Adherence (10% weight)
 */
const calculateBudgetAdherence = async (userId, months = 3) => {
  const budgets = await Budget.find({ userId, active: true });

  if (budgets.length === 0) {
    return { score: 50, adherence: 0, category: "No Budgets", weight: 10 };
  }

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const expenses = await Transaction.find({
    user: userId,
    type: "expense",
    date: { $gte: startDate },
  });

  let totalBudgetedCategories = 0;
  let categoriesOnTrack = 0;
  const categoryAnalysis = {};

  for (const budget of budgets) {
    const categoryExpenses = expenses
      .filter((e) => e.category === budget.category)
      .reduce((sum, e) => sum + e.amount, 0);

    const avgMonthlySpend = categoryExpenses / months;
    const adherencePercent = (avgMonthlySpend / budget.limit) * 100;

    categoryAnalysis[budget.category] = {
      spent: avgMonthlySpend,
      budget: budget.limit,
      adherencePercent: adherencePercent.toFixed(2),
      status: adherencePercent <= 100 ? "on_track" : "exceeded",
    };

    totalBudgetedCategories++;
    if (adherencePercent <= 100) {
      categoriesOnTrack++;
    }
  }

  const adherenceRate = (categoriesOnTrack / totalBudgetedCategories) * 100;

  let score = 0;
  let category = "";

  if (adherenceRate >= 90) {
    score = 100;
    category = "Excellent";
  } else if (adherenceRate >= 75) {
    score = 80;
    category = "Good";
  } else if (adherenceRate >= 50) {
    score = 60;
    category = "Fair";
  } else {
    score = 30;
    category = "Poor";
  }

  return {
    score,
    adherence: adherenceRate.toFixed(2),
    category,
    weight: 10,
    weightedScore: (score * 10) / 100,
    details: {
      totalBudgets: totalBudgetedCategories,
      categoriesOnTrack,
      adherenceRate: adherenceRate.toFixed(2) + "%",
      categoryBreakdown: categoryAnalysis,
    },
  };
};

/**
 * Calculate Goal Progress (10% weight)
 */
const calculateGoalProgress = async (userId) => {
  const goals = await Goal.find({ user: userId });

  if (goals.length === 0) {
    return { score: 50, progress: 0, category: "No Goals", weight: 10 };
  }

  const activeGoals = goals.filter((g) => g.status !== "completed");
  const completedGoals = goals.filter((g) => g.status === "completed");

  let totalProgress = 0;
  let goalsOnTrack = 0;
  const currentDate = new Date();

  activeGoals.forEach((goal) => {
    const progress = goal.currentAmount / goal.targetAmount;
    totalProgress += progress;

    // Check if on track
    const targetDate = new Date(goal.targetDate);
    const totalDays = Number(targetDate.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = Number(currentDate.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const expectedProgress = elapsedDays / totalDays;

    if (progress >= expectedProgress) {
      goalsOnTrack++;
    }
  });

  const avgProgress = activeGoals.length > 0 ? (totalProgress / activeGoals.length) * 100 : 0;
  const completionRate = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;

  let score = 0;
  let category = "";

  if (completionRate >= 50 || avgProgress >= 75) {
    score = 100;
    category = "Excellent";
  } else if (completionRate >= 25 || avgProgress >= 50) {
    score = 75;
    category = "Good";
  } else if (avgProgress >= 25) {
    score = 50;
    category = "Fair";
  } else {
    score = 30;
    category = "Needs Improvement";
  }

  return {
    score,
    progress: avgProgress.toFixed(2),
    category,
    weight: 10,
    weightedScore: (score * 10) / 100,
    details: {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      goalsOnTrack,
      avgProgress: avgProgress.toFixed(2) + "%",
      completionRate: completionRate.toFixed(2) + "%",
    },
  };
};

/**
 * Generate Overall Financial Score (0-100)
 */
export const calculateFinancialHealthScore = async (userId, months = 1) => {
  try {
    console.log(`[Financial Health] Calculating score for user: ${userId}, months: ${months}`);
    
    // Get financial data from specified period (minimum 1 month)
    const transactions = await getTransactionsForPeriod(userId, Math.max(1, months));
    console.log(`[Financial Health] Found ${transactions.length} transactions`);

    if (transactions.length === 0) {
      return {
        success: false,
        message: "No transaction data available. Start tracking your income and expenses to see your financial health score.",
        score: 0,
      };
    }

    // Use actual months to avoid division by zero
    const actualMonths = Math.max(1, months);

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0) / actualMonths;

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0) / actualMonths;

    console.log(`[Financial Health] Income: ${income}, Expenses: ${expenses}`);

    // If no income data, return a message
    if (income === 0) {
      return {
        success: false,
        message: "No income data found. Add income transactions to calculate your financial health.",
        score: 0,
      };
    }

    // Calculate all components
    let savingsRatio, expenseRatio, debtRatio, budgetAdherence, goalProgress;
    
    try {
      console.log('[Financial Health] Calculating savings ratio...');
      savingsRatio = calculateSavingsRatio(income, expenses);
      console.log('[Financial Health] ✓ Savings ratio calculated');
    } catch (err) {
      console.error('[Financial Health] ❌ Error in savings ratio:', err);
      throw new Error(`Savings ratio calculation failed: ${err.message}`);
    }
    
    try {
      console.log('[Financial Health] Calculating expense ratio...');
      expenseRatio = calculateExpenseToIncomeRatio(income, expenses);
      console.log('[Financial Health] ✓ Expense ratio calculated');
    } catch (err) {
      console.error('[Financial Health] ❌ Error in expense ratio:', err);
      throw new Error(`Expense ratio calculation failed: ${err.message}`);
    }
    
    try {
      console.log('[Financial Health] Calculating debt ratio...');
      debtRatio = await calculateDebtRatio(userId, income);
      console.log('[Financial Health] ✓ Debt ratio calculated');
    } catch (err) {
      console.error('[Financial Health] ❌ Error in debt ratio:', err);
      throw new Error(`Debt ratio calculation failed: ${err.message}`);
    }
    
    try {
      console.log('[Financial Health] Calculating budget adherence...');
      budgetAdherence = await calculateBudgetAdherence(userId, actualMonths);
      console.log('[Financial Health] ✓ Budget adherence calculated');
    } catch (err) {
      console.error('[Financial Health] ❌ Error in budget adherence:', err);
      throw new Error(`Budget adherence calculation failed: ${err.message}`);
    }
    
    try {
      console.log('[Financial Health] Calculating goal progress...');
      goalProgress = await calculateGoalProgress(userId);
      console.log('[Financial Health] ✓ Goal progress calculated');
    } catch (err) {
      console.error('[Financial Health] ❌ Error in goal progress:', err);
      throw new Error(`Goal progress calculation failed: ${err.message}`);
    }
    
    console.log('[Financial Health] All components calculated successfully');
    
    // Validate all components are properly defined
    console.log('[Financial Health] Validating components...');
    console.log('savingsRatio:', savingsRatio);
    console.log('expenseRatio:', expenseRatio);
    console.log('debtRatio:', debtRatio);
    console.log('budgetAdherence:', budgetAdherence);
    console.log('goalProgress:', goalProgress);
    
    if (!savingsRatio || !savingsRatio.score === undefined) {
      throw new Error('Savings ratio is undefined or invalid');
    }
    if (!expenseRatio || expenseRatio.score === undefined) {
      throw new Error('Expense ratio is undefined or invalid');
    }
    if (!debtRatio || debtRatio.score === undefined) {
      throw new Error('Debt ratio is undefined or invalid');
    }
    if (!budgetAdherence || budgetAdherence.score === undefined) {
      throw new Error('Budget adherence is undefined or invalid');
    }
    if (!goalProgress || goalProgress.score === undefined) {
      throw new Error('Goal progress is undefined or invalid');
    }
    
    console.log('[Financial Health] All components validated successfully');

    // Calculate overall score
    const overallScore =
      savingsRatio.weightedScore +
      expenseRatio.weightedScore +
      debtRatio.weightedScore +
      budgetAdherence.weightedScore +
      goalProgress.weightedScore;
      
    console.log(`[Financial Health] Overall score calculated: ${overallScore}`);

    // Determine overall category
    let overallCategory = "";
    let overallStatus = "";
    let color = "";

    if (overallScore >= 80) {
      overallCategory = "Excellent";
      overallStatus = "Your financial health is outstanding!";
      color = "green";
    } else if (overallScore >= 60) {
      overallCategory = "Good";
      overallStatus = "Your financial health is good, with room for improvement.";
      color = "blue";
    } else if (overallScore >= 40) {
      overallCategory = "Fair";
      overallStatus = "Your financial health needs attention.";
      color = "yellow";
    } else {
      overallCategory = "Poor";
      overallStatus = "Your financial health requires immediate action.";
      color = "red";
    }

    // Generate recommendations
    const recommendations = generateHealthRecommendations({
      savingsRatio,
      expenseRatio,
      debtRatio,
      budgetAdherence,
      goalProgress,
    });

    return {
      success: true,
      score: Math.round(overallScore),
      category: overallCategory,
      status: overallStatus,
      color,
      timestamp: new Date(),
      dataQuality: {
        monthsAnalyzed: actualMonths,
        transactionsAnalyzed: transactions.length,
        reliability: actualMonths >= 3 ? 'High' : actualMonths >= 2 ? 'Medium' : 'Low',
      },
      components: {
        savingsRatio,
        expenseToIncomeRatio: expenseRatio,
        debtRatio,
        budgetAdherence,
        goalProgress,
      },
      summary: {
        monthlyIncome: Math.round(income),
        monthlyExpenses: Math.round(expenses),
        monthlySavings: Math.round(income - expenses),
        savingsRate: savingsRatio.ratio + "%",
      },
      recommendations,
    };
  } catch (error) {
    console.error("❌ [Financial Health] Error calculating financial health score:", error);
    console.error("❌ [Financial Health] Error stack:", error.stack);
    throw error;
  }
};

/**
 * Generate personalized recommendations based on scores
 */
const generateHealthRecommendations = (components) => {
  const recommendations = [];

  // Safety check
  if (!components) {
    console.warn('[Financial Health] Components is undefined in generateHealthRecommendations');
    return recommendations;
  }

  // Savings recommendations
  if (components.savingsRatio && components.savingsRatio.score < 60) {
    recommendations.push({
      priority: "high",
      category: "Savings",
      title: "Increase Your Savings Rate",
      description: `Your current savings rate is ${components.savingsRatio.ratio}%. Aim for at least 20% to build financial security.`,
      actionItems: [
        "Set up automatic transfers to savings account",
        "Reduce discretionary spending by 10%",
        "Look for ways to increase income",
      ],
    });
  }

  // Expense recommendations
  if (components.expenseToIncomeRatio && components.expenseToIncomeRatio.score < 60) {
    recommendations.push({
      priority: "high",
      category: "Expenses",
      title: "Control Your Spending",
      description: `You're spending ${components.expenseToIncomeRatio.ratio}% of your income. Reduce this to below 70%.`,
      actionItems: [
        "Review and cancel unused subscriptions",
        "Create and stick to a budget",
        "Find cheaper alternatives for regular expenses",
      ],
    });
  }

  // Debt recommendations
  if (components.debtRatio && components.debtRatio.score < 60 && components.debtRatio.details && components.debtRatio.details.numberOfDebts > 0) {
    recommendations.push({
      priority: "high",
      category: "Debt",
      title: "Manage Your Debt",
      description: `Your debt payments are ${components.debtRatio.ratio}% of income. Work on reducing this below 35%.`,
      actionItems: [
        "Focus on paying high-interest debt first",
        "Consider debt consolidation",
        "Avoid taking on new debt",
      ],
    });
  }

  // Budget adherence recommendations
  if (components.budgetAdherence && components.budgetAdherence.score < 60) {
    recommendations.push({
      priority: "medium",
      category: "Budget",
      title: "Improve Budget Compliance",
      description: `You're only adhering to ${components.budgetAdherence.adherence}% of your budgets.`,
      actionItems: [
        "Review budgets weekly",
        "Set up spending alerts",
        "Adjust unrealistic budgets",
      ],
    });
  }

  // Goal recommendations
  if (components.goalProgress && components.goalProgress.score < 60) {
    recommendations.push({
      priority: "medium",
      category: "Goals",
      title: "Focus on Financial Goals",
      description: `Your goal progress is at ${components.goalProgress.progress}%. Stay committed to achieve them.`,
      actionItems: [
        "Break goals into smaller milestones",
        "Automate goal contributions",
        "Review and adjust goals monthly",
      ],
    });
  }

  // Positive reinforcement
  if (components.savingsRatio && components.savingsRatio.score >= 80) {
    recommendations.push({
      priority: "low",
      category: "Savings",
      title: "Excellent Savings Habit!",
      description: "Keep up the great work with your savings rate.",
      actionItems: ["Consider investing excess savings", "Maintain this healthy habit"],
    });
  }

  return recommendations;
};

/**
 * Get historical financial health scores
 */
export const getFinancialHealthHistory = async (userId, months = 6) => {
  const history = [];

  for (let i = 0; i < months; i++) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - i);

    // Calculate score for that month
    // This is a simplified version - in production, you'd store historical scores
    const score = await calculateFinancialHealthScore(userId);
    
    history.push({
      month: monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
      score: score.score,
      category: score.category,
    });
  }

  return history.reverse();
};
