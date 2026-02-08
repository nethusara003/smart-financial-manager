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
    currency: {
      type: String,
      enum: ["LKR", "USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "JPY", "CNY"],
      default: "LKR",
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
