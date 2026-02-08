/**
 * Chat Data Queries
 * Efficient database queries for chatbot responses
 */

import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';
import { calculatePeriodStart, calculatePeriodEnd } from './entityExtractor.js';

/**
 * Get transactions by date range and optional filters
 */
async function getTransactions(userId, options = {}) {
  try {
    const query = { user: userId };
    
    // Apply date range filter
    if (options.startDate || options.endDate) {
      query.date = {};
      if (options.startDate) query.date.$gte = new Date(options.startDate);
      if (options.endDate) query.date.$lte = new Date(options.endDate);
    }
    
    // Apply category filter
    if (options.category) {
      query.category = new RegExp(options.category, 'i');
    }
    
    // Apply type filter
    if (options.type) {
      query.type = options.type;
    }
    
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(options.limit || 100);
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Calculate total spending for a period
 */
async function getTotalSpending(userId, options = {}) {
  try {
    const query = { user: userId, type: 'expense' };
    
    if (options.startDate || options.endDate) {
      query.date = {};
      if (options.startDate) query.date.$gte = new Date(options.startDate);
      if (options.endDate) query.date.$lte = new Date(options.endDate);
    }
    
    if (options.category) {
      query.category = new RegExp(options.category, 'i');
    }
    
    const result = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      }
    ]);
    
    return result.length > 0 ? result[0] : { total: 0, count: 0, average: 0 };
  } catch (error) {
    console.error('Error calculating total spending:', error);
    throw error;
  }
}

/**
 * Calculate total income for a period
 */
async function getTotalIncome(userId, options = {}) {
  try {
    const query = { user: userId, type: 'income' };
    
    if (options.startDate || options.endDate) {
      query.date = {};
      if (options.startDate) query.date.$gte = new Date(options.startDate);
      if (options.endDate) query.date.$lte = new Date(options.endDate);
    }
    
    const result = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    return result.length > 0 ? result[0] : { total: 0, count: 0 };
  } catch (error) {
    console.error('Error calculating total income:', error);
    throw error;
  }
}

/**
 * Get spending by category
 */
async function getSpendingByCategory(userId, options = {}) {
  try {
    const query = { user: userId, type: 'expense' };
    
    if (options.startDate || options.endDate) {
      query.date = {};
      if (options.startDate) query.date.$gte = new Date(options.startDate);
      if (options.endDate) query.date.$lte = new Date(options.endDate);
    }
    
    const result = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    return result.map(r => ({
      category: r._id,
      total: r.total,
      count: r.count,
      average: r.average
    }));
  } catch (error) {
    console.error('Error getting spending by category:', error);
    throw error;
  }
}

/**
 * Get largest transaction
 */
async function getLargestTransaction(userId, options = {}) {
  try {
    const query = { user: userId };
    
    if (options.type) {
      query.type = options.type;
    }
    
    if (options.startDate || options.endDate) {
      query.date = {};
      if (options.startDate) query.date.$gte = new Date(options.startDate);
      if (options.endDate) query.date.$lte = new Date(options.endDate);
    }
    
    const transaction = await Transaction.findOne(query)
      .sort({ amount: -1 })
      .limit(1);
    
    return transaction;
  } catch (error) {
    console.error('Error getting largest transaction:', error);
    throw error;
  }
}

/**
 * Get smallest transaction
 */
async function getSmallestTransaction(userId, options = {}) {
  try {
    const query = { user: userId };
    
    if (options.type) {
      query.type = options.type;
    }
    
    if (options.startDate || options.endDate) {
      query.date = {};
      if (options.startDate) query.date.$gte = new Date(options.startDate);
      if (options.endDate) query.date.$lte = new Date(options.endDate);
    }
    
    const transaction = await Transaction.findOne(query)
      .sort({ amount: 1 })
      .limit(1);
    
    return transaction;
  } catch (error) {
    console.error('Error getting smallest transaction:', error);
    throw error;
  }
}

/**
 * Compare two time periods
 */
async function comparePeriods(userId, currentPeriod, previousPeriod) {
  try {
    const currentData = await getTotalSpending(userId, {
      startDate: currentPeriod.startDate,
      endDate: currentPeriod.endDate
    });
    
    const previousData = await getTotalSpending(userId, {
      startDate: previousPeriod.startDate,
      endDate: previousPeriod.endDate
    });
    
    const difference = currentData.total - previousData.total;
    const percentChange = previousData.total > 0 
      ? ((difference / previousData.total) * 100) 
      : 0;
    
    return {
      current: currentData,
      previous: previousData,
      difference,
      percentChange,
      trend: difference > 0 ? 'increasing' : difference < 0 ? 'decreasing' : 'stable'
    };
  } catch (error) {
    console.error('Error comparing periods:', error);
    throw error;
  }
}

/**
 * Get all active goals for user
 */
async function getActiveGoals(userId) {
  try {
    const goals = await Goal.find({
      user: userId,
      status: { $ne: 'completed' } 
    });
    
    return goals.map(goal => ({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      remaining: goal.targetAmount - goal.currentAmount,
      deadline: goal.deadline
    }));
  } catch (error) {
    console.error('Error getting active goals:', error);
    throw error;
  }
}

/**
 * Get specific goal by name
 */
async function getGoalByName(userId, goalName) {
  try {
    const goal = await Goal.findOne({
      user: userId,
      name: new RegExp(goalName, 'i')
    });
    
    if (!goal) return null;
    
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;
    
    // Calculate estimated completion date based on current savings rate
    let estimatedCompletion = null;
    if (goal.monthlyContribution && goal.monthlyContribution > 0) {
      const monthsRemaining = Math.ceil(remaining / goal.monthlyContribution);
      estimatedCompletion = new Date();
      estimatedCompletion.setMonth(estimatedCompletion.getMonth() + monthsRemaining);
    }
    
    return {
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      progress,
      remaining,
      deadline: goal.deadline,
      estimatedCompletion,
      monthlyContribution: goal.monthlyContribution
    };
  } catch (error) {
    console.error('Error getting goal by name:', error);
    throw error;
  }
}

/**
 * Get user's unique transaction categories
 */
async function getUserCategories(userId) {
  try {
    const categories = await Transaction.distinct('category', { user: userId });
    return categories.filter(c => c); // Remove null/undefined
  } catch (error) {
    console.error('Error getting user categories:', error);
    throw error;
  }
}

/**
 * Get financial summary for period
 */
async function getFinancialSummary(userId, options = {}) {
  try {
    const [spending, income, categoryBreakdown] = await Promise.all([
      getTotalSpending(userId, options),
      getTotalIncome(userId, options),
      getSpendingByCategory(userId, options)
    ]);
    
    const netAmount = income.total - spending.total;
    const savingsRate = income.total > 0 
      ? ((netAmount / income.total) * 100) 
      : 0;
    
    return {
      income: income.total,
      spending: spending.total,
      netAmount,
      savingsRate,
      transactionCount: spending.count + income.count,
      topCategory: categoryBreakdown[0] || null,
      categoryBreakdown: categoryBreakdown.slice(0, 5) // Top 5 categories
    };
  } catch (error) {
    console.error('Error getting financial summary:', error);
    throw error;
  }
}

/**
 * Get spending trends over time
 */
async function getSpendingTrends(userId, months = 6) {
  try {
    const trends = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const spending = await getTotalSpending(userId, { startDate, endDate });
      
      trends.push({
        month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        spending: spending.total,
        transactionCount: spending.count
      });
    }
    
    return trends;
  } catch (error) {
    console.error('Error getting spending trends:', error);
    throw error;
  }
}

export {
  getTransactions,
  getTotalSpending,
  getTotalIncome,
  getSpendingByCategory,
  getLargestTransaction,
  getSmallestTransaction,
  comparePeriods,
  getActiveGoals,
  getGoalByName,
  getUserCategories,
  getFinancialSummary,
  getSpendingTrends
};
