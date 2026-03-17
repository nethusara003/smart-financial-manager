// @ts-nocheck
import mongoose from "mongoose";
import Transfer from "../models/Transfer.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import TransferLimit from "../models/TransferLimit.js";
import { createNotification } from "./notificationController.js";
import bcrypt from "bcryptjs";

/**
 * @desc    Search users for transfer
 * @route   GET /api/transfers/search-users
 * @access  Private
 */
export const searchUsers = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }

    // Search users by email, name (excluding current user)
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    })
      .select("name email profilePicture")
      .limit(Math.min(parseInt(limit), 50));

    // Mask email for privacy (show only first 2 chars and domain)
    const maskedUsers = users.map((user) => ({
      userId: user._id,
      name: user.name,
      email: maskEmail(user.email),
      profilePicture: user.profilePicture,
    }));

    res.json({ users: maskedUsers });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Error searching users" });
  }
};

/**
 * @desc    Validate receiver for transfer
 * @route   POST /api/transfers/validate-receiver
 * @access  Private
 */
export const validateReceiver = async (req, res) => {
  try {
    const { receiverIdentifier } = req.body;
    const currentUserId = req.user._id;

    if (!receiverIdentifier) {
      return res.status(400).json({ message: "Receiver identifier is required" });
    }

    // Find receiver by email or userId
    let receiver = await User.findOne({
      $or: [
        { email: receiverIdentifier },
        { _id: mongoose.Types.ObjectId.isValid(receiverIdentifier) ? receiverIdentifier : null },
      ],
    }).select("name email profilePicture");

    if (!receiver) {
      return res.json({
        isValid: false,
        message: "User not found",
        canReceiveTransfers: false,
      });
    }

    // Check if trying to send to self
    if (receiver._id.toString() === currentUserId.toString()) {
      return res.json({
        isValid: false,
        message: "Cannot transfer to yourself",
        canReceiveTransfers: false,
      });
    }

    res.json({
      isValid: true,
      receiver: {
        userId: receiver._id,
        name: receiver.name,
        email: maskEmail(receiver.email),
        profilePicture: receiver.profilePicture,
      },
      canReceiveTransfers: true,
      message: "Receiver is valid",
    });
  } catch (error) {
    console.error("Validate receiver error:", error);
    res.status(500).json({ message: "Error validating receiver" });
  }
};

/**
 * @desc    Get transfer limits for current user
 * @route   GET /api/transfers/my-limits
 * @access  Private
 */
export const getMyLimits = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get or create transfer limits
    let limits = await TransferLimit.findOne({ user: userId });

    if (!limits) {
      // Create default limits
      limits = await TransferLimit.create({
        user: userId,
        singleTransfer: user.transferLimits?.singleTransfer || 500000,
        dailyLimit: user.transferLimits?.dailyLimit || 50000,
        monthlyLimit: user.transferLimits?.monthlyLimit || 200000,
      });
    }

    // Check if reset is needed
    if (limits.needsDailyReset()) {
      await limits.resetDaily();
    }
    if (limits.needsMonthlyReset()) {
      await limits.resetMonthly();
    }

    res.json({
      limits: {
        singleTransfer: limits.singleTransfer,
        daily: limits.dailyLimit,
        monthly: limits.monthlyLimit,
      },
      currentUsage: {
        today: limits.dailyUsed,
        thisMonth: limits.monthlyUsed,
      },
      remaining: {
        today: limits.remainingDaily,
        thisMonth: limits.remainingMonthly,
      },
      resetDates: {
        daily: limits.lastDailyReset,
        monthly: limits.lastMonthlyReset,
      },
    });
  } catch (error) {
    console.error("Get limits error:", error);
    res.status(500).json({ message: "Error fetching transfer limits" });
  }
};

/**
 * @desc    Check if transfer is feasible
 * @route   POST /api/transfers/check-feasibility
 * @access  Private
 */
export const checkFeasibility = async (req, res) => {
  try {
    const { receiverId, amount } = req.body;
    const senderId = req.user._id;
    const reasons = [];

    if (!receiverId || !amount) {
      return res.status(400).json({ message: "Receiver ID and amount are required" });
    }

    if (amount <= 0) {
      reasons.push({
        type: "amount",
        message: "Amount must be greater than 0",
        severity: "error",
      });
    }

    // Check receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      reasons.push({
        type: "receiver",
        message: "Receiver not found",
        severity: "error",
      });
    }

    // Calculate sender balance
    const senderBalance = await calculateUserBalance(senderId);
    if (senderBalance < amount) {
      reasons.push({
        type: "balance",
        message: `Insufficient balance. Available: $${senderBalance.toFixed(2)}`,
        severity: "error",
      });
    }

    // Check transfer limits
    const limits = await TransferLimit.findOne({ user: senderId });
    if (limits) {
      // Reset if needed
      if (limits.needsDailyReset()) await limits.resetDaily();
      if (limits.needsMonthlyReset()) await limits.resetMonthly();

      const limitCheck = limits.canTransfer(amount);
      if (!limitCheck.allowed) {
        reasons.push({
          type: "limit",
          message: limitCheck.reason,
          severity: "error",
        });
      }
    }

    const canTransfer = reasons.filter((r) => r.severity === "error").length === 0;

    res.json({
      canTransfer,
      reasons,
      suggestions: canTransfer
        ? []
        : [
            senderBalance < amount ? "Add funds to your account" : null,
            "Try a smaller amount",
            "Check your daily/monthly limits",
          ].filter(Boolean),
    });
  } catch (error) {
    console.error("Check feasibility error:", error);
    res.status(500).json({ message: "Error checking transfer feasibility" });
  }
};

/**
 * @desc    Initiate a transfer
 * @route   POST /api/transfers/initiate
 * @access  Private
 */
export const initiateTransfer = async (req, res) => {
  try {
    const { receiverIdentifier, amount, description, transferPin } = req.body;
    const senderId = req.user._id;

    // Validation
    if (!receiverIdentifier || !amount) {
      return res.status(400).json({ message: "Receiver and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Find receiver
    const receiver = await User.findOne({
      $or: [
        { email: receiverIdentifier },
        { _id: mongoose.Types.ObjectId.isValid(receiverIdentifier) ? receiverIdentifier : null },
      ],
    });

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Check not sending to self
    if (receiver._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: "Cannot transfer to yourself" });
    }

    // Get sender info
    const sender = await User.findById(senderId);

    // Check balance
    const senderBalance = await calculateUserBalance(senderId);
    if (senderBalance < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
        available: senderBalance,
        required: amount,
      });
    }

    // Check transfer limits
    const limits = await TransferLimit.findOne({ user: senderId });
    if (limits) {
      if (limits.needsDailyReset()) await limits.resetDaily();
      if (limits.needsMonthlyReset()) await limits.resetMonthly();

      const limitCheck = limits.canTransfer(amount);
      if (!limitCheck.allowed) {
        return res.status(403).json({ message: limitCheck.reason });
      }
    }

    // Check if PIN required (for amounts above threshold)
    const pinThreshold = sender.transferSettings?.requirePinAboveAmount || 1000;
    if (amount > pinThreshold) {
      if (!transferPin) {
        return res.status(400).json({
          message: "Transfer PIN required for this amount",
          requiresPin: true,
        });
      }

      // Verify PIN
      const userWithPin = await User.findById(senderId).select("+transferPin");
      if (!userWithPin.transferPin) {
        return res.status(400).json({
          message: "Please set up a transfer PIN first",
          requiresSetup: true,
        });
      }

      const isPinValid = await bcrypt.compare(transferPin, userWithPin.transferPin);
      if (!isPinValid) {
        return res.status(401).json({ message: "Invalid transfer PIN" });
      }
    }

    // Calculate fee (if applicable)
    const fee = 0; // No fee for now
    const netAmount = amount - fee;

    // Create transfer record
    const transfer = await Transfer.create({
      sender: {
        userId: sender._id,
        userName: sender.name,
        userEmail: sender.email,
      },
      receiver: {
        userId: receiver._id,
        userName: receiver.name,
        userEmail: receiver.email,
      },
      amount,
      currency: sender.currency || "USD",
      fee,
      netAmount,
      status: "initiated",
      description: description || "",
      senderBalanceAtTransfer: senderBalance,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      deviceType: "web",
    });

    // Automatically process the transfer
    await processTransferInternal(transfer._id);

    // Fetch updated transfer
    const updatedTransfer = await Transfer.findById(transfer._id);

    res.status(201).json({
      transferId: updatedTransfer._id,
      status: updatedTransfer.status,
      sender: updatedTransfer.sender,
      receiver: updatedTransfer.receiver,
      amount: updatedTransfer.amount,
      fee: updatedTransfer.fee,
      netAmount: updatedTransfer.netAmount,
      estimatedCompletion: new Date(),
      message: "Transfer completed successfully",
    });
  } catch (error) {
    console.error("Initiate transfer error:", error);
    res.status(500).json({ message: error.message || "Error initiating transfer" });
  }
};

/**
 * @desc    Process a transfer (internal function)
 * @access  Private (called internally)
 */
const processTransferInternal = async (transferId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transfer = await Transfer.findById(transferId).session(session);

    if (!transfer) {
      throw new Error("Transfer not found");
    }

    if (transfer.status !== "initiated") {
      throw new Error("Transfer already processed");
    }

    // Update transfer status
    transfer.status = "processing";
    await transfer.save({ session });

    // Verify sender balance again
    const senderBalance = await calculateUserBalance(transfer.sender.userId);
    if (senderBalance < transfer.amount) {
      transfer.status = "failed";
      transfer.failureReason = "Insufficient balance at processing time";
      await transfer.save({ session });
      await session.commitTransaction();
      return;
    }

    // Update sender's wallet (deduct funds)
    const senderWallet = await Wallet.findOne({ user: transfer.sender.userId }).session(session);
    if (!senderWallet) {
      throw new Error("Sender wallet not found");
    }
    senderWallet.balance -= transfer.amount;
    senderWallet.lastTransactionAt = new Date();
    await senderWallet.save({ session });

    // Update receiver's wallet (add funds)
    let receiverWallet = await Wallet.findOne({ user: transfer.receiver.userId }).session(session);
    if (!receiverWallet) {
      // Create wallet for receiver if doesn't exist
      receiverWallet = await Wallet.create(
        [
          {
            user: transfer.receiver.userId,
            balance: transfer.netAmount,
            currency: "USD",
            status: "active",
            lastTransactionAt: new Date(),
          },
        ],
        { session }
      );
      receiverWallet = receiverWallet[0];
    } else {
      receiverWallet.balance += transfer.netAmount;
      receiverWallet.lastTransactionAt = new Date();
      await receiverWallet.save({ session });
    }

    // Create sender transaction (debit)
    const senderTransaction = await Transaction.create(
      [
        {
          user: transfer.sender.userId,
          type: "expense",
          category: "Transfer",
          amount: transfer.amount,
          note: `Transfer to ${transfer.receiver.userName}: ${transfer.description}`,
          date: new Date(),
          isTransfer: true,
          transferId: transfer._id,
          transferDirection: "sent",
        },
      ],
      { session }
    );

    // Create receiver transaction (credit)
    const receiverTransaction = await Transaction.create(
      [
        {
          user: transfer.receiver.userId,
          type: "income",
          category: "Transfer",
          amount: transfer.netAmount,
          note: `Transfer from ${transfer.sender.userName}: ${transfer.description}`,
          date: new Date(),
          isTransfer: true,
          transferId: transfer._id,
          transferDirection: "received",
        },
      ],
      { session }
    );

    // Update transfer with transaction references
    transfer.senderTransactionId = senderTransaction[0]._id;
    transfer.receiverTransactionId = receiverTransaction[0]._id;
    transfer.status = "completed";
    transfer.processedAt = new Date();
    await transfer.save({ session });

    // Update user transfer stats
    await User.findByIdAndUpdate(
      transfer.sender.userId,
      {
        $inc: {
          "transferStats.totalSent": transfer.amount,
          "transferStats.transferCount": 1,
        },
        $set: {
          "transferStats.lastTransferDate": new Date(),
        },
      },
      { session }
    );

    await User.findByIdAndUpdate(
      transfer.receiver.userId,
      {
        $inc: {
          "transferStats.totalReceived": transfer.netAmount,
        },
      },
      { session }
    );

    // Update transfer limits
    const limits = await TransferLimit.findOne({ user: transfer.sender.userId }).session(session);
    if (limits) {
      await limits.recordUsage(transfer.amount);
    }

    // Commit transaction
    await session.commitTransaction();

    // Send notifications (outside transaction)
    await sendTransferNotifications(transfer);
  } catch (error) {
    await session.abortTransaction();
    console.error("Process transfer error:", error);

    // Update transfer as failed
    await Transfer.findByIdAndUpdate(transferId, {
      status: "failed",
      failureReason: error.message,
      errorCode: "PROCESSING_ERROR",
    });

    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Process a transfer manually
 * @route   POST /api/transfers/:transferId/process
 * @access  Private (Admin or System)
 */
export const processTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;

    await processTransferInternal(transferId);

    const transfer = await Transfer.findById(transferId);

    res.json({
      transferId: transfer._id,
      status: transfer.status,
      senderTransactionId: transfer.senderTransactionId,
      receiverTransactionId: transfer.receiverTransactionId,
      completedAt: transfer.processedAt,
    });
  } catch (error) {
    console.error("Process transfer error:", error);
    res.status(500).json({ message: error.message || "Error processing transfer" });
  }
};

/**
 * @desc    Get transfer details
 * @route   GET /api/transfers/:transferId
 * @access  Private (sender or receiver only)
 */
export const getTransferDetails = async (req, res) => {
  try {
    const { transferId } = req.params;
    const userId = req.user._id;

    const transfer = await Transfer.findById(transferId)
      .populate("senderTransactionId")
      .populate("receiverTransactionId");

    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }

    // Check authorization
    const isSender = transfer.sender.userId.toString() === userId.toString();
    const isReceiver = transfer.receiver.userId.toString() === userId.toString();

    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: "Unauthorized to view this transfer" });
    }

    res.json({ transfer });
  } catch (error) {
    console.error("Get transfer details error:", error);
    res.status(500).json({ message: "Error fetching transfer details" });
  }
};

/**
 * @desc    Get my transfers
 * @route   GET /api/transfers/my-transfers
 * @access  Private
 */
export const getMyTransfers = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      type = "all",
      status = "all",
      page = 1,
      limit = 20,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    // Build query
    let query = {};

    // Filter by type (sent/received/all)
    if (type === "sent") {
      query["sender.userId"] = userId;
    } else if (type === "received") {
      query["receiver.userId"] = userId;
    } else {
      // All transfers
      query.$or = [{ "sender.userId": userId }, { "receiver.userId": userId }];
    }

    // Filter by status
    if (status !== "all") {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Sorting
    const sortField = sortBy === "amount" ? "amount" : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const transfers = await Transfer.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum);

    const totalTransfers = await Transfer.countDocuments(query);
    const totalPages = Math.ceil(totalTransfers / limitNum);

    // Calculate summary
    const sentTransfers = await Transfer.find({
      "sender.userId": userId,
      status: "completed",
    });
    const receivedTransfers = await Transfer.find({
      "receiver.userId": userId,
      status: "completed",
    });

    const totalSent = sentTransfers.reduce((sum, t) => sum + t.amount, 0);
    const totalReceived = receivedTransfers.reduce((sum, t) => sum + t.netAmount, 0);
    const totalFees = sentTransfers.reduce((sum, t) => sum + t.fee, 0);
    const transferCount = sentTransfers.length + receivedTransfers.length;

    res.json({
      transfers,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalTransfers,
        hasMore: pageNum < totalPages,
      },
      stats: {
        totalSent,
        totalReceived,
        totalFees,
        transferCount,
      },
      summary: {
        totalSent,
        totalReceived,
        totalFees,
        transferCount,
      },
    });
  } catch (error) {
    console.error("Get my transfers error:", error);
    res.status(500).json({ message: "Error fetching transfers" });
  }
};

/**
 * @desc    Cancel a transfer
 * @route   POST /api/transfers/:transferId/cancel
 * @access  Private (sender only)
 */
export const cancelTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const transfer = await Transfer.findById(transferId);

    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }

    // Check authorization
    if (transfer.sender.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only sender can cancel transfer" });
    }

    // Check if cancellable
    if (!transfer.canBeCancelled()) {
      return res.status(400).json({
        message: "Transfer cannot be cancelled",
        status: transfer.status,
      });
    }

    // Update transfer status
    transfer.status = "cancelled";
    transfer.failureReason = reason || "Cancelled by sender";
    await transfer.save();

    res.json({
      message: "Transfer cancelled successfully",
      transferId: transfer._id,
      refundAmount: transfer.fee,
    });
  } catch (error) {
    console.error("Cancel transfer error:", error);
    res.status(500).json({ message: "Error cancelling transfer" });
  }
};

/**
 * @desc    Reverse a transfer
 * @route   POST /api/transfers/:transferId/reverse
 * @access  Private (sender or admin)
 */
export const reverseTransfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { transferId } = req.params;
    const { reason, transferPin } = req.body;
    const userId = req.user._id;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required for reversal" });
    }

    const transfer = await Transfer.findById(transferId).session(session);

    if (!transfer) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Transfer not found" });
    }

    // Check authorization
    const isSender = transfer.sender.userId.toString() === userId.toString();
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";

    if (!isSender && !isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Unauthorized to reverse this transfer" });
    }

    // Check if reversible
    if (!transfer.canBeReversed()) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Transfer cannot be reversed",
        reason: transfer.status !== "completed" ? "Transfer not completed" : "Reversal deadline passed",
      });
    }

    // Verify PIN for user reversal
    if (isSender) {
      if (!transferPin) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Transfer PIN required for reversal" });
      }

      const userWithPin = await User.findById(userId).select("+transferPin");
      const isPinValid = await bcrypt.compare(transferPin, userWithPin.transferPin);

      if (!isPinValid) {
        await session.abortTransaction();
        return res.status(401).json({ message: "Invalid transfer PIN" });
      }
    }

    // Update wallets (reverse the transfer)
    // Return money to sender
    const senderWallet = await Wallet.findOne({ user: transfer.sender.userId }).session(session);
    if (senderWallet) {
      senderWallet.balance += transfer.amount;
      senderWallet.lastTransactionAt = new Date();
      await senderWallet.save({ session });
    }

    // Deduct money from receiver
    const receiverWallet = await Wallet.findOne({ user: transfer.receiver.userId }).session(session);
    if (receiverWallet) {
      receiverWallet.balance -= transfer.netAmount;
      receiverWallet.lastTransactionAt = new Date();
      await receiverWallet.save({ session });
    }

    // Create reversal transactions
    await Transaction.create(
      [
        {
          user: transfer.sender.userId,
          type: "income",
          category: "Transfer Reversal",
          amount: transfer.amount,
          note: `Reversal of transfer to ${transfer.receiver.userName}: ${reason}`,
          date: new Date(),
          isTransfer: true,
          transferId: transfer._id,
          transferDirection: "received",
        },
      ],
      { session }
    );

    await Transaction.create(
      [
        {
          user: transfer.receiver.userId,
          type: "expense",
          category: "Transfer Reversal",
          amount: transfer.netAmount,
          note: `Reversal of transfer from ${transfer.sender.userName}: ${reason}`,
          date: new Date(),
          isTransfer: true,
          transferId: transfer._id,
          transferDirection: "sent",
        },
      ],
      { session }
    );

    // Update transfer status
    transfer.status = "reversed";
    transfer.reversedAt = new Date();
    transfer.reversalReason = reason;
    transfer.reversalInitiatedBy = userId;
    await transfer.save({ session });

    await session.commitTransaction();

    res.json({
      message: "Transfer reversed successfully",
      transferId: transfer._id,
      newTransferStatus: "reversed",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Reverse transfer error:", error);
    res.status(500).json({ message: "Error reversing transfer" });
  } finally {
    session.endSession();
  }
};

// ========== Helper Functions ==========

/**
 * Calculate user's current balance from wallet
 */
const calculateUserBalance = async (userId) => {
  // Get balance from wallet instead of calculating from transactions
  const wallet = await Wallet.findOne({ user: userId });
  
  if (!wallet) {
    // If wallet doesn't exist, create one with 0 balance
    const newWallet = await Wallet.create({
      user: userId,
      balance: 0,
      currency: "USD",
      status: "active",
    });
    return newWallet.balance;
  }
  
  return wallet.availableBalance || wallet.balance;
};

/**
 * Mask email for privacy
 */
const maskEmail = (email) => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  const maskedLocal = local.charAt(0) + "***" + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
};

/**
 * Send transfer notifications
 */
const sendTransferNotifications = async (transfer) => {
  try {
    // Notification for sender
    await createNotification({
      userId: transfer.sender.userId,
      type: "transfer_sent",
      title: "Transfer Completed",
      message: `You sent $${transfer.amount.toFixed(2)} to ${transfer.receiver.userName}`,
      data: { transferId: transfer._id },
    });

    // Notification for receiver
    await createNotification({
      userId: transfer.receiver.userId,
      type: "transfer_received",
      title: "Money Received",
      message: `You received $${transfer.netAmount.toFixed(2)} from ${transfer.sender.userName}`,
      data: { transferId: transfer._id },
    });
  } catch (error) {
    console.error("Send notifications error:", error);
    // Don't throw - notifications are non-critical
  }
};
