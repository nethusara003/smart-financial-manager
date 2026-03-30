import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import {
  requestContext,
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import financialHealthRoutes from "./routes/financialHealthRoutes.js";
import forecastingRoutes from "./routes/forecastingRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";

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
app.use(requestContext);

// ✅ ROUTES AFTER MIDDLEWARE
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/financial-health", financialHealthRoutes);
app.use("/api/forecasting", forecastingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/test", testRoutes);

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

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("ℹ️ Background schedulers run in worker.js");
});
