import bcrypt from "bcryptjs";
import AdminInvitation from "../models/AdminInvitation.js";
import User from "../models/user.js";

export const acceptAdminInvite = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Get all valid invitations
    const invites = await AdminInvitation.find({
      used: false,
      expiresAt: { $gt: new Date() },
    });

    let matchedInvite = null;

    for (const invite of invites) {
      const match = await bcrypt.compare(token, invite.tokenHash);
      if (match) {
        matchedInvite = invite;
        break;
      }
    }

    if (!matchedInvite) {
      return res.status(400).json({ message: "Invalid or expired invitation" });
    }

    // Find user
    const user = await User.findOne({ email: matchedInvite.email });

    if (!user) {
      return res.status(404).json({
        message: "User must register before accepting admin invite",
      });
    }

    // Promote user
    user.role = "admin";
    await user.save();

    // Mark invite used
    matchedInvite.used = true;
    await matchedInvite.save();

    return res.json({
      message: "Admin role granted",
      userId: user._id,
    });
  } catch (err) {
    console.error("Accept admin invite error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
