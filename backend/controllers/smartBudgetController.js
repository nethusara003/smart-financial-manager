/**
 * Smart Budget Generation Controller
 * Analyzes user's spending history to suggest realistic budget amounts
 */

import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

/**
 * Analyze spending for a category and suggest budget
 * POST /api/budgets/smart-generate
 * Body: { category: string, lookbackMonths?: number }
 */
export const generateSmartBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, lookbackMonths = 1 } = req.body;

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - lookbackMonths);

    // Fetch transactions for this category
    const transactions = await Transaction.find({
      user: userId,
      type: 'expense',
      category: category,
      date: { $gte: startDate, $lte: endDate }
    });

    if (transactions.length === 0) {
      return res.json({
        success: true,
        hasSufficientData: false,
        message: `No expense history found for ${category}. Consider tracking expenses in this category first.`,
        suggestedLimit: 0,
        transactionCount: 0
      });
    }

    // Calculate monthly spending statistics
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageMonthlySpending = totalSpent / lookbackMonths;
    
    // Get min and max monthly spending
    const monthlyTotals = {};
    transactions.forEach(t => {
      const monthKey = `${t.date.getFullYear()}-${t.date.getMonth()}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + t.amount;
    });
    
    const monthlyAmounts = Object.values(monthlyTotals);
    const minMonthly = monthlyAmounts.length > 0 ? Math.min(...monthlyAmounts) : 0;
    const maxMonthly = monthlyAmounts.length > 0 ? Math.max(...monthlyAmounts) : 0;
    
    // Calculate standard deviation for volatility
    const mean = averageMonthlySpending;
    const squaredDiffs = monthlyAmounts.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / monthlyAmounts.length;
    const stdDev = Math.sqrt(variance);
    
    // Suggest budget with safety buffer
    // Conservative: average + 1 standard deviation (covers ~84% of scenarios)
    // Or 10% above max if very volatile
    let suggestedLimit = Math.round(averageMonthlySpending + stdDev);
    
    // If very volatile, use max + 10% buffer
    if (stdDev > averageMonthlySpending * 0.5) {
      suggestedLimit = Math.round(maxMonthly * 1.1);
    }
    
    // Ensure minimum of $10
    suggestedLimit = Math.max(10, suggestedLimit);

    // Calculate growth trend
    const recentMonths = monthlyAmounts.slice(-2);
    const olderMonths = monthlyAmounts.slice(0, -2);
    const recentAvg = recentMonths.length > 0 ? recentMonths.reduce((a, b) => a + b, 0) / recentMonths.length : 0;
    const olderAvg = olderMonths.length > 0 ? olderMonths.reduce((a, b) => a + b, 0) / olderMonths.length : recentAvg;
    const trend = recentAvg >= olderAvg * 1.1 ? 'increasing' : recentAvg <= olderAvg * 0.9 ? 'decreasing' : 'stable';

    res.json({
      success: true,
      hasSufficientData: true,
      category,
      analysis: {
        lookbackMonths,
        transactionCount: transactions.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        averageMonthlySpending: Math.round(averageMonthlySpending * 100) / 100,
        minMonthly: Math.round(minMonthly * 100) / 100,
        maxMonthly: Math.round(maxMonthly * 100) / 100,
        volatility: stdDev > averageMonthlySpending * 0.3 ? 'high' : stdDev > averageMonthlySpending * 0.15 ? 'medium' : 'low',
        trend
      },
      suggestedLimit: Math.round(suggestedLimit * 100) / 100,
      recommendations: generateRecommendations(category, averageMonthlySpending, suggestedLimit, trend, transactions.length)
    });
  } catch (error) {
    console.error('Error generating smart budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate smart budget',
      error: error.message
    });
  }
};

/**
 * Generate contextual recommendations
 */
function generateRecommendations(category, avgSpending, suggestedLimit, trend, transactionCount) {
  const recommendations = [];
  
  // Data quality recommendation
  if (transactionCount < 10) {
    recommendations.push({
      type: 'data_quality',
      message: `Limited data (${transactionCount} transactions). Track more expenses for better accuracy.`,
      icon: 'AlertTriangle'
    });
  }
  
  // Trend-based recommendations
  if (trend === 'increasing') {
    recommendations.push({
      type: 'trend',
      message: `${category} spending is trending upward. Consider reviewing recent purchases.`,
      icon: 'TrendingUp'
    });
  } else if (trend === 'decreasing') {
    recommendations.push({
      type: 'trend',
      message: `Great job! ${category} spending is decreasing. Keep up the good work.`,
      icon: 'ThumbsUp'
    });
  }
  
  // Budget suggestion explanation
  const buffer = suggestedLimit - avgSpending;
  const bufferPercent = Math.round((buffer / avgSpending) * 100);
  
  recommendations.push({
    type: 'explanation',
    message: `Suggested budget includes ${bufferPercent}% buffer above average spending for unexpected expenses.`,
    icon: 'Info'
  });
  
  // Category-specific tips
  const categoryTips = {
    'Groceries': 'Meal planning and bulk buying can reduce grocery costs by 20-30%.',
    'Dining Out': 'Cooking at home 1-2 more times per week can significantly reduce dining expenses.',
    'Transportation': 'Consider carpooling or public transit to reduce transportation costs.',
    'Entertainment': 'Look for free local events and activities to reduce entertainment spending.',
    'Shopping': 'Implement a 24-hour rule before non-essential purchases.',
    'Utilities': 'Energy-efficient practices can reduce utility bills by 10-15%.',
    'Healthcare': 'Regular preventive care can help avoid costly emergency visits.'
  };
  
  if (categoryTips[category]) {
    recommendations.push({
      type: 'tip',
      message: categoryTips[category],
      icon: 'Lightbulb'
    });
  }
  
  return recommendations;
}

/**
 * Analyze all categories and suggest comprehensive budget plan
 * GET /api/budgets/smart-analyze
 */
export const analyzeAllCategories = async (req, res) => {
  try {
    const userId = req.user._id;
    const lookbackMonths = parseInt(req.query.lookbackMonths) || 1;

    // Get all existing budgets
    const existingBudgets = await Budget.find({ userId, active: true });
    const budgetedCategories = new Set(existingBudgets.map(b => b.category));

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - lookbackMonths);

    // Get all expense transactions
    const transactions = await Transaction.find({
      user: userId,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate }
    });

    // Group by category
    const categorySpending = {};
    transactions.forEach(t => {
      if (!categorySpending[t.category]) {
        categorySpending[t.category] = [];
      }
      categorySpending[t.category].push(t);
    });

    // Analyze each category
    const suggestions = [];
    for (const [category, catTransactions] of Object.entries(categorySpending)) {
      const totalSpent = catTransactions.reduce((sum, t) => sum + t.amount, 0);
      const avgMonthly = totalSpent / lookbackMonths;
      const suggestedLimit = Math.round(avgMonthly * 1.2); // 20% buffer

      suggestions.push({
        category,
        currentBudget: existingBudgets.find(b => b.category === category)?.limit || null,
        hasBudget: budgetedCategories.has(category),
        transactionCount: catTransactions.length,
        averageMonthlySpending: Math.round(avgMonthly * 100) / 100,
        suggestedLimit: Math.max(10, suggestedLimit),
        priority: avgMonthly > 200 ? 'high' : avgMonthly > 50 ? 'medium' : 'low'
      });
    }

    // Sort by priority and spending amount
    suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.averageMonthlySpending - a.averageMonthlySpending;
    });

    res.json({
      success: true,
      lookbackMonths,
      totalCategories: suggestions.length,
      budgetedCategories: budgetedCategories.size,
      unbudgetedCategories: suggestions.filter(s => !s.hasBudget).length,
      suggestions,
      summary: {
        totalMonthlySpending: Math.round(suggestions.reduce((sum, s) => sum + s.averageMonthlySpending, 0) * 100) / 100,
        totalSuggestedBudget: Math.round(suggestions.reduce((sum, s) => sum + s.suggestedLimit, 0) * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error analyzing categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze categories',
      error: error.message
    });
  }
};

/**
 * Generate comprehensive monthly budgets based on user's income and expense history
 * POST /api/budgets/generate-from-income
 * Body: { monthlyIncome: number, maxLookbackMonths?: number }
 */
export const generateBudgetsFromIncome = async (req, res) => {
  try {
    const userId = req.user._id;
    const { monthlyIncome, maxLookbackMonths = 3 } = req.body;

    if (!monthlyIncome || monthlyIncome <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid monthly income is required' 
      });
    }

    // Get all expense transactions (use whatever data is available)
    const allExpenses = await Transaction.find({
      user: userId,
      type: 'expense'
    }).sort({ date: -1 });

    // Determine actual lookback period based on available data
    let actualLookbackMonths = 0;
    if (allExpenses.length > 0) {
      const timestamps = allExpenses.map(t => new Date(t.date).getTime());
      const oldestDate = new Date(Math.min(...timestamps));
      const newestDate = new Date(Math.max(...timestamps));
      const monthsDiff = (newestDate.getFullYear() - oldestDate.getFullYear()) * 12 + 
                        (newestDate.getMonth() - oldestDate.getMonth()) + 1;
      actualLookbackMonths = Math.min(monthsDiff, maxLookbackMonths);
    }

    // Calculate date range for analysis (use all data if less than maxLookbackMonths)
    const endDate = new Date();
    const startDate = new Date();
    if (actualLookbackMonths > 0) {
      startDate.setMonth(startDate.getMonth() - actualLookbackMonths);
    } else {
      // If no expense data, set to 30 days ago
      startDate.setDate(startDate.getDate() - 30);
      actualLookbackMonths = 1;
    }

    // Filter transactions within date range
    const transactions = allExpenses.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });

    // Group expenses by category
    const categorySpending = {};
    transactions.forEach(t => {
      if (!categorySpending[t.category]) {
        categorySpending[t.category] = {
          transactions: [],
          total: 0
        };
      }
      categorySpending[t.category].transactions.push(t);
      categorySpending[t.category].total += t.amount;
    });

    // Category allocation guidelines based on 50/30/20 rule
    const categoryGuides = {
      'Food': { percentage: 12, type: 'essential', priority: 1 },
      'Groceries': { percentage: 10, type: 'essential', priority: 1 },
      'Rent': { percentage: 30, type: 'essential', priority: 1 },
      'Utilities': { percentage: 8, type: 'essential', priority: 1 },
      'Transportation': { percentage: 10, type: 'essential', priority: 1 },
      'Healthcare': { percentage: 8, type: 'essential', priority: 1 },
      'Insurance': { percentage: 7, type: 'essential', priority: 1 },
      'Bills': { percentage: 8, type: 'essential', priority: 1 },
      'Education': { percentage: 8, type: 'essential', priority: 1 },
      'Entertainment': { percentage: 8, type: 'discretionary', priority: 2 },
      'Shopping': { percentage: 8, type: 'discretionary', priority: 2 },
      'Dining': { percentage: 8, type: 'discretionary', priority: 2 },
      'Travel': { percentage: 6, type: 'discretionary', priority: 2 },
      'Personal': { percentage: 5, type: 'discretionary', priority: 2 },
      'Other': { percentage: 5, type: 'discretionary', priority: 3 }
    };

    // Generate budget recommendations
    const budgetRecommendations = [];
    let totalAllocated = 0;

    // Process categories with spending history
    Object.entries(categorySpending).forEach(([category, data]) => {
      const avgMonthlySpending = data.total / actualLookbackMonths;
      const guide = categoryGuides[category] || { percentage: 5, type: 'discretionary', priority: 3 };
      
      // Calculate recommended budget
      // Use higher of: historical average * 1.15 (15% buffer) OR income-based percentage
      const historyBased = avgMonthlySpending * 1.15;
      const incomeBased = (monthlyIncome * guide.percentage) / 100;
      const recommended = Math.max(historyBased, incomeBased);

      budgetRecommendations.push({
        category,
        hasSpendingHistory: true,
        transactionCount: data.transactions.length,
        historicalAverage: Math.round(avgMonthlySpending * 100) / 100,
        recommendedAmount: Math.round(recommended),
        type: guide.type,
        priority: guide.priority,
        percentageOfIncome: ((recommended / monthlyIncome) * 100).toFixed(1),
        reasoning: `Based on ${data.transactions.length} transactions (avg ${Math.round(avgMonthlySpending)}/month) with 15% safety buffer`
      });

      totalAllocated += recommended;
    });

    // Add recommendations for categories without spending history (income-based only)
    const categoriesWithHistory = new Set(Object.keys(categorySpending));
    const suggestedCategories = ['Food', 'Groceries', 'Utilities', 'Transportation', 'Entertainment', 'Shopping'];
    
    suggestedCategories.forEach(category => {
      if (!categoriesWithHistory.has(category)) {
        const guide = categoryGuides[category];
        const recommended = (monthlyIncome * guide.percentage) / 100;

        budgetRecommendations.push({
          category,
          hasSpendingHistory: false,
          transactionCount: 0,
          historicalAverage: 0,
          recommendedAmount: Math.round(recommended),
          type: guide.type,
          priority: guide.priority,
          percentageOfIncome: ((recommended / monthlyIncome) * 100).toFixed(1),
          reasoning: `Suggested allocation based on ${guide.percentage}% of income (${guide.type} expense)`
        });

        totalAllocated += recommended;
      }
    });

    // Calculate savings allocation
    const recommendedSavings = Math.round(monthlyIncome * 0.2); // 20% for savings
    const remainingIncome = monthlyIncome - totalAllocated;
    const adjustedSavings = Math.max(recommendedSavings, remainingIncome);

    // Sort recommendations by priority and spending amount
    budgetRecommendations.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.recommendedAmount - a.recommendedAmount;
    });

    // Calculate summary statistics
    const essentialTotal = budgetRecommendations
      .filter(b => b.type === 'essential')
      .reduce((sum, b) => sum + b.recommendedAmount, 0);
    
    const discretionaryTotal = budgetRecommendations
      .filter(b => b.type === 'discretionary')
      .reduce((sum, b) => sum + b.recommendedAmount, 0);

    res.json({
      success: true,
      monthlyIncome,
      dataAvailability: {
        hasExpenseData: transactions.length > 0,
        transactionCount: transactions.length,
        lookbackMonths: actualLookbackMonths,
        oldestTransaction: transactions.length > 0 ? transactions[transactions.length - 1].date : null,
        newestTransaction: transactions.length > 0 ? transactions[0].date : null
      },
      summary: {
        totalRecommendedBudgets: Math.round(totalAllocated),
        recommendedSavings: adjustedSavings,
        essentialExpenses: Math.round(essentialTotal),
        discretionaryExpenses: Math.round(discretionaryTotal),
        savingsRate: ((adjustedSavings / monthlyIncome) * 100).toFixed(1) + '%',
        allocation: {
          essentials: ((essentialTotal / monthlyIncome) * 100).toFixed(1) + '%',
          discretionary: ((discretionaryTotal / monthlyIncome) * 100).toFixed(1) + '%',
          savings: ((adjustedSavings / monthlyIncome) * 100).toFixed(1) + '%'
        }
      },
      recommendations: budgetRecommendations,
      insights: [
        transactions.length === 0 
          ? 'No expense history found. Recommendations are based on standard income allocation guidelines.'
          : `Analysis based on ${transactions.length} transactions over ${actualLookbackMonths} month${actualLookbackMonths !== 1 ? 's' : ''}.`,
        essentialTotal > monthlyIncome * 0.5 
          ? '⚠️ Essential expenses exceed 50% of income. Consider reducing non-essential costs.'
          : '✓ Essential expenses are within healthy range.',
        adjustedSavings >= monthlyIncome * 0.2 
          ? '✓ Achieving recommended 20% savings rate.'
          : '⚠️ Try to increase savings to at least 20% of income.',
        transactions.length < 30 
          ? '💡 Add more expense transactions for more accurate recommendations.'
          : '✓ Good expense tracking! Recommendations are based on solid data.'
      ]
    });

  } catch (error) {
    console.error('Error generating budgets from income:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate budgets',
      error: error.message
    });
  }
};
