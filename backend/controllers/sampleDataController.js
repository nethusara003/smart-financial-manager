/**
 * Sample Data Controller
 * Generates realistic financial data for testing intelligent features
 */

import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import Bill from '../models/Bill.js';

// Expense categories with typical spending patterns
const EXPENSE_CATEGORIES = [
  { name: 'Groceries', avgAmount: 400, variance: 100, frequency: 8 },
  { name: 'Dining Out', avgAmount: 60, variance: 30, frequency: 6 },
  { name: 'Transportation', avgAmount: 150, variance: 50, frequency: 4 },
  { name: 'Utilities', avgAmount: 200, variance: 30, frequency: 1 },
  { name: 'Entertainment', avgAmount: 80, variance: 40, frequency: 4 },
  { name: 'Shopping', avgAmount: 120, variance: 80, frequency: 3 },
  { name: 'Healthcare', avgAmount: 100, variance: 50, frequency: 2 },
  { name: 'Insurance', avgAmount: 300, variance: 0, frequency: 1 },
  { name: 'Rent', avgAmount: 1500, variance: 0, frequency: 1 },
  { name: 'Subscriptions', avgAmount: 50, variance: 10, frequency: 1 },
];

const INCOME_PATTERN = {
  salary: 4500,
  freelance: 500,
};

function randomAmount(base, variance) {
  return Math.round((base + (Math.random() - 0.5) * variance * 2) * 100) / 100;
}

function randomDateInMonth(year, month, day = null, maxDate = null) {
  if (day) return new Date(year, month, day);
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let maxDay = daysInMonth;
  
  // If maxDate is provided and it's in the same month, limit to that day
  if (maxDate) {
    const maxYear = maxDate.getFullYear();
    const maxMonth = maxDate.getMonth();
    if (year === maxYear && month === maxMonth) {
      maxDay = Math.min(maxDate.getDate(), daysInMonth);
    }
  }
  
  const randomDay = Math.floor(Math.random() * maxDay) + 1;
  return new Date(year, month, randomDay);
}

/**
 * Generate sample data for current user
 * POST /api/sample-data/generate
 */
export const generateSampleData = async (req, res) => {
  try {
    const userId = req.user.id;
    const MONTHS_OF_DATA = 3;
    
    console.log(`📝 Generating sample data for user ${userId}...`);
    
    // Clear existing data
    await Transaction.deleteMany({ user: userId });
    await Budget.deleteMany({ userId: userId });
    await Goal.deleteMany({ user: userId });
    await Bill.deleteMany({ userId: userId });
    
    const transactions = [];
    const today = new Date();
    
    // Generate transactions for past months only
    for (let monthOffset = 0; monthOffset < MONTHS_OF_DATA; monthOffset++) {
      const targetDate = new Date();
      targetDate.setMonth(today.getMonth() - monthOffset);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      
      // For current month, only generate data up to today
      const maxDate = monthOffset === 0 ? today : null;
      
      // Monthly salary - always on 1st of month or in the past
      const salaryDate = new Date(year, month, 1);
      if (salaryDate <= today) {
        transactions.push({
          user: userId,
          type: 'income',
          category: 'Salary',
          amount: INCOME_PATTERN.salary,
          note: 'Monthly salary',
          date: salaryDate,
        });
      }
      
      // Occasional freelance
      if (Math.random() > 0.5) {
        transactions.push({
          user: userId,
          type: 'income',
          category: 'Freelance',
          amount: randomAmount(INCOME_PATTERN.freelance, 200),
          note: 'Freelance project',
          date: randomDateInMonth(year, month, null, maxDate),
        });
      }
      
      // Expenses
      for (const category of EXPENSE_CATEGORIES) {
        for (let i = 0; i < category.frequency; i++) {
          transactions.push({
            user: userId,
            type: 'expense',
            category: category.name,
            amount: randomAmount(category.avgAmount, category.variance),
            note: `${category.name} expense`,
            date: randomDateInMonth(year, month, null, maxDate),
          });
        }
      }
    }
    
    await Transaction.insertMany(transactions);
    
    // Generate budgets (monthly and daily examples)
    const budgets = [];
    
    // Add daily budget examples
    const dailyBudgets = [
      { category: 'Food', limit: 50, period: 'daily' },        // Daily food budget
      { category: 'Transportation', limit: 25, period: 'daily' }, // Daily transport
    ];
    
    dailyBudgets.forEach(budgetData => {
      budgets.push({
        userId: userId,
        category: budgetData.category,
        limit: budgetData.limit,
        period: budgetData.period,
        startDate: new Date(),
        active: true,
      });
    });
    
    // Add monthly budgets
    for (let monthOffset = 0; monthOffset <= 1; monthOffset++) {
      const targetDate = new Date();
      targetDate.setMonth(today.getMonth() + monthOffset);
      targetDate.setDate(1); // First day of month
      
      // Budget limits that match actual spending patterns
      const budgetCategories = [
        { category: 'Groceries', limit: 3500 },    // ~400 * 8 transactions
        { category: 'Dining Out', limit: 400 },     // ~60 * 6 transactions
        { category: 'Transportation', limit: 650 }, // ~150 * 4 transactions
        { category: 'Entertainment', limit: 350 },  // ~80 * 4 transactions
        { category: 'Shopping', limit: 400 },       // ~120 * 3 transactions
        { category: 'Utilities', limit: 250 },      // ~200 * 1 transaction
        { category: 'Healthcare', limit: 225 },     // ~100 * 2 transactions
      ];
      
      for (const budgetData of budgetCategories) {
        budgets.push({
          userId: userId,
          category: budgetData.category,
          limit: budgetData.limit,
          period: 'monthly',
          startDate: targetDate,
          active: true,
        });
      }
    }
    
    await Budget.insertMany(budgets);
    
    // Generate goals
    const goals = [
      {
        user: userId,
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 3500,
        targetDate: new Date(today.getFullYear(), today.getMonth() + 12, 1),
        category: 'emergency',
        priority: 'high',
        status: 'active',
      },
      {
        user: userId,
        name: 'Vacation Trip',
        targetAmount: 3000,
        currentAmount: 1200,
        targetDate: new Date(today.getFullYear(), today.getMonth() + 6, 1),
        category: 'travel',
        priority: 'medium',
        status: 'active',
      },
      {
        user: userId,
        name: 'New Laptop',
        targetAmount: 1500,
        currentAmount: 800,
        targetDate: new Date(today.getFullYear(), today.getMonth() + 3, 1),
        category: 'purchase',
        priority: 'medium',
        status: 'active',
      },
      {
        user: userId,
        name: 'Home Down Payment',
        targetAmount: 50000,
        currentAmount: 15000,
        targetDate: new Date(today.getFullYear() + 2, today.getMonth(), 1),
        category: 'savings',
        priority: 'high',
        status: 'active',
      },
    ];
    
    await Goal.insertMany(goals);
    
    // Generate bills
    const bills = [
      {
        userId: userId,
        name: 'Rent',
        amount: 1500,
        category: 'rent',
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
        recurring: true,
        frequency: 'monthly',
        isPaid: false,
      },
      {
        userId: userId,
        name: 'Electric Bill',
        amount: 120,
        category: 'electricity',
        dueDate: new Date(today.getFullYear(), today.getMonth(), 15),
        recurring: true,
        frequency: 'monthly',
        isPaid: false,
      },
      {
        userId: userId,
        name: 'Internet',
        amount: 80,
        category: 'internet',
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 5),
        recurring: true,
        frequency: 'monthly',
        isPaid: true,
      },
      {
        userId: userId,
        name: 'Phone Bill',
        amount: 60,
        category: 'phone',
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 10),
        recurring: true,
        frequency: 'monthly',
        isPaid: true,
      },
      {
        userId: userId,
        name: 'Car Insurance',
        amount: 150,
        category: 'insurance',
        dueDate: new Date(today.getFullYear(), today.getMonth(), 20),
        recurring: true,
        frequency: 'monthly',
        isPaid: false,
      },
      {
        userId: userId,
        name: 'Netflix',
        amount: 15.99,
        category: 'subscription',
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 12),
        recurring: true,
        frequency: 'monthly',
        isPaid: true,
      },
      {
        userId: userId,
        name: 'Gym Membership',
        amount: 45,
        category: 'subscription',
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
        recurring: true,
        frequency: 'monthly',
        isPaid: true,
      },
    ];
    
    await Bill.insertMany(bills);
    
    res.json({
      success: true,
      message: 'Sample data generated successfully',
      data: {
        transactions: transactions.length,
        budgets: budgets.length,
        goals: goals.length,
        bills: bills.length,
        months: MONTHS_OF_DATA,
      }
    });
    
  } catch (error) {
    console.error('Error generating sample data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sample data',
      error: error.message
    });
  }
};

/**
 * Check if user has sufficient data
 * GET /api/sample-data/check
 */
export const checkDataSufficiency = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const transactionCount = await Transaction.countDocuments({ user: userId });
    const budgetCount = await Budget.countDocuments({ user: userId });
    const goalCount = await Goal.countDocuments({ user: userId });
    const billCount = await Bill.countDocuments({ user: userId });
    
    const hasSufficientData = transactionCount >= 30 && budgetCount >= 3 && goalCount >= 1;
    
    res.json({
      success: true,
      hasSufficientData,
      data: {
        transactions: transactionCount,
        budgets: budgetCount,
        goals: goalCount,
        bills: billCount,
      },
      recommendations: {
        needTransactions: transactionCount < 30,
        needBudgets: budgetCount < 3,
        needGoals: goalCount < 1,
      }
    });
    
  } catch (error) {
    console.error('Error checking data sufficiency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check data',
      error: error.message
    });
  }
};
