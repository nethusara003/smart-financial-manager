import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { guestStore } from "./controllers/userController.js";
import { sendBillReminders } from "./controllers/billController.js";
import { sendWeeklyReports } from "./utils/weeklyReportScheduler.js";
import { startGuestCleanup } from "./utils/guestCleanup.js";
import { startBudgetCheckerScheduler } from "./utils/budgetScheduler.js";
import { startTransactionInactivityScheduler } from "./utils/transactionInactivityScheduler.js";
import { startLoanReminderScheduler } from "./utils/loanReminderScheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend-local env first so worker scripts launched from repo root still pick up backend/.env.
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();
connectDB();

console.log("🔧 Worker process started");

// Start guest session cleanup (runs every hour)
startGuestCleanup(guestStore, 60);
console.log("✅ Guest cleanup scheduler started");

// Start budget checker scheduler (runs every 30 minutes)
startBudgetCheckerScheduler();

// Start transaction inactivity reminder scheduler (runs every hour)
startTransactionInactivityScheduler();

// Start loan payment reminder scheduler (runs daily at 9 AM)
startLoanReminderScheduler();

// Start bill reminder check (runs daily at 9 AM)
const startBillReminderScheduler = () => {
  const checkBills = () => {
    const now = new Date();
    // Run at 9 AM every day
    if (now.getHours() === 9 && now.getMinutes() === 0) {
      console.log("⏰ Running daily bill reminder check...");
      sendBillReminders();
    }
  };

  // Check every minute to see if it's 9 AM
  setInterval(checkBills, 60000);
  console.log("✅ Bill reminder scheduler started (runs daily at 9 AM)");
};

startBillReminderScheduler();

// Start weekly report scheduler (runs every Sunday at 8 AM)
const startWeeklyReportScheduler = () => {
  const checkWeeklyReport = () => {
    const now = new Date();
    // Run every Sunday at 8 AM
    if (now.getDay() === 0 && now.getHours() === 8 && now.getMinutes() === 0) {
      console.log("📊 Running weekly report generation...");
      sendWeeklyReports();
    }
  };

  // Check every minute to see if it's Sunday 8 AM
  setInterval(checkWeeklyReport, 60000);
  console.log("✅ Weekly report scheduler started (runs Sundays at 8 AM)");
};

startWeeklyReportScheduler();
