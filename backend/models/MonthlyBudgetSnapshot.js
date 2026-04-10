import mongoose from "mongoose";

const monthlyBudgetSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    savings: {
      type: Number,
      required: true,
      min: 0,
    },
    usableBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    spent: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    remaining: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["SAFE", "WARNING", "CRISIS"],
      required: true,
    },
    dailyLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    weeklyLimit: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

monthlyBudgetSnapshotSchema.index({ userId: 1, month: 1 }, { unique: true });

export default mongoose.model("MonthlyBudgetSnapshot", monthlyBudgetSnapshotSchema);
