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
