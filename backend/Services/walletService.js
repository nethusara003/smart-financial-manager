// @ts-nocheck
import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";

/**
 * Wallet Service
 * 
 * Handles all wallet-related operations including:
 * - Creating wallets
 * - Getting wallet balance
 * - Adding/deducting funds
 * - Freezing/unfreezing wallets
 * - Wallet validation
 */

/**
 * Get or create wallet for user
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<Wallet>} Wallet document
 */
export const getOrCreateWallet = async (userId) => {
  try {
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        currency: user.currency || "USD",
        status: "active",
      });
    }

    return wallet;
  } catch (error) {
    console.error("Get or create wallet error:", error);
    throw error;
  }
};

/**
 * Get wallet balance for user
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<Object>} Balance information
 */
export const getWalletBalance = async (userId) => {
  try {
    const wallet = await getOrCreateWallet(userId);

    return {
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      availableBalance: wallet.availableBalance,
      currency: wallet.currency,
      status: wallet.status,
      lastTransactionAt: wallet.lastTransactionAt,
    };
  } catch (error) {
    console.error("Get wallet balance error:", error);
    throw error;
  }
};

/**
 * Add funds to wallet
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {Number} amount - Amount to add
 * @param {Object} options - Optional parameters
 * @returns {Promise<Wallet>} Updated wallet
 */
export const addFunds = async (userId, amount, options = {}) => {
  const session = options.session || null;

  try {
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const wallet = await getOrCreateWallet(userId);

    if (!wallet.canTransact()) {
      throw new Error(`Wallet is ${wallet.status}. Cannot add funds.`);
    }

    wallet.balance += amount;
    wallet.lastTransactionAt = new Date();
    wallet.version += 1;

    await wallet.save({ session });

    return wallet;
  } catch (error) {
    console.error("Add funds error:", error);
    throw error;
  }
};

/**
 * Deduct funds from wallet
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {Number} amount - Amount to deduct
 * @param {Object} options - Optional parameters
 * @returns {Promise<Wallet>} Updated wallet
 */
export const deductFunds = async (userId, amount, options = {}) => {
  const session = options.session || null;

  try {
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const wallet = await getOrCreateWallet(userId);

    if (!wallet.canTransact()) {
      throw new Error(`Wallet is ${wallet.status}. Cannot deduct funds.`);
    }

    if (!wallet.hasSufficientBalance(amount)) {
      throw new Error("Insufficient balance");
    }

    wallet.balance -= amount;
    wallet.lastTransactionAt = new Date();
    wallet.version += 1;

    await wallet.save({ session });

    return wallet;
  } catch (error) {
    console.error("Deduct funds error:", error);
    throw error;
  }
};

/**
 * Reserve funds (move to pending)
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {Number} amount - Amount to reserve
 * @param {Object} options - Optional parameters
 * @returns {Promise<Wallet>} Updated wallet
 */
export const reserveFunds = async (userId, amount, options = {}) => {
  const session = options.session || null;

  try {
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const wallet = await getOrCreateWallet(userId);

    if (!wallet.canTransact()) {
      throw new Error(`Wallet is ${wallet.status}. Cannot reserve funds.`);
    }

    if (!wallet.hasSufficientBalance(amount)) {
      throw new Error("Insufficient balance");
    }

    wallet.balance -= amount;
    wallet.pendingBalance += amount;
    wallet.lastTransactionAt = new Date();
    wallet.version += 1;

    await wallet.save({ session });

    return wallet;
  } catch (error) {
    console.error("Reserve funds error:", error);
    throw error;
  }
};

/**
 * Release reserved funds
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {Number} amount - Amount to release
 * @param {Object} options - Optional parameters
 * @returns {Promise<Wallet>} Updated wallet
 */
export const releaseFunds = async (userId, amount, options = {}) => {
  const session = options.session || null;

  try {
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const wallet = await getOrCreateWallet(userId);

    if (wallet.pendingBalance < amount) {
      throw new Error("Insufficient pending balance");
    }

    wallet.pendingBalance -= amount;
    wallet.balance += amount;
    wallet.lastTransactionAt = new Date();
    wallet.version += 1;

    await wallet.save({ session });

    return wallet;
  } catch (error) {
    console.error("Release funds error:", error);
    throw error;
  }
};

/**
 * Complete reserved transaction (move pending to completed)
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {Number} amount - Amount to complete
 * @param {Object} options - Optional parameters
 * @returns {Promise<Wallet>} Updated wallet
 */
export const completePendingTransaction = async (userId, amount, options = {}) => {
  const session = options.session || null;

  try {
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const wallet = await getOrCreateWallet(userId);

    if (wallet.pendingBalance < amount) {
      throw new Error("Insufficient pending balance");
    }

    wallet.pendingBalance -= amount;
    wallet.lastTransactionAt = new Date();
    wallet.version += 1;

    await wallet.save({ session });

    return wallet;
  } catch (error) {
    console.error("Complete pending transaction error:", error);
    throw error;
  }
};

/**
 * Freeze wallet
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {String} reason - Reason for freezing
 * @returns {Promise<Wallet>} Updated wallet
 */
export const freezeWallet = async (userId, reason) => {
  try {
    const wallet = await getOrCreateWallet(userId);

    wallet.status = "frozen";
    wallet.frozenReason = reason;
    wallet.frozenAt = new Date();

    await wallet.save();

    return wallet;
  } catch (error) {
    console.error("Freeze wallet error:", error);
    throw error;
  }
};

/**
 * Unfreeze wallet
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<Wallet>} Updated wallet
 */
export const unfreezeWallet = async (userId) => {
  try {
    const wallet = await getOrCreateWallet(userId);

    wallet.status = "active";
    wallet.frozenReason = undefined;
    wallet.frozenAt = undefined;

    await wallet.save();

    return wallet;
  } catch (error) {
    console.error("Unfreeze wallet error:", error);
    throw error;
  }
};

/**
 * Check if user has sufficient balance
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {Number} amount - Amount to check
 * @returns {Promise<Boolean>} Has sufficient balance
 */
export const hasSufficientBalance = async (userId, amount) => {
  try {
    const wallet = await getOrCreateWallet(userId);
    return wallet.hasSufficientBalance(amount);
  } catch (error) {
    console.error("Check balance error:", error);
    return false;
  }
};

/**
 * Transfer between wallets (atomic operation)
 * @param {mongoose.Types.ObjectId} fromUserId - Sender user ID
 * @param {mongoose.Types.ObjectId} toUserId - Receiver user ID
 * @param {Number} amount - Amount to transfer
 * @param {Object} options - Optional parameters
 * @returns {Promise<Object>} Transfer result
 */
export const transferBetweenWallets = async (fromUserId, toUserId, amount, options = {}) => {
  const session = options.session || (await mongoose.startSession());
  const shouldCommit = !options.session;

  try {
    if (shouldCommit) {
      session.startTransaction();
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Get both wallets
    const fromWallet = await Wallet.findOne({ user: fromUserId }).session(session);
    const toWallet = await Wallet.findOne({ user: toUserId }).session(session);

    if (!fromWallet) {
      throw new Error("Sender wallet not found");
    }

    if (!toWallet) {
      throw new Error("Receiver wallet not found");
    }

    // Validate sender wallet
    if (!fromWallet.canTransact()) {
      throw new Error(`Sender wallet is ${fromWallet.status}`);
    }

    if (!fromWallet.hasSufficientBalance(amount)) {
      throw new Error("Insufficient balance");
    }

    // Validate receiver wallet
    if (!toWallet.canTransact()) {
      throw new Error(`Receiver wallet is ${toWallet.status}`);
    }

    // Deduct from sender
    fromWallet.balance -= amount;
    fromWallet.lastTransactionAt = new Date();
    fromWallet.version += 1;
    await fromWallet.save({ session });

    // Add to receiver
    toWallet.balance += amount;
    toWallet.lastTransactionAt = new Date();
    toWallet.version += 1;
    await toWallet.save({ session });

    if (shouldCommit) {
      await session.commitTransaction();
    }

    return {
      success: true,
      fromBalance: fromWallet.balance,
      toBalance: toWallet.balance,
    };
  } catch (error) {
    if (shouldCommit) {
      await session.abortTransaction();
    }
    console.error("Transfer between wallets error:", error);
    throw error;
  } finally {
    if (shouldCommit) {
      session.endSession();
    }
  }
};

/**
 * Get wallet transaction history
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Transaction history
 */
export const getWalletHistory = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 20, type = "all" } = options;

    const wallet = await getOrCreateWallet(userId);

    // This would typically fetch from LedgerEntry model
    // For now, return basic wallet info
    return {
      walletId: wallet._id,
      currentBalance: wallet.balance,
      currency: wallet.currency,
      transactions: [], // Would be populated from LedgerEntry
    };
  } catch (error) {
    console.error("Get wallet history error:", error);
    throw error;
  }
};

/**
 * Validate wallet status
 * @param {mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<Object>} Validation result
 */
export const validateWallet = async (userId) => {
  try {
    const wallet = await getOrCreateWallet(userId);

    return {
      isValid: wallet.canTransact(),
      status: wallet.status,
      balance: wallet.balance,
      availableBalance: wallet.availableBalance,
      canTransact: wallet.canTransact(),
      frozenReason: wallet.frozenReason,
    };
  } catch (error) {
    console.error("Validate wallet error:", error);
    return {
      isValid: false,
      status: "error",
      error: error.message,
    };
  }
};

export default {
  getOrCreateWallet,
  getWalletBalance,
  addFunds,
  deductFunds,
  reserveFunds,
  releaseFunds,
  completePendingTransaction,
  freezeWallet,
  unfreezeWallet,
  hasSufficientBalance,
  transferBetweenWallets,
  getWalletHistory,
  validateWallet,
};
