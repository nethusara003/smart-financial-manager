import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { generateResetToken } from "../utils/generateResetToken.js";

/* =========================
   GUEST DATA STORE
========================= */
// In-memory storage for guest user data
export const guestStore = new Map();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

/* =========================
   REGISTER
========================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   LOGIN
========================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      currency: user.currency || 'LKR',
      monthlySalary: user.monthlySalary,
      savingsPercentage: user.savingsPercentage,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   FORGOT PASSWORD (PHASE 4.2)
========================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Do not reveal user existence
    if (!user) {
      return res.json({
        message: "If the email exists, a reset link will be sent",
      });
    }

    const { resetToken, hashedToken, expires } = generateResetToken();

    user.resetPasswordToken = hashedToken;
    // Ensure expires is properly typed as Date
    user.resetPasswordExpires = new Date(Number(expires));
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SFT - Smart Financial Tracker" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({
      message: "If the email exists, a reset link will be sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Email could not be sent" });
  }
};

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 🔐 Backend password validation
    const strongPassword =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword);

    if (!strongPassword) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, contain one uppercase letter and one number",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET USER PROFILE
========================= */
export const getUserProfile = async (req, res) => {
  try {
    // GUEST USER - Return guest profile
    if (req.user.isGuest) {
      const guestData = guestStore.get(req.user.id);
      
      return res.json({ 
        user: {
          _id: req.user.id,
          name: "Guest User",
          email: "guest@example.com",
          phone: "",
          bio: "",
          profilePicture: "",
          currency: guestData?.settings?.currency || "USD",
          monthlySalary: null,
          savingsPercentage: null,
          isGuest: true
        }
      });
    }

    // AUTHENTICATED USER - Database lookup
    const userId = req.user._id;

    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        profilePicture: user.profilePicture,
        currency: user.currency,
        monthlySalary: user.monthlySalary,
        savingsPercentage: user.savingsPercentage,
        notificationSettings: user.notificationSettings,
        privacySettings: user.privacySettings,
        isGuest: false
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE CURRENCY
========================= */
export const updateCurrency = async (req, res) => {
  try {
    const { currency } = req.body;
    const userId = req.user._id;

    const validCurrencies = ["LKR", "USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "JPY", "CNY"];
    
    if (!currency || !validCurrencies.includes(currency)) {
      return res.status(400).json({ message: "Invalid currency" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { currency },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Currency updated successfully",
      currency: user.currency
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE BUDGET SETTINGS
========================= */
export const updateBudgetSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { monthlySalary, savingsPercentage, currency } = req.body;

    if (monthlySalary === undefined && savingsPercentage === undefined && currency === undefined) {
      return res.status(400).json({ message: "No budget settings provided" });
    }

    const updateData = {};

    if (monthlySalary !== undefined) {
      const parsedSalary = Number(monthlySalary);
      if (!Number.isFinite(parsedSalary) || parsedSalary <= 0) {
        return res.status(400).json({ message: "Monthly salary must be a positive number" });
      }
      updateData.monthlySalary = parsedSalary;
    }

    if (savingsPercentage !== undefined) {
      const parsedSavingsPercentage = Number(savingsPercentage);
      if (!Number.isFinite(parsedSavingsPercentage) || parsedSavingsPercentage < 0 || parsedSavingsPercentage >= 100) {
        return res.status(400).json({ message: "Savings percentage must be between 0 and less than 100" });
      }
      updateData.savingsPercentage = parsedSavingsPercentage;
    }

    if (currency !== undefined) {
      const validCurrencies = ["LKR", "USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "JPY", "CNY"];
      if (!validCurrencies.includes(currency)) {
        return res.status(400).json({ message: "Invalid currency" });
      }
      updateData.currency = currency;
    }

    const existingUser = await User.findById(userId)
      .select("monthlySalary savingsPercentage");

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const effectiveSalary = updateData.monthlySalary !== undefined
      ? Number(updateData.monthlySalary)
      : Number(existingUser.monthlySalary);
    const effectiveSavingsPercentage = updateData.savingsPercentage !== undefined
      ? Number(updateData.savingsPercentage)
      : Number(existingUser.savingsPercentage);

    if (Number.isFinite(effectiveSalary) && effectiveSalary > 0 && Number.isFinite(effectiveSavingsPercentage)) {
      const projectedSavingsAmount = effectiveSalary * (effectiveSavingsPercentage / 100);
      const projectedUsableBudget = effectiveSalary - projectedSavingsAmount;

      if (projectedUsableBudget <= 0) {
        return res.status(400).json({
          message: "Usable budget must be greater than 0. Reduce savings percentage or increase salary.",
        });
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("monthlySalary savingsPercentage currency");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const savedSalary = Number(user.monthlySalary);
    const savedSavingsPercentage = Number(user.savingsPercentage);

    if (Number.isFinite(savedSalary) && savedSalary > 0 && Number.isFinite(savedSavingsPercentage)) {
      const savingsAmount = savedSalary * (savedSavingsPercentage / 100);
      const usableBudget = savedSalary - savingsAmount;

      return res.json({
        message: "Budget settings updated successfully",
        settings: {
          monthlySalary: user.monthlySalary,
          savingsPercentage: user.savingsPercentage,
          currency: user.currency,
        },
        derived: {
          savingsAmount,
          usableBudget,
        },
      });
    }

    return res.json({
      message: "Budget settings updated successfully",
      settings: {
        monthlySalary: user.monthlySalary,
        savingsPercentage: user.savingsPercentage,
        currency: user.currency,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =========================
   CHANGE PASSWORD
========================= */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE PROFILE
========================= */
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bio, profilePicture, monthlySalary, savingsPercentage } = req.body;
    const userId = req.user._id;

    // Check if email is being changed and if it's already in use
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    if (monthlySalary !== undefined) {
      const parsedSalary = Number(monthlySalary);
      if (!Number.isFinite(parsedSalary) || parsedSalary <= 0) {
        return res.status(400).json({ message: "Monthly salary must be a positive number" });
      }
      updateData.monthlySalary = parsedSalary;
    }

    if (savingsPercentage !== undefined) {
      const parsedSavingsPercentage = Number(savingsPercentage);
      if (!Number.isFinite(parsedSavingsPercentage) || parsedSavingsPercentage < 0 || parsedSavingsPercentage >= 100) {
        return res.status(400).json({ message: "Savings percentage must be between 0 and less than 100" });
      }
      updateData.savingsPercentage = parsedSavingsPercentage;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        profilePicture: user.profilePicture,
        monthlySalary: user.monthlySalary,
        savingsPercentage: user.savingsPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE NOTIFICATION SETTINGS
========================= */
export const updateNotificationSettings = async (req, res) => {
  try {
    const { notificationSettings } = req.body;
    const userId = req.user._id;

    console.log(`📧 Updating notification settings for user ${userId}`);
    console.log('Received settings:', notificationSettings);

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationSettings },
      { new: true }
    ).select('notificationSettings email');

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Notification settings updated for ${user.email}:`, user.notificationSettings);

    res.json({ 
      message: "Notification settings updated successfully",
      notificationSettings: user.notificationSettings
    });
  } catch (error) {
    console.error('❌ Error updating notification settings:', error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE PRIVACY SETTINGS
========================= */
export const updatePrivacySettings = async (req, res) => {
  try {
    const { privacySettings } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { privacySettings },
      { new: true }
    ).select('privacySettings');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Privacy settings updated successfully",
      privacySettings: user.privacySettings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   EXPORT USER DATA
========================= */
export const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Import models as needed
    const Transaction = (await import('../models/Transaction.js')).default;
    const Goal = (await import('../models/Goal.js')).default;

    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
    const transactions = await Transaction.find({ userId });
    const goals = await Goal.find({ userId });

    const exportData = {
      user: user,
      transactions: transactions,
      goals: goals,
      exportedAt: new Date().toISOString()
    };

    res.json({
      message: "Data exported successfully",
      data: exportData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE ACCOUNT
========================= */
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Import models as needed
    const Transaction = (await import('../models/Transaction.js')).default;
    const Goal = (await import('../models/Goal.js')).default;
    const Conversation = (await import('../models/Conversation.js')).default;

    // Delete all user data
    await Transaction.deleteMany({ userId  });
    await Goal.deleteMany({ userId });
    await Conversation.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GUEST LOGIN
========================= */
export const guestLogin = async (req, res) => {
  try {
    // Generate unique session ID for guest
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now

    // Initialize guest data in memory
    guestStore.set(sessionId, {
      transactions: [],
      goals: [],
      settings: {
        currency: 'USD',
        theme: 'light'
      },
      createdAt: Date.now(),
      expiresAt
    });

    // Generate JWT token for guest
    const token = jwt.sign(
      { 
        id: sessionId, 
        role: 'guest', 
        sessionId 
      },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    console.log(`🎭 Guest session created: ${sessionId}`);

    res.json({
      token,
      role: 'guest',
      name: 'Guest User',
      email: 'guest@example.com',
      _id: sessionId,
      message: 'Guest session created. Data will be available for 24 hours.'
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Failed to create guest session' });
  }
};

/* =========================
   SET/UPDATE TRANSFER PIN
========================= */
export const setTransferPin = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPin, newPin, confirmPin } = req.body;

    // Validation
    if (!newPin || !confirmPin) {
      return res.status(400).json({
        success: false,
        message: "Please provide both new PIN and confirmation"
      });
    }

    if (newPin !== confirmPin) {
      return res.status(400).json({
        success: false,
        message: "PINs do not match"
      });
    }

    // Validate PIN format (must be 6 digits)
    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        message: "PIN must be exactly 6 digits"
      });
    }

    // Get user with existing transferPin
    const user = await User.findById(userId).select("+transferPin");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // If user has existing PIN, verify current PIN
    if (user.transferPin) {
      if (!currentPin) {
        return res.status(400).json({
          success: false,
          message: "Current PIN is required to change existing PIN"
        });
      }

      const isPinValid = await bcrypt.compare(currentPin, user.transferPin);
      if (!isPinValid) {
        return res.status(401).json({
          success: false,
          message: "Current PIN is incorrect"
        });
      }
    }

    // Hash the new PIN
    const hashedPin = await bcrypt.hash(newPin, 10);

    // Update user's transfer PIN
    user.transferPin = hashedPin;
    await user.save();

    res.json({
      success: true,
      message: user.transferPin ? "Transfer PIN updated successfully" : "Transfer PIN set successfully"
    });
  } catch (error) {
    console.error("Set transfer PIN error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set transfer PIN"
    });
  }
};

/* =========================
   CHECK IF TRANSFER PIN EXISTS
========================= */
export const checkTransferPin = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("+transferPin");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      hasPin: !!user.transferPin
    });
  } catch (error) {
    console.error("Check transfer PIN error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check transfer PIN status"
    });
  }
};
