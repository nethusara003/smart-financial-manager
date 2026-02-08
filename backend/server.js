import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";

dotenv.config();
connectDB();

const app = express();

console.log("🔥 THIS server.js is running 🔥");

// ✅ MIDDLEWARE FIRST
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ ROUTES AFTER MIDDLEWARE
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/goals", goalRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Smart Financial Tracker API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
