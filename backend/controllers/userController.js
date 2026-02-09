import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { generateResetToken } from "../utils/generateResetToken.js";

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
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      currency: user.currency || 'LKR',
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
        notificationSettings: user.notificationSettings,
        privacySettings: user.privacySettings
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
    const { name, email, phone, bio, profilePicture } = req.body;
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
        profilePicture: user.profilePicture
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

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationSettings },
      { new: true }
    ).select('notificationSettings');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Notification settings updated successfully",
      notificationSettings: user.notificationSettings
    });
  } catch (error) {
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
