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
import { guestStore } from "./controllers/userController.js";
import { startGuestCleanup } from "./utils/guestCleanup.js";

dotenv.config();
connectDB();

const app = express();

console.log("🔥 THIS server.js is running 🔥");

// ✅ MIDDLEWARE FIRST
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ ROUTES AFTER MIDDLEWARE
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/goals", goalRoutes);

// Health check endpoint for deployment monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route
app.get("/", (req, res) => {
  res.send("Smart Financial Tracker API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start guest session cleanup (runs every hour)
  startGuestCleanup(guestStore, 60);
});
