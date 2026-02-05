import bcrypt from "bcryptjs";
import AdminInvitation from "../models/AdminInvitation.js";
import User from "../models/User.js";
import AdminAudit from "../models/AdminAudit.js";

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

    // Prevent re-promoting existing admins
    if (user.role !== "user") {
      return res.status(400).json({
        message: "User is already an admin",
      });
    }

    // ✅ PROMOTE USER
    user.role = "admin";
    await user.save();

    // ✅ AUDIT LOG (INVITE-BASED PROMOTION)
    await AdminAudit.create({
      action: "PROMOTE",
      performedBy: matchedInvite.createdBy, // who sent the invite
      targetUser: user._id,
      performedByRole: "super_admin", // inviteAdmin is super_admin-only
    });

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
 