import Transaction from "../models/Transaction.js";
import { guestStore } from "./userController.js";
import crypto from "crypto";
import { sendTransactionAlert } from "../Services/notificationService.js";
import { createNotification } from "./notificationController.js";
import Budget from "../models/Budget.js";
import { checkBudgetAlerts } from "../utils/budgetChecker.js";

// Guest transaction limit
const GUEST_TRANSACTION_LIMIT = 50;
const ACTIVE_BUDGET_FILTER = { $ne: false };

const getRequestUserId = (req) => req.user?._id || req.user?.id || null;
const isProtectedSystemTransaction = (transaction) =>
  Boolean(
    transaction?.systemManaged ||
      transaction?.isTransfer ||
      String(transaction?.category || "").startsWith("wallet_")
  );

const LEGACY_WALLET_CATEGORIES = [
  "wallet_deposit",
  "wallet_withdrawal",
  "transfer_sent",
  "transfer_received",
  "wallet_transfer_sent",
  "wallet_transfer_received",
  "wallet_transfer_reversal_in",
  "wallet_transfer_reversal_out",
];

const runPostCreateTransactionSideEffects = (userId, transaction) => {
  // Keep transaction creation fast by running non-critical work after response.
  setImmediate(async () => {
    try {
      await Promise.allSettled([
        sendTransactionAlert(userId, transaction),
        createNotification(
          userId,
          "transaction_alert",
          `${transaction.type === "income" ? "Income" : "Expense"} Added`,
          `${transaction.category} - $${transaction.amount}`,
          {
            transactionId: transaction._id,
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount,
          },
          transaction.type === "income" ? "TrendingUp" : "TrendingDown",
          transaction.type === "income" ? "success" : "info",
          "/transactions"
        ),
      ]);

      if (transaction.type === "expense") {
        const budgets = await Budget.find({ userId, active: ACTIVE_BUDGET_FILTER });
        await checkBudgetAlerts(userId, budgets);
      }
    } catch (error) {
      console.error("Error running post-create transaction side effects:", error);
    }
  });
};

// @desc    Add new transaction
// @route   POST /api/transactions
// @access  Private
export const addTransaction = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = getRequestUserId(req);

    const { type, category, amount, note, date } = req.body;

    // GUEST USER - In-memory storage
    if (req.user.isGuest) {
      const guestData = guestStore.get(req.user.id);
      
      if (!guestData) {
        return res.status(404).json({ message: "Guest session expired. Please refresh to start a new session." });
      }

      // Check guest limit
      if (guestData.transactions.length >= GUEST_TRANSACTION_LIMIT) {
        return res.status(403).json({
          message: `Guest users are limited to ${GUEST_TRANSACTION_LIMIT} transactions. Please register to add more.`,
          guestLimit: true,
          limit: GUEST_TRANSACTION_LIMIT
        });
      }

      const transaction = {
        _id: crypto.randomUUID(),
        user: req.user.id,
        type,
        category,
        amount: Number(amount),
        note: note || '',
        date: date || new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      guestData.transactions.push(transaction);
      return res.status(201).json(transaction);
    }

    // AUTHENTICATED USER - Database storage
    const transaction = await Transaction.create({
      user: userId,
      type,
      category,
      amount,
      note,
      date,
    });

    res.status(201).json(transaction);
    runPostCreateTransactionSideEffects(userId, transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions for logged-in user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = getRequestUserId(req);
    const rawScope = String(req.query?.scope || "all").toLowerCase();
    const requestedScope = ["all", "savings", "wallet"].includes(rawScope)
      ? rawScope
      : "all";

    // GUEST USER - In-memory storage
    if (req.user.isGuest) {
      const guestData = guestStore.get(req.user.id);
      
      if (!guestData) {
        return res.json([]); // Return empty array if session expired
      }

      const transactions = (guestData.transactions || []).sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Newest first
      });

      return res.json(transactions);
    }

    // AUTHENTICATED USER - Database storage
    // Sort by date descending (newest first), then by createdAt if dates are same
    const query = { user: userId };

    if (requestedScope === "wallet") {
      query.$or = [
        { scope: "wallet" },
        { isTransfer: true },
        { category: { $in: LEGACY_WALLET_CATEGORIES } },
      ];
    } else if (requestedScope === "savings") {
      query.$or = [
        { scope: "savings" },
        {
          scope: { $exists: false },
          isTransfer: { $ne: true },
          category: { $nin: LEGACY_WALLET_CATEGORIES },
        },
      ];
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = getRequestUserId(req);

    console.log('📝 Update transaction request:', {
      id: req.params.id,
      userId,
      body: req.body
    });

    // GUEST USER - In-memory storage
    if (req.user.isGuest) {
      const guestData = guestStore.get(req.user.id);
      
      if (!guestData) {
        return res.status(404).json({ message: "Guest session expired" });
      }

      const transactionIndex = guestData.transactions.findIndex(
        t => t._id === req.params.id
      );

      if (transactionIndex === -1) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Update transaction
      guestData.transactions[transactionIndex] = {
        ...guestData.transactions[transactionIndex],
        type: req.body.type,
        category: req.body.category,
        amount: Number(req.body.amount),
        note: req.body.note,
        date: req.body.date,
        updatedAt: new Date()
      };

      return res.json(guestData.transactions[transactionIndex]);
    }

    // AUTHENTICATED USER - Database storage
    const existingTransaction = await Transaction.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!existingTransaction) {
      console.log('❌ Transaction not found for update');
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (isProtectedSystemTransaction(existingTransaction)) {
      return res.status(403).json({
        message: "Wallet and transfer ledger transactions cannot be edited manually",
      });
    }

    const updateData = {
      type: req.body.type,
      category: req.body.category,
      amount: req.body.amount,
      note: req.body.note,
    };

    // Only update date if provided
    if (req.body.date) {
      updateData.date = req.body.date;
    }

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: userId,
      },
      updateData,
      { new: true }
    );

    console.log('✅ Transaction updated successfully:', transaction._id);

    // Respond immediately — defer non-critical budget checks after response
    res.json(transaction);

    if (transaction.type === 'expense') {
      setImmediate(async () => {
        try {
          const budgets = await Budget.find({ userId, active: ACTIVE_BUDGET_FILTER });
          await checkBudgetAlerts(userId, budgets);
        } catch (budgetError) {
          console.error('Error checking budgets after update:', budgetError);
        }
      });
    }
  } catch (error) {
    console.error('❌ Error updating transaction:', error);
    res.status(500).json({ message: error.message || "Failed to update transaction" });
  }
};



// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = getRequestUserId(req);

    console.log('🗑️  Delete transaction request:', {
      id: req.params.id,
      userId
    });

    // GUEST USER - In-memory storage
    if (req.user.isGuest) {
      const guestData = guestStore.get(req.user.id);
      
      if (!guestData) {
        return res.status(404).json({ message: "Guest session expired" });
      }

      const transactionIndex = guestData.transactions.findIndex(
        t => t._id === req.params.id
      );

      if (transactionIndex === -1) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Remove transaction
      guestData.transactions.splice(transactionIndex, 1);
      return res.json({ message: "Transaction deleted" });
    }

    // AUTHENTICATED USER - Database storage
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      console.log('❌ Transaction not found');
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check ownership
    if (transaction.user.toString() !== userId.toString()) {
      console.log('❌ Not authorized - user mismatch');
      return res.status(401).json({ message: "Not authorized" });
    }

    if (isProtectedSystemTransaction(transaction)) {
      return res.status(403).json({
        message: "Wallet and transfer ledger transactions cannot be deleted manually",
      });
    }

    const wasExpense = transaction.type === 'expense';
    
    await transaction.deleteOne();
    console.log('✅ Transaction deleted successfully');

    // Respond immediately — defer non-critical budget checks after response
    res.json({ message: "Transaction deleted" });

    if (wasExpense) {
      setImmediate(async () => {
        try {
          const budgets = await Budget.find({ userId, active: ACTIVE_BUDGET_FILTER });
          await checkBudgetAlerts(userId, budgets);
        } catch (budgetError) {
          console.error('Error checking budgets after delete:', budgetError);
        }
      });
    }
  } catch (error) {
    console.error('❌ Error deleting transaction:', error);
    res.status(500).json({ message: error.message || "Failed to delete transaction" });
  }
};
