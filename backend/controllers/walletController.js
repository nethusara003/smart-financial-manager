import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import LedgerEntry from "../models/LedgerEntry.js";
import mongoose from "mongoose";

const WALLET_ACTIVITY_CATEGORIES = [
  "wallet_topup",
  "wallet_withdrawal",
  "wallet_transfer_sent",
  "wallet_transfer_received",
  "wallet_transfer_reversal_in",
  "wallet_transfer_reversal_out",
  // Legacy categories kept for backward compatibility
  "wallet_deposit",
  "transfer_sent",
  "transfer_received",
];

/**
 * Get or create user's wallet balance
 * GET /api/wallet/balance
 */
export const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      // Create new wallet if doesn't exist
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        currency: "USD",
        status: "active",
      });
    }

    res.status(200).json({
      success: true,
      wallet: {
        balance: wallet.balance,
        availableBalance: wallet.availableBalance,
        pendingBalance: wallet.pendingBalance,
        currency: wallet.currency,
        status: wallet.status,
        lastUpdated: wallet.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wallet balance",
      error: error.message,
    });
  }
};

/**
 * Initialize/Create wallet for user
 * POST /api/wallet/initialize
 */
export const createOrInitializeWallet = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if wallet already exists
    let wallet = await Wallet.findOne({ user: userId });

    if (wallet) {
      return res.status(200).json({
        success: true,
        message: "Wallet already exists",
        wallet: {
          balance: wallet.balance,
          availableBalance: wallet.availableBalance,
          currency: wallet.currency,
          status: wallet.status,
        },
      });
    }

    // Create new wallet
    wallet = await Wallet.create({
      user: userId,
      balance: 0,
      currency: "USD",
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Wallet created successfully",
      wallet: {
        balance: wallet.balance,
        availableBalance: wallet.availableBalance,
        currency: wallet.currency,
        status: wallet.status,
      },
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create wallet",
      error: error.message,
    });
  }
};

/**
 * Add funds to wallet (Mock payment - for demo purposes)
 * POST /api/wallet/add-funds
 */
export const addFundsToWallet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { amount, paymentMethod, cardLast4 } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Must be greater than 0",
      });
    }

    if (amount > 500000) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Amount exceeds maximum limit per transaction",
        maxLimit: 500000,
      });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: userId }).session(session);

    if (!wallet) {
      const newWallets = await Wallet.create(
        [
          {
            user: userId,
            balance: 0,
            currency: "USD",
            status: "active",
          },
        ],
        { session }
      );
      wallet = newWallets[0];
    }

    // Check wallet status
    if (wallet.status !== "active") {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: `Wallet is ${wallet.status}. Cannot add funds.`,
      });
    }

    // Update wallet balance
    const previousBalance = wallet.balance;
    wallet.balance += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    // Create transaction record
    const transaction = await Transaction.create(
      [
        {
          user: userId,
          type: "expense",
          category: "wallet_topup",
          amount: amount,
          note: `Moved funds from savings to wallet via ${paymentMethod || "payment method"}${cardLast4 ? ` (****${cardLast4})` : ""}`,
          date: new Date(),
          isTransfer: false,
          scope: "savings",
          systemManaged: true,
        },
      ],
      { session }
    );

    // Create ledger entry for audit trail
    await LedgerEntry.create(
      [
        {
          user: userId,
          wallet: wallet._id,
          type: "deposit",
          amount: amount,
          currency: "USD",
          balanceAfter: wallet.balance,
          description: `Wallet deposit - ${paymentMethod || "Payment method"}`,
          metadata: {
            paymentMethod: paymentMethod || "card",
            cardLast4: cardLast4 || "****",
            transactionId: transaction[0]._id.toString(),
          },
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Funds added successfully",
      wallet: {
        balance: wallet.balance,
        availableBalance: wallet.availableBalance,
        previousBalance: previousBalance,
        amountAdded: amount,
      },
      transaction: {
        id: transaction[0]._id,
        amount: amount,
        date: transaction[0].date,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding funds to wallet:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add funds",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * Withdraw funds from wallet (Mock withdrawal - for demo purposes)
 * POST /api/wallet/withdraw
 */
export const withdrawFromWallet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { amount, bankAccount } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Must be greater than 0",
      });
    }

    // Get wallet
    const wallet = await Wallet.findOne({ user: userId }).session(session);

    if (!wallet) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    // Check wallet status
    if (wallet.status !== "active") {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: `Wallet is ${wallet.status}. Cannot withdraw funds.`,
      });
    }

    // Check sufficient balance
    if (wallet.availableBalance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
        availableBalance: wallet.availableBalance,
        requestedAmount: amount,
      });
    }

    // Update wallet balance
    const previousBalance = wallet.balance;
    wallet.balance -= amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    // Create transaction record
    const transaction = await Transaction.create(
      [
        {
          user: userId,
          type: "income",
          category: "wallet_withdrawal",
          amount,
          note: `Moved funds from wallet to savings${bankAccount ? ` (${bankAccount})` : ""}`,
          date: new Date(),
          isTransfer: false,
          scope: "savings",
          systemManaged: true,
        },
      ],
      { session }
    );

    // Create ledger entry for audit trail
    await LedgerEntry.create(
      [
        {
          user: userId,
          wallet: wallet._id,
          type: "withdrawal",
          amount: amount,
          currency: "USD",
          balanceAfter: wallet.balance,
          description: `Wallet withdrawal${bankAccount ? ` to ${bankAccount}` : ""}`,
          metadata: {
            bankAccount: bankAccount || "Not specified",
            transactionId: transaction[0]._id.toString(),
          },
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Withdrawal successful",
      wallet: {
        balance: wallet.balance,
        availableBalance: wallet.availableBalance,
        previousBalance: previousBalance,
        amountWithdrawn: amount,
      },
      transaction: {
        id: transaction[0]._id,
        amount: amount,
        date: transaction[0].date,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error withdrawing from wallet:", error);
    res.status(500).json({
      success: false,
      message: "Failed to withdraw funds",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * Get wallet transaction history
 * GET /api/wallet/transactions
 */
export const getWalletTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, type } = req.query;

    // Build query
    const query = {
      user: userId,
      category: {
        $in: WALLET_ACTIVITY_CATEGORIES,
      },
    };

    if (type) {
      if (type === "deposit") {
        query.category = { $in: ["wallet_topup", "wallet_deposit"] };
      } else if (type === "withdrawal") {
        query.category = { $in: ["wallet_withdrawal"] };
      } else if (type === "transfer") {
        query.category = {
          $in: [
            "wallet_transfer_sent",
            "wallet_transfer_received",
            "wallet_transfer_reversal_in",
            "wallet_transfer_reversal_out",
            "transfer_sent",
            "transfer_received",
          ],
        };
      }
    }

    // Get transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTransactions: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};
