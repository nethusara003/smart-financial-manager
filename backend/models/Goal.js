import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["savings", "investment", "debt", "purchase", "education", "travel", "emergency", "retirement", "other"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "cancelled"],
      default: "active",
    },
    color: {
      type: String,
      enum: ["primary", "secondary", "success", "warning", "danger"],
      default: "primary",
    },
    icon: {
      type: String,
      default: "PiggyBank",
    },
  },
  {
    timestamps: true,
  }
);

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;