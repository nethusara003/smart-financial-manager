import crypto from "crypto";
import bcrypt from "bcryptjs";
import AdminInvitation from "../models/AdminInvitation.js";
import User from "../models/user.js";
import Transaction from "../models/Transaction.js";
import AdminAudit from "../models/AdminAudit.js";
import { sendEmail } from "../utils/sendEmail.js";

/* =========================
   GET ALL USERS
========================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* =========================
   GET USER TRANSACTIONS
========================= */
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const transactions = await Transaction.find({ user: userId })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    console.error("Get user transactions error:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

/* =========================
   INVITE ADMIN
========================= */
export const inviteAdmin = async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        message: "Only super admin can invite admins",
      });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await AdminInvitation.create({
      email,
      tokenHash,
      expiresAt,
      createdBy: req.user.id,
    });

    const inviteLink = `${process.env.APP_URL}/admin/accept-invite?token=${rawToken}`;

    await sendEmail({
      to: email,
      subject: "Admin Invitation – Smart Financial Manager",
      html: `
        <h2>You have been invited as an Admin</h2>
        <p>This invitation expires in 30 minutes.</p>
        <a href="${inviteLink}">Accept Admin Invitation</a>
      `,
    });

    res.status(201).json({ message: "Admin invitation email sent" });
  } catch (error) {
    console.error("Invite admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   PROMOTE USER → ADMIN
========================= */
export const promoteToAdmin = async (req, res) => {
  try {
    if (!["admin", "super_admin"].includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not allowed to promote users",
      });
    }

    const { userId } = req.params;

    if (req.user.id === userId) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "user") {
      return res.status(400).json({
        message: "Only users can be promoted to admin",
      });
    }

    user.role = "admin";
    await user.save();

    // ✅ AUDIT LOG
    await AdminAudit.create({
      action: "PROMOTE",
      performedBy: req.user.id,
      targetUser: user._id,
      performedByRole: req.user.role,
    });

    res.json({ message: "User promoted to admin" });
  } catch (error) {
    console.error("Promote error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   DEMOTE ADMIN → USER
========================= */
export const demoteToUser = async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        message: "Only super admin can demote admins",
      });
    }

    const { userId } = req.params;

    if (req.user.id === userId) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.role !== "admin") {
      return res.status(400).json({
        message: "Only admins can be demoted",
      });
    }

    targetUser.role = "user";
    await targetUser.save();

    // ✅ AUDIT LOG
    await AdminAudit.create({
      action: "DEMOTE",
      performedBy: req.user.id,
      targetUser: targetUser._id,
      performedByRole: req.user.role,
    });

    res.json({ message: "Admin demoted to user" });
  } catch (error) {
    console.error("Demote error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
