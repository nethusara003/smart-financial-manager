import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";

/* =========================
   BUDGET RECOMMENDATION ENGINE
   - Income-based allocation
   - Category distribution
   - Adaptive recommendations
========================= */

/**
 * Get total monthly income for a user
 */
const getMonthlyIncome = async (userId, months = 3) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const incomeTransactions = await Transaction.find({
    user: userId,
    type: "income",
    date: { $gte: startDate },
  });

  if (incomeTransactions.length === 0) {
    return 0;
  }

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  return totalIncome / months; // Average monthly income
};

/**
 * Get monthly expenses by category
 */
const getMonthlyExpensesByCategory = async (userId, months = 3) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const expenseTransactions = await Transaction.find({
    user: userId,
    type: "expense",
    date: { $gte: startDate },
  });

  const categoryTotals = {};
  expenseTransactions.forEach((t) => {
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = 0;
    }
    categoryTotals[t.category] += t.amount;
  });

  // Calculate monthly average
  Object.keys(categoryTotals).forEach((cat) => {
    categoryTotals[cat] = categoryTotals[cat] / months;
  });

  return categoryTotals;
};

/**
 * Classify categories as essential or discretionary
 */
const classifyCategory = (category) => {
  const essentialCategories = [
    "Food",
    "Groceries",
    "Rent",
    "Utilities",
    "Healthcare",
    "Transportation",
    "Insurance",
    "Bills",
    "Education",
  ];

  const categoryLower = category.toLowerCase();
  const isEssential = essentialCategories.some((essential) =>
    categoryLower.includes(essential.toLowerCase())
  );

  return isEssential ? "essential" : "discretionary";
};

/**
 * Apply 50/30/20 rule framework
 */
const apply50_30_20Rule = (monthlyIncome) => {
  return {
    needs: monthlyIncome * 0.5, // 50% for essentials
    wants: monthlyIncome * 0.3, // 30% for discretionary
    savings: monthlyIncome * 0.2, // 20% for savings
  };
};

/**
 * Get recommended category percentages
 */
const getCategoryRecommendations = () => {
  return {
    "Food": { min: 10, max: 15, priority: "essential" },
    "Groceries": { min: 10, max: 15, priority: "essential" },
    "Rent": { min: 25, max: 30, priority: "essential" },
    "Utilities": { min: 5, max: 10, priority: "essential" },
    "Transportation": { min: 10, max: 15, priority: "essential" },
    "Healthcare": { min: 5, max: 10, priority: "essential" },
    "Insurance": { min: 5, max: 10, priority: "essential" },
    "Entertainment": { min: 5, max: 10, priority: "discretionary" },
    "Shopping": { min: 5, max: 10, priority: "discretionary" },
    "Dining": { min: 5, max: 10, priority: "discretionary" },
    "Travel": { min: 3, max: 8, priority: "discretionary" },
    "Education": { min: 5, max: 10, priority: "essential" },
    "Bills": { min: 5, max: 10, priority: "essential" },
    "Savings": { min: 15, max: 20, priority: "savings" },
    "Other": { min: 5, max: 10, priority: "discretionary" },
  };
};

/**
 * Calculate recommended savings based on goals
 */
const calculateGoalBasedSavings = async (userId) => {
  const activeGoals = await Goal.find({
    user: userId,
    status: { $ne: "completed" },
  });

  if (activeGoals.length === 0) {
    return 0;
  }

  let totalMonthlyRequired = 0;
  const currentDate = new Date();

  activeGoals.forEach((goal) => {
    const remaining = goal.targetAmount - (goal.currentAmount || 0);
    const targetDate = new Date(goal.targetDate);
    const monthsRemaining = Math.max(
      1,
      Math.ceil(Number(targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    );
    totalMonthlyRequired += remaining / monthsRemaining;
  });

  return totalMonthlyRequired;
};

/**
 * Generate adaptive budget recommendations
 */
export const generateBudgetRecommendations = async (userId) => {
  try {
    // Get user's financial data
    const monthlyIncome = await getMonthlyIncome(userId);
    const currentExpenses = await getMonthlyExpensesByCategory(userId);
    const goalBasedSavings = await calculateGoalBasedSavings(userId);
    const existingBudgets = await Budget.find({ userId, active: true });

    // If no income data, return basic recommendations
    if (monthlyIncome === 0) {
      return {
        success: false,
        message: "Insufficient income data. Please add at least 3 months of income transactions.",
        recommendations: [],
      };
    }

    // Apply 50/30/20 rule
    const allocation = apply50_30_20Rule(monthlyIncome);

    // Adjust savings based on active goals
    const recommendedSavings = Math.max(allocation.savings, goalBasedSavings);
    const adjustedNeeds = allocation.needs;
    const adjustedWants = monthlyIncome - adjustedNeeds - recommendedSavings;

    // Get category recommendations
    const categoryGuides = getCategoryRecommendations();
    const recommendations = [];

    // Analyze current spending and generate recommendations
    const allCategories = new Set([
      ...Object.keys(currentExpenses),
      ...Object.keys(categoryGuides),
    ]);

    let essentialTotal = 0;
    let discretionaryTotal = 0;

    allCategories.forEach((category) => {
      const currentSpend = currentExpenses[category] || 0;
      const guide = categoryGuides[category] || { min: 5, max: 10, priority: "discretionary" };
      const categoryType = classifyCategory(category);

      // Calculate recommended amount
      let recommendedAmount;
      if (categoryType === "essential") {
        recommendedAmount = (monthlyIncome * guide.max) / 100;
        essentialTotal += recommendedAmount;
      } else {
        recommendedAmount = (monthlyIncome * guide.min) / 100;
        discretionaryTotal += recommendedAmount;
      }

      // Check if user already has a budget for this category
      const existingBudget = existingBudgets.find((b) => b.category === category);

      const recommendation = {
        category,
        currentSpending: Math.round(currentSpend),
        recommendedBudget: Math.round(recommendedAmount),
        percentageOfIncome: ((recommendedAmount / monthlyIncome) * 100).toFixed(1),
        categoryType,
        priority: guide.priority,
        hasExistingBudget: !!existingBudget,
        existingBudgetLimit: existingBudget ? existingBudget.limit : null,
        status: currentSpend === 0 ? "no_data" : 
                currentSpend > recommendedAmount * 1.2 ? "overspending" :
                currentSpend < recommendedAmount * 0.5 ? "underspending" : "on_track",
        suggestion: currentSpend > recommendedAmount * 1.2
          ? `Consider reducing spending by ${Math.round(currentSpend - recommendedAmount)}`
          : currentSpend === 0
          ? "No spending history for this category"
          : "Your spending is within recommended range",
      };

      recommendations.push(recommendation);
    });

    // Calculate totals and insights
    const totalCurrentSpending = Object.values(currentExpenses).reduce((a, b) => a + b, 0);
    const savingsRate = ((monthlyIncome - totalCurrentSpending) / monthlyIncome) * 100;

    return {
      success: true,
      summary: {
        monthlyIncome: Math.round(monthlyIncome),
        currentTotalSpending: Math.round(totalCurrentSpending),
        currentSavings: Math.round(monthlyIncome - totalCurrentSpending),
        currentSavingsRate: savingsRate.toFixed(1) + "%",
        recommendedAllocation: {
          needs: Math.round(adjustedNeeds),
          wants: Math.round(adjustedWants),
          savings: Math.round(recommendedSavings),
        },
        goalBasedSavingsRequired: Math.round(goalBasedSavings),
        emergencyFundRecommendation: Math.round(monthlyIncome * 6), // 6 months expenses
      },
      recommendations: recommendations.sort((a, b) => {
        // Sort by priority: essential first, then discretionary
        if (a.priority === "essential" && b.priority !== "essential") return -1;
        if (a.priority !== "essential" && b.priority === "essential") return 1;
        return b.currentSpending - a.currentSpending;
      }),
      insights: generateInsights(
        monthlyIncome,
        totalCurrentSpending,
        savingsRate,
        recommendations,
        goalBasedSavings
      ),
    };
  } catch (error) {
    console.error("Error generating budget recommendations:", error);
    throw error;
  }
};

/**
 * Generate actionable insights
 */
const generateInsights = (income, spending, savingsRate, recommendations, goalSavings) => {
  const insights = [];

  // Savings rate insight
  if (savingsRate < 10) {
    insights.push({
      type: "warning",
      category: "Savings",
      message: "Your savings rate is below 10%. Consider reducing discretionary spending.",
      priority: "high",
    });
  } else if (savingsRate >= 20) {
    insights.push({
      type: "success",
      category: "Savings",
      message: "Excellent! You're saving 20% or more of your income.",
      priority: "medium",
    });
  }

  // Overspending insights
  const overspending = recommendations.filter((r) => r.status === "overspending");
  if (overspending.length > 0) {
    const topOverspender = overspending.reduce((a, b) =>
      a.currentSpending - a.recommendedBudget > b.currentSpending - b.recommendedBudget ? a : b
    );
    insights.push({
      type: "warning",
      category: topOverspender.category,
      message: `You're overspending on ${topOverspender.category} by ${Math.round(
        topOverspender.currentSpending - topOverspender.recommendedBudget
      )}`,
      priority: "high",
    });
  }

  // Goal savings insight
  if (goalSavings > 0) {
    const monthlySavings = income - spending;
    if (monthlySavings < goalSavings) {
      insights.push({
        type: "info",
        category: "Goals",
        message: `To meet your savings goals, you need to save ${Math.round(
          goalSavings - monthlySavings
        )} more per month.`,
        priority: "high",
      });
    }
  }

  // Emergency fund insight
  const emergencyFund = income * 6;
  insights.push({
    type: "info",
    category: "Emergency Fund",
    message: `Aim to build an emergency fund of ${Math.round(emergencyFund)} (6 months of income).`,
    priority: "medium",
  });

  // Income-based insight
  const expenseRatio = (spending / income) * 100;
  if (expenseRatio > 90) {
    insights.push({
      type: "critical",
      category: "Budget",
      message: "You're spending more than 90% of your income. Immediate action needed!",
      priority: "critical",
    });
  }

  return insights;
};

/**
 * Get seasonal adjustment factors (for future enhancement)
 */
export const getSeasonalAdjustments = (month, category) => {
  const seasonalFactors = {
    "Utilities": {
      12: 1.3, 1: 1.3, 2: 1.2, // Winter - higher heating
      6: 1.2, 7: 1.2, 8: 1.2,  // Summer - higher cooling
    },
    "Travel": {
      12: 1.5, 6: 1.3, 7: 1.3, // Holiday seasons
    },
    "Shopping": {
      11: 1.4, 12: 1.5, // Holiday shopping
    },
  };

  return seasonalFactors[category]?.[month] || 1.0;
};
