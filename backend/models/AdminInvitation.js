import mongoose from "mongoose";

const adminInvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },

    tokenHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    used: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// Optional but good practice: index for expiry-based cleanup
adminInvitationSchema.index({ expiresAt: 1 });

export default mongoose.model(
  "AdminInvitation",
  adminInvitationSchema
);
