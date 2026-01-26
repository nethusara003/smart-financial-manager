import mongoose from "mongoose";

const adminInvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Allows future expansion without schema migration
    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin",
    },

    // Hashed version of invite token (raw token is never stored)
    tokenHash: {
      type: String,
      required: true,
    },

    // Invite expiration time
    expiresAt: {
      type: Date,
      required: true,
    },

    // Prevents reuse of the same invite
    used: {
      type: Boolean,
      default: false,
    },

    // Admin who created the invite (audit trail)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for expiration-based lookups / optional TTL cleanup
adminInvitationSchema.index(
  { expiresAt: 1 }
  // Uncomment below if you want MongoDB to auto-delete expired invites
  // , { expireAfterSeconds: 0 }
);

export default mongoose.model(
  "AdminInvitation",
  adminInvitationSchema
);
