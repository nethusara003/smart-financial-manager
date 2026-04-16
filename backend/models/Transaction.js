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

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
