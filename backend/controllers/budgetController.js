import Budget from "../models/Budget.js";
import { checkBudgetAlerts } from "../utils/budgetChecker.js";

/* =========================
   GET ALL BUDGETS
========================= */
export const getBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const budgets = await Budget.find({ userId, active: true }).sort({ createdAt: -1 });
    
    res.json({ budgets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   CREATE BUDGET
========================= */
export const createBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, limit, period, alertThreshold, icon, color } = req.body;

    if (!category || !limit) {
      return res.status(400).json({ message: "Category and limit are required" });
    }

    // Check if budget already exists for this category and period
    const existing = await Budget.findOne({ userId, category, period, active: true });
    if (existing) {
      return res.status(400).json({ message: `Budget for ${category} (${period}) already exists` });
    }

    const budget = await Budget.create({
      userId,
      category,
      limit,
      period: period || 'monthly',
      alertThreshold: alertThreshold || 80,
      icon: icon || 'DollarSign',
      color: color || 'cyan'
    });

    res.status(201).json({ budget });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE BUDGET
========================= */
export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const allowedUpdates = ['category', 'limit', 'period', 'alertThreshold', 'icon', 'color', 'active'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(budget, updates);
    await budget.save();

    res.json({ budget });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE BUDGET
========================= */
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const budget = await Budget.findOneAndDelete({ _id: id, userId });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET BUDGET WITH SPENDING
========================= */
export const getBudgetWithSpending = async (req, res) => {
  try {
    const userId = req.user._id;
    const budgets = await Budget.find({ userId, active: true });

    // Import Transaction model
    const Transaction = (await import('../models/Transaction.js')).default;

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const now = new Date();
        let startDate, endDate;

        // Calculate date range based on period
        switch (budget.period) {
          case 'daily':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'weekly':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay()); // Start of week
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
            break;
          case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear() + 1, 0, 1);
            break;
          case 'monthly':
          default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }

        // Get transactions for this category in the period
        // Use case-insensitive regex matching for category
        const transactions = await Transaction.find({
          user: userId,
          type: 'expense',
          category: { $regex: new RegExp(`^${budget.category}$`, 'i') },
          date: { $gte: startDate, $lt: endDate }
        });

        const spent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

        return {
          ...budget.toObject(),
          spent,
          percentage: Math.round(percentage),
          remaining: Math.max(0, budget.limit - spent),
          periodStart: startDate,
          periodEnd: endDate
        };
      })
    );

    res.json({ budgets: budgetsWithSpending });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
