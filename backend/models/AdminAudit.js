import mongoose from "mongoose";

const adminAuditSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["PROMOTE", "DEMOTE"],
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    performedByRole: {
      type: String,
      enum: ["admin", "super_admin"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminAudit", adminAuditSchema);
