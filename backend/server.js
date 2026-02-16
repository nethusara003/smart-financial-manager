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
import billRoutes from "./routes/billRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import { guestStore } from "./controllers/userController.js";
import { startGuestCleanup } from "./utils/guestCleanup.js";
import { sendBillReminders } from "./controllers/billController.js";
import { sendWeeklyReports } from "./utils/weeklyReportScheduler.js";

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
app.use("/api/bills", billRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/recurring", recurringRoutes);
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start guest session cleanup (runs every hour)
  startGuestCleanup(guestStore, 60);
  console.log('✅ Guest cleanup scheduler started');

  // Start bill reminder check (runs daily at 9 AM)
  const startBillReminderScheduler = () => {
    const checkBills = () => {
      const now = new Date();
      // Run at 9 AM every day
      if (now.getHours() === 9 && now.getMinutes() === 0) {
        console.log('⏰ Running daily bill reminder check...');
        sendBillReminders();
      }
    };

    // Check every minute to see if it's 9 AM
    setInterval(checkBills, 60000);
    console.log('✅ Bill reminder scheduler started (runs daily at 9 AM)');
  };

  startBillReminderScheduler();

  // Start weekly report scheduler (runs every Sunday at 8 AM)
  const startWeeklyReportScheduler = () => {
    const checkWeeklyReport = () => {
      const now = new Date();
      // Run every Sunday at 8 AM
      if (now.getDay() === 0 && now.getHours() === 8 && now.getMinutes() === 0) {
        console.log('📊 Running weekly report generation...');
        sendWeeklyReports();
      }
    };

    // Check every minute to see if it's Sunday 8 AM
    setInterval(checkWeeklyReport, 60000);
    console.log('✅ Weekly report scheduler started (runs Sundays at 8 AM)');
  };

  startWeeklyReportScheduler();
});
