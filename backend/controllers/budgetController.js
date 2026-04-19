import Budget from "../models/Budget.js";
import User from "../models/User.js";
import { checkBudgetAlerts } from "../utils/budgetChecker.js";

const VALID_EXPENSE_START_MODES = new Set(["include_existing", "start_from_now"]);
const ACTIVE_BUDGET_FILTER = { $ne: false };
const BLOCKED_BUDGET_CATEGORIES = new Set([
  "monthly budget",
  "transfer",
  "transfer sent",
  "transfer received",
  "wallet topup",
  "wallet_topup",
  "wallet deposit",
  "wallet_deposit",
  "wallet withdrawal",
  "wallet_withdrawal",
  "wallet transfer sent",
  "wallet transfer received",
  "wallet_transfer_sent",
  "wallet_transfer_received",
  "wallet transfer reversal in",
  "wallet transfer reversal out",
  "wallet_transfer_reversal_in",
  "wallet_transfer_reversal_out",
]);
const BLOCKED_BUDGET_CATEGORY_KEYWORDS = [
  "wallet",
  "transfer",
  "topup",
  "top-up",
  "deposit",
  "withdrawal",
  "reversal",
];

function normalizeBudgetCategoryName(value) {
  return String(value || "").trim().toLowerCase();
}

function isBlockedBudgetCategory(value) {
  const normalized = normalizeBudgetCategoryName(value);
  return (
    BLOCKED_BUDGET_CATEGORIES.has(normalized) ||
    BLOCKED_BUDGET_CATEGORY_KEYWORDS.some((keyword) => normalized.includes(keyword))
  );
}

function normalizeExpenseStartMode(value) {
  const normalized = String(value || "include_existing").trim().toLowerCase();
  return VALID_EXPENSE_START_MODES.has(normalized) ? normalized : null;
}

function parseValidDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveEffectiveStartDate({ periodStart, budget, globalExpenseStartMode, globalExpenseStartDate }) {
  const useStartFromNow =
    budget.expenseStartMode === "start_from_now" || globalExpenseStartMode === "start_from_now";

  if (!useStartFromNow) {
    return periodStart;
  }

  const starts = [
    parseValidDate(budget.expenseStartDate),
    parseValidDate(globalExpenseStartDate),
  ].filter(Boolean);

  if (starts.length === 0) {
    return periodStart;
  }

  const latestStart = new Date(Math.max(...starts.map((entry) => entry.getTime())));
  if (latestStart.getTime() <= periodStart.getTime()) {
    return periodStart;
  }

  return latestStart;
}

/* =========================
   GET ALL BUDGETS
========================= */
export const getBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const budgets = await Budget.find({ userId, active: ACTIVE_BUDGET_FILTER }).sort({ createdAt: -1 });
    
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
    const { 
      category, 
      limit, 
      period, 
      alertThreshold, 
      icon, 
      color, 
      budgetGroup, 
      isGroupParent, 
      groupMetadata,
      expenseStartMode,
    } = req.body;

    if (!category || !limit) {
      return res.status(400).json({ message: "Category and limit are required" });
    }

    if (isBlockedBudgetCategory(category)) {
      return res.status(400).json({ message: "This summary category cannot be created" });
    }

    // Only check for duplicates if it's not part of a group
    if (!budgetGroup) {
      const existing = await Budget.findOne({ 
        userId, 
        category, 
        period, 
        active: ACTIVE_BUDGET_FILTER,
        budgetGroup: null 
      });
      if (existing) {
        return res.status(400).json({ message: `Budget for ${category} (${period}) already exists` });
      }
    }

    const normalizedExpenseStartMode = normalizeExpenseStartMode(expenseStartMode);
    if (!normalizedExpenseStartMode) {
      return res.status(400).json({
        message: "Expense start mode must be either include_existing or start_from_now",
      });
    }

    const budget = await Budget.create({
      userId,
      category,
      limit,
      period: period || 'monthly',
      alertThreshold: alertThreshold || 80,
      icon: icon || 'DollarSign',
      color: color || 'cyan',
      budgetGroup: budgetGroup || null,
      isGroupParent: isGroupParent || false,
      groupMetadata: groupMetadata || null,
      expenseStartMode: normalizedExpenseStartMode,
      expenseStartDate: normalizedExpenseStartMode === "start_from_now" ? new Date() : null,
    });

    res.status(201).json({ budget });
  } catch (error) {
    console.error("Error creating budget:", error);
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

    const allowedUpdates = [
      'category',
      'limit',
      'period',
      'alertThreshold',
      'icon',
      'color',
      'active',
      'expenseStartMode',
    ];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.body.category !== undefined && isBlockedBudgetCategory(req.body.category)) {
      return res.status(400).json({ message: "This summary category cannot be used" });
    }

    if (req.body.expenseStartMode !== undefined) {
      const normalizedExpenseStartMode = normalizeExpenseStartMode(req.body.expenseStartMode);
      if (!normalizedExpenseStartMode) {
        return res.status(400).json({
          message: "Expense start mode must be either include_existing or start_from_now",
        });
      }

      updates.expenseStartMode = normalizedExpenseStartMode;
      updates.expenseStartDate =
        normalizedExpenseStartMode === "start_from_now" ? new Date() : null;
    }

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

    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    // If this is a parent budget (part of a group), delete all child budgets too
    if (budget.isGroupParent && budget.budgetGroup) {
      await Budget.deleteMany({ 
        userId, 
        budgetGroup: budget.budgetGroup,
        isGroupParent: false 
      });
    }

    // Delete the budget itself
    await Budget.findByIdAndDelete(id);

    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET BUDGET WITH SPENDING
========================= */
export const getBudgetWithSpending = async (req, res) => {
  try {
    const userId = req.user._id;
    const [budgets, userSettings] = await Promise.all([
      Budget.find({ userId, active: ACTIVE_BUDGET_FILTER }),
      User.findById(userId).select("expenseStartMode expenseStartDate"),
    ]);

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

        const effectiveStartDate = resolveEffectiveStartDate({
          periodStart: startDate,
          budget,
          globalExpenseStartMode: userSettings?.expenseStartMode,
          globalExpenseStartDate: userSettings?.expenseStartDate,
        });

        const effectiveExpenseStartMode =
          budget.expenseStartMode === "start_from_now" || userSettings?.expenseStartMode === "start_from_now"
            ? "start_from_now"
            : "include_existing";

        // Get transactions for this category in the period
        // Use case-insensitive regex matching for category
        const transactions = await Transaction.find({
          user: userId,
          type: 'expense',
          category: { $regex: new RegExp(`^${budget.category}$`, 'i') },
          date: { $gte: effectiveStartDate, $lt: endDate }
        });

        const spent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

        return {
          ...budget.toObject(),
          spent,
          percentage: Math.round(percentage),
          remaining: Math.max(0, budget.limit - spent),
          periodStart: effectiveStartDate,
          periodEnd: endDate,
          expenseStartMode: effectiveExpenseStartMode,
          expenseStartDate:
            effectiveExpenseStartMode === "start_from_now"
              ? budget.expenseStartDate || userSettings?.expenseStartDate || null
              : null,
        };
      })
    );

    res.json({ budgets: budgetsWithSpending });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
