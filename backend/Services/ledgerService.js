// @ts-nocheck
import mongoose from "mongoose";
import LedgerEntry from "../models/LedgerEntry.js";
import Wallet from "../models/Wallet.js";

/**
 * Ledger Service
 * 
 * Maintains an immutable audit trail of all wallet transactions.
 * Provides comprehensive transaction history and analytics.
 */

/**
 * Record a ledger entry
 * @param {Object} params - Ledger entry parameters
 * @returns {Promise<LedgerEntry>} Created ledger entry
 */
export const recordTransaction = async (params) => {
  try {
    const {
      user,
      wallet,
      type,
      amount,
      currency,
      balanceAfter,
      transferId,
      paymentIntentId,
      description,
      metadata,
      status = "completed",
      relatedParty,
      ipAddress,
      userAgent,
      session,
    } = params;

    // Validate required fields
    if (!user || !wallet || !type || amount === undefined || balanceAfter === undefined) {
      throw new Error("Missing required fields for ledger entry");
    }

    // Create ledger entry
    const ledgerEntry = await LedgerEntry.create(
      [
        {
          user,
          wallet,
          type,
          amount,
          currency: currency || "USD",
          balanceAfter,
          transferId,
          paymentIntentId,
          description: description || "",
          metadata: metadata || {},
          status,
          relatedParty,
          ipAddress,
          userAgent,
          timestamp: new Date(),
        },
      ],
      { session }
    );

    return ledgerEntry[0];
  } catch (error) {
    console.error("Record transaction error:", error);
    throw error;
  }
};

/**
 * Get ledger entries for user
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Ledger entries with pagination
 */
export const getUserLedger = async (userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      startDate,
      endDate,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = options;

    // Build query
    const query = { user: userId };

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortField = sortBy === "amount" ? "amount" : "timestamp";
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const entries = await LedgerEntry.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .populate("relatedParty.userId", "name email");

    const totalEntries = await LedgerEntry.countDocuments(query);
    const totalPages = Math.ceil(totalEntries / limitNum);

    return {
      entries,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalEntries,
        hasMore: pageNum < totalPages,
      },
    };
  } catch (error) {
    console.error("Get user ledger error:", error);
    throw error;
  }
};

/**
 * Get ledger entry by ID
 * @param {mongoose.Types.ObjectId} entryId - Entry ID
 * @returns {Promise<LedgerEntry>} Ledger entry
 */
export const getLedgerEntry = async (entryId) => {
  try {
    const entry = await LedgerEntry.findById(entryId)
      .populate("user", "name email")
      .populate("wallet")
      .populate("transferId")
      .populate("relatedParty.userId", "name email");

    if (!entry) {
      throw new Error("Ledger entry not found");
    }

    return entry;
  } catch (error) {
    console.error("Get ledger entry error:", error);
    throw error;
  }
};

/**
 * Get ledger entries by transfer ID
 * @param {mongoose.Types.ObjectId} transferId - Transfer ID
 * @returns {Promise<Array>} Ledger entries
 */
export const getLedgerByTransfer = async (transferId) => {
  try {
    const entries = await LedgerEntry.find({ transferId })
      .sort({ timestamp: 1 })
      .populate("user", "name email")
      .populate("relatedParty.userId", "name email");

    return entries;
  } catch (error) {
    console.error("Get ledger by transfer error:", error);
    throw error;
  }
};

/**
 * Get ledger entries by payment intent ID
 * @param {String} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Array>} Ledger entries
 */
export const getLedgerByPaymentIntent = async (paymentIntentId) => {
  try {
    const entries = await LedgerEntry.find({ paymentIntentId })
      .sort({ timestamp: 1 })
      .populate("user", "name email");

    return entries;
  } catch (error) {
    console.error("Get ledger by payment intent error:", error);
    throw error;
  }
};

/**
 * Get transaction summary for user
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Transaction summary
 */
export const getTransactionSummary = async (userId, options = {}) => {
  try {
    const { startDate, endDate } = options;

    // Build query
    const query = { user: userId, status: "completed" };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Get all entries
    const entries = await LedgerEntry.find(query);

    // Calculate summary
    const summary = {
      totalTransactions: entries.length,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalTransfersOut: 0,
      totalTransfersIn: 0,
      totalFees: 0,
      netFlow: 0,
      byType: {},
    };

    entries.forEach((entry) => {
      const amount = Math.abs(entry.amount);

      switch (entry.type) {
        case "deposit":
          summary.totalDeposits += amount;
          summary.netFlow += amount;
          break;
        case "withdrawal":
          summary.totalWithdrawals += amount;
          summary.netFlow -= amount;
          break;
        case "transfer_out":
          summary.totalTransfersOut += amount;
          summary.netFlow -= amount;
          break;
        case "transfer_in":
          summary.totalTransfersIn += amount;
          summary.netFlow += amount;
          break;
        case "fee":
          summary.totalFees += amount;
          summary.netFlow -= amount;
          break;
        case "refund":
          summary.netFlow += amount;
          break;
        case "reversal":
          // Reversals cancel out original transactions
          if (entry.amount > 0) {
            summary.netFlow += amount;
          } else {
            summary.netFlow -= amount;
          }
          break;
      }

      // Count by type
      summary.byType[entry.type] = (summary.byType[entry.type] || 0) + 1;
    });

    return summary;
  } catch (error) {
    console.error("Get transaction summary error:", error);
    throw error;
  }
};

/**
 * Verify ledger integrity
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<Object>} Verification result
 */
export const verifyLedgerIntegrity = async (userId) => {
  try {
    // Get user's wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Get all completed ledger entries in chronological order
    const entries = await LedgerEntry.find({
      user: userId,
      status: "completed",
    }).sort({ timestamp: 1 });

    if (entries.length === 0) {
      return {
        isValid: true,
        message: "No transactions to verify",
        currentBalance: wallet.balance,
        calculatedBalance: 0,
      };
    }

    // Calculate balance from entries
    let calculatedBalance = 0;
    const discrepancies = [];

    entries.forEach((entry, index) => {
      calculatedBalance += entry.amount;

      // Check if recorded balance matches calculated
      if (Math.abs(entry.balanceAfter - calculatedBalance) > 0.01) {
        discrepancies.push({
          entryId: entry._id,
          timestamp: entry.timestamp,
          recordedBalance: entry.balanceAfter,
          calculatedBalance,
          difference: entry.balanceAfter - calculatedBalance,
        });
      }
    });

    // Check if final balance matches wallet balance
    const balanceMatches = Math.abs(wallet.balance - calculatedBalance) < 0.01;

    return {
      isValid: discrepancies.length === 0 && balanceMatches,
      currentBalance: wallet.balance,
      calculatedBalance,
      totalEntries: entries.length,
      discrepancies,
      message:
        discrepancies.length === 0 && balanceMatches
          ? "Ledger integrity verified"
          : "Ledger integrity issues detected",
    };
  } catch (error) {
    console.error("Verify ledger integrity error:", error);
    throw error;
  }
};

/**
 * Get transaction analytics
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Transaction analytics
 */
export const getTransactionAnalytics = async (userId, options = {}) => {
  try {
    const { period = "month" } = options;

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get entries for period
    const entries = await LedgerEntry.find({
      user: userId,
      status: "completed",
      timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 });

    // Group by day
    const dailyData = {};

    entries.forEach((entry) => {
      const day = entry.timestamp.toISOString().split("T")[0];

      if (!dailyData[day]) {
        dailyData[day] = {
          date: day,
          deposits: 0,
          withdrawals: 0,
          transfers: 0,
          count: 0,
        };
      }

      dailyData[day].count++;

      if (entry.amount > 0) {
        dailyData[day].deposits += entry.amount;
      } else {
        dailyData[day].withdrawals += Math.abs(entry.amount);
      }

      if (entry.type === "transfer_in" || entry.type === "transfer_out") {
        dailyData[day].transfers += Math.abs(entry.amount);
      }
    });

    return {
      period,
      startDate,
      endDate: now,
      totalEntries: entries.length,
      dailyBreakdown: Object.values(dailyData),
      summary: await getTransactionSummary(userId, { startDate }),
    };
  } catch (error) {
    console.error("Get transaction analytics error:", error);
    throw error;
  }
};

export default {
  recordTransaction,
  getUserLedger,
  getLedgerEntry,
  getLedgerByTransfer,
  getLedgerByPaymentIntent,
  getTransactionSummary,
  verifyLedgerIntegrity,
  getTransactionAnalytics,
};
