import crypto from "crypto";
import bcrypt from "bcryptjs";
import AdminInvitation from "../models/AdminInvitation.js";

export const inviteAdmin = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  // Generate raw token
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Hash token
  const tokenHash = await bcrypt.hash(rawToken, 10);

  // Expiry (30 minutes)
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await AdminInvitation.create({
    email,
    tokenHash,
    expiresAt,
    createdBy: req.user.userId,
  });

  // TODO: send email with rawToken
  // https://yourapp.com/admin/register?token=rawToken

  res.status(201).json({
    message: "Admin invitation sent",
  });
};
