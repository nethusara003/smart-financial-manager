import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "user"],
      default: "user",
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    currency: {
      type: String,
      enum: ["LKR", "USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "JPY", "CNY"],
      default: "LKR",
    },
    phone: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    notificationSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        emailNotifications: true,
        pushNotifications: false,
        budgetAlerts: true,
        billReminders: true,
        weeklyReports: true,
        transactionAlerts: true,
        goalUpdates: true,
        budgetEmailAlerts: true, // Email alerts when budget nearing limit
        transactionInactivityReminders: false, // Remind if no transactions recorded
        inactivityReminderInterval: '1day' // '2hours' or '1day'
      }
    },
    privacySettings: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        twoFactorAuth: false,
        sessionTimeout: "30",
        loginNotifications: true,
        dataSharing: false
      }
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    // Transfer-related fields
    transferPin: {
      type: String,
      select: false, // Don't include in queries by default
    },
    transferSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        requirePinAboveAmount: 1000, // Require PIN for transfers above this amount
        autoAcceptTransfers: true, // Auto-accept incoming transfers
        allowTransferRequests: true, // Allow others to request money
        notifyOnTransfer: true, // Notify on transfer activity
      }
    },
    transferLimits: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        singleTransfer: 10000, // Max single transfer amount
        dailyLimit: 50000, // Daily transfer limit
        monthlyLimit: 200000, // Monthly transfer limit
        remainingDaily: 50000, // Remaining daily limit
        remainingMonthly: 200000, // Remaining monthly limit
        lastResetDate: new Date(),
      }
    },
    transferStats: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        totalSent: 0,
        totalReceived: 0,
        transferCount: 0,
        lastTransferDate: null,
      }
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
