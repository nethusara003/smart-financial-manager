import Transaction from "../models/Transaction.js";
import { guestStore } from "./userController.js";
import crypto from "crypto";

// Guest transaction limit
const GUEST_TRANSACTION_LIMIT = 50;

// @desc    Add new transaction
// @route   POST /api/transactions
// @access  Private
export const addTransaction = async (req, res) => {
  try {
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
      user: req.user._id,
      type,
      category,
      amount,
      note,
      date,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions for logged-in user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    // GUEST USER - In-memory storage
    if (req.user.isGuest) {
      const guestData = guestStore.get(req.user.id);
      
      if (!guestData) {
        return res.json([]); // Return empty array if session expired
      }

      const transactions = (guestData.transactions || []).sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      return res.json(transactions);
    }

    // AUTHENTICATED USER - Database storage
    const transactions = await Transaction.find({
      user: req.user._id,
    }).sort({ date: -1 });

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
    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        type: req.body.type,
        category: req.body.category,
        amount: req.body.amount,
        note: req.body.note,
        date: req.body.date,
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Failed to update transaction" });
  }
};



// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
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
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await transaction.deleteOne();
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
