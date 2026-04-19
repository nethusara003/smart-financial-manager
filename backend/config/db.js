import mongoose from "mongoose";
import User from "../models/User.js";

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/smart_financial_manager";

function resolveMongoUri() {
  const configuredUri = (process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();

  if (!configuredUri) {
    return {
      mongoUri: DEFAULT_MONGO_URI,
      usedFallback: true,
      reason: "Missing MONGO_URI/MONGODB_URI",
    };
  }

  const isPlaceholderSrv = configuredUri.toLowerCase() === "mongodb+srv://...";
  if (isPlaceholderSrv) {
    return {
      mongoUri: DEFAULT_MONGO_URI,
      usedFallback: true,
      reason: "MONGO_URI is still a placeholder (mongodb+srv://...)",
    };
  }

  return {
    mongoUri: configuredUri,
    usedFallback: false,
    reason: "",
  };
}

const connectDB = async () => {
  const { mongoUri, usedFallback, reason } = resolveMongoUri();

  if (usedFallback) {
    console.warn(`⚠️  ${reason}. Falling back to local MongoDB: ${DEFAULT_MONGO_URI}`);
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

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

    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);

    const shouldExit = process.env.NODE_ENV === "production" || process.env.CI === "true";
    if (shouldExit) {
      process.exit(1);
    }

    console.warn(
      "⚠️  Continuing in development mode without database connection. Update MONGO_URI or start local MongoDB."
    );
    return false;
  }
};

export default connectDB;
