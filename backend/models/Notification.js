import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['budget_alert', 'bill_reminder', 'transaction_alert', 'weekly_report', 'goal_update', 'system'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    read: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: 'Bell'
    },
    color: {
      type: String,
      enum: ['primary', 'success', 'warning', 'danger', 'info'],
      default: 'info'
    },
    actionUrl: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// Index for efficient querying
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
