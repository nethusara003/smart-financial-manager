// @ts-nocheck
import mongoose from "mongoose";

const TransferLimitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Custom limits (overrides default user limits)
    singleTransfer: {
      type: Number,
      required: true,
      min: 0,
      default: 10000,
    },
    dailyLimit: {
      type: Number,
      required: true,
      min: 0,
      default: 50000,
    },
    monthlyLimit: {
      type: Number,
      required: true,
      min: 0,
      default: 200000,
    },
    // Current usage tracking
    dailyUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    monthlyUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Last reset timestamps
    lastDailyReset: {
      type: Date,
      default: Date.now,
    },
    lastMonthlyReset: {
      type: Date,
      default: Date.now,
    },
    // Limit status
    isCustom: {
      type: Boolean,
      default: false, // true if admin set custom limits
    },
    reason: {
      type: String, // Reason for custom limits
      maxLength: 500,
    },
    // Set by admin
    setBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    setAt: {
      type: Date,
    },
    // Expiry for temporary limits
    expiresAt: {
      type: Date,
    },
    // Status
    status: {
      type: String,
      enum: ["active", "suspended", "expired"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TransferLimitSchema.index({ user: 1 });
TransferLimitSchema.index({ status: 1 });
TransferLimitSchema.index({ expiresAt: 1 });

// Virtual for remaining daily limit
TransferLimitSchema.virtual("remainingDaily").get(function () {
  return Math.max(0, this.dailyLimit - this.dailyUsed);
});

// Virtual for remaining monthly limit
TransferLimitSchema.virtual("remainingMonthly").get(function () {
  return Math.max(0, this.monthlyLimit - this.monthlyUsed);
});

// Method to check if daily reset is needed
TransferLimitSchema.methods.needsDailyReset = function () {
  const now = new Date();
  const lastReset = new Date(this.lastDailyReset);
  return (
    now.getDate() !== lastReset.getDate() ||
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  );
};

// Method to check if monthly reset is needed
TransferLimitSchema.methods.needsMonthlyReset = function () {
  const now = new Date();
  const lastReset = new Date(this.lastMonthlyReset);
  return (
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  );
};

// Method to reset daily limit
TransferLimitSchema.methods.resetDaily = async function () {
  this.dailyUsed = 0;
  this.lastDailyReset = new Date();
  await this.save();
};

// Method to reset monthly limit
TransferLimitSchema.methods.resetMonthly = async function () {
  this.monthlyUsed = 0;
  this.lastMonthlyReset = new Date();
  await this.save();
};

// Method to check if transfer amount is within limits
TransferLimitSchema.methods.canTransfer = function (amount) {
  // Check if expired
  if (this.expiresAt && new Date() > this.expiresAt) {
    return { allowed: false, reason: "Transfer limits expired" };
  }

  // Check if suspended
  if (this.status === "suspended") {
    return { allowed: false, reason: "Transfer limits suspended" };
  }

  // Check single transfer limit
  if (amount > this.singleTransfer) {
    return {
      allowed: false,
      reason: `Single transfer limit exceeded (max: ${this.singleTransfer})`,
    };
  }

  // Check daily limit
  if (this.dailyUsed + amount > this.dailyLimit) {
    return {
      allowed: false,
      reason: `Daily transfer limit exceeded (remaining: ${this.remainingDaily})`,
    };
  }

  // Check monthly limit
  if (this.monthlyUsed + amount > this.monthlyLimit) {
    return {
      allowed: false,
      reason: `Monthly transfer limit exceeded (remaining: ${this.remainingMonthly})`,
    };
  }

  return { allowed: true };
};

// Method to record transfer usage
TransferLimitSchema.methods.recordUsage = async function (amount) {
  // Reset if needed
  if (this.needsDailyReset()) {
    await this.resetDaily();
  }
  if (this.needsMonthlyReset()) {
    await this.resetMonthly();
  }

  // Add to usage
  this.dailyUsed += amount;
  this.monthlyUsed += amount;
  await this.save();
};

export default mongoose.model("TransferLimit", TransferLimitSchema);
