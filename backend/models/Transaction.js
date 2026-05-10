import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // Transfer-related fields
    isTransfer: {
      type: Boolean,
      default: false,
    },
    transferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transfer",
    },
    transferDirection: {
      type: String,
      enum: ["sent", "received"],
    },
    scope: {
      type: String,
      enum: ["savings", "wallet"],
      default: "savings",
      index: true,
    },
    systemManaged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Primary compound index: covers transaction lists (desc) and forecast (asc)
transactionSchema.index({ user: 1, date: -1 });
// Covers health-score queries that filter by type within a date range
transactionSchema.index({ user: 1, type: 1, date: -1 });
// Admin analytics: transactions sorted by creation time
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
