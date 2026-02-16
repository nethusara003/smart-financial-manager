import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    limit: {
      type: Number,
      required: true,
      min: 0
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      default: 'monthly'
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100
    },
    icon: {
      type: String,
      default: 'DollarSign'
    },
    color: {
      type: String,
      default: 'cyan'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    active: {
      type: Boolean,
      default: true
    },
    lastAlertLevel: {
      type: String,
      default: null,
      enum: [null, '80', '85', '90', '95', 'exceeded']
    },
    lastAlertDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Index for efficient querying
budgetSchema.index({ userId: 1, category: 1, period: 1 });

export default mongoose.model("Budget", budgetSchema);
