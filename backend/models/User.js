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
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
