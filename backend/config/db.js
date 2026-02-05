import mongoose from "mongoose";
import User from "../models/User.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    // 🔒 Production hardening check (AFTER connection)
    const superAdminCount = await User.countDocuments({
      role: "super_admin",
    });

    if (superAdminCount !== 1) {
      console.warn("⚠️  SECURITY WARNING ⚠️");
      console.warn(
        `Expected exactly 1 super_admin, found ${superAdminCount}. Fix immediately.`
      );
    }
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
