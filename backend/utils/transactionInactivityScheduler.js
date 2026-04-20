import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { sendTransactionInactivityReminder } from "../Services/notificationService.js";

const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const DEFAULT_INACTIVITY_INTERVAL = "1day";
const INACTIVITY_INTERVAL_MS_MAP = Object.freeze({
  "2hours": 2 * HOUR_IN_MS,
  "4hours": 4 * HOUR_IN_MS,
  "6hours": 6 * HOUR_IN_MS,
  "12hours": 12 * HOUR_IN_MS,
  "24hours": DAY_IN_MS,
  "1day": DAY_IN_MS,
  "2days": 2 * DAY_IN_MS,
});

const normalizeInactivityInterval = (value) => {
  if (typeof value !== "string") {
    return DEFAULT_INACTIVITY_INTERVAL;
  }

  const normalized = value.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(INACTIVITY_INTERVAL_MS_MAP, normalized)
    ? normalized
    : DEFAULT_INACTIVITY_INTERVAL;
};

/* =========================
   CHECK TRANSACTION INACTIVITY AND SEND REMINDERS
========================= */
export const checkTransactionInactivity = async () => {
  try {
    console.log('🔍 Checking transaction inactivity for all users...');
    
    // Get all active users (not guest users)
    const users = await User.find({ 
      role: { $in: ['user', 'admin', 'super_admin'] },
      email: { $exists: true, $ne: '' }
    });

    console.log(`Found ${users.length} users to check for inactivity`);

    const now = new Date();
    const nowMs = now.getTime();
    let remindersSent = 0;

    for (const user of users) {
      try {
        const notificationSettings = user.notificationSettings || {};
        
        // Skip if user has disabled transaction inactivity reminders
        if (!notificationSettings.transactionInactivityReminders) {
          continue;
        }

        const interval = normalizeInactivityInterval(notificationSettings.inactivityReminderInterval);
        const intervalMs = INACTIVITY_INTERVAL_MS_MAP[interval] || INACTIVITY_INTERVAL_MS_MAP[DEFAULT_INACTIVITY_INTERVAL];
        
        // Calculate inactivity threshold
        const thresholdDate = new Date(nowMs - intervalMs);

        // Find the last transaction for this user
        const lastTransaction = await Transaction.findOne({
          user: user._id
        }).sort({ date: -1, createdAt: -1 });

        // If no transactions exist, skip (don't remind on first time)
        if (!lastTransaction) {
          console.log(`⏭️  User ${user.email} has no transactions yet - skipping reminder`);
          continue;
        }

        const lastTransactionDate = lastTransaction.date || lastTransaction.createdAt;
        const lastTransactionMs = new Date(lastTransactionDate).getTime();

        if (!Number.isFinite(lastTransactionMs)) {
          console.log(`⏭️  User ${user.email} has invalid transaction timestamp - skipping reminder`);
          continue;
        }

        const lastReminderMs = user.lastTransactionInactivityReminderSentAt
          ? new Date(user.lastTransactionInactivityReminderSentAt).getTime()
          : null;

        // Throttle reminders so users do not get spammed each hourly scheduler cycle.
        const wasRecentlyReminded =
          Number.isFinite(lastReminderMs) &&
          lastReminderMs > lastTransactionMs &&
          nowMs - lastReminderMs < intervalMs;

        if (wasRecentlyReminded) {
          console.log(`⏭️  User ${user.email} already reminded within ${interval}`);
          continue;
        }

        // Check if last transaction is older than threshold
        if (lastTransactionMs < thresholdDate.getTime()) {
          console.log(`📧 User ${user.email} hasn't recorded a transaction since ${new Date(lastTransactionMs).toISOString()} (threshold: ${interval})`);
          
          // Send reminder
          const result = await sendTransactionInactivityReminder(user._id, interval, new Date(lastTransactionMs));
          
          if (result.success) {
            remindersSent++;
            user.lastTransactionInactivityReminderSentAt = now;
            await user.save();
            console.log(`✅ Sent reminder to ${user.email}`);
          } else {
            console.log(`❌ Failed to send reminder to ${user.email}:`, result.reason || result.error);
          }
        } else {
          console.log(`✓ User ${user.email} is active (last transaction: ${new Date(lastTransactionMs).toISOString()})`);
        }
      } catch (userError) {
        console.error(`Error checking user ${user.email}:`, userError);
        continue;
      }
    }

    console.log(`✅ Transaction inactivity check completed. Sent ${remindersSent} reminders.`);
    return { success: true, remindersSent };
  } catch (error) {
    console.error('❌ Error in transaction inactivity check:', error);
    return { success: false, error: error.message };
  }
};

/* =========================
   START TRANSACTION INACTIVITY SCHEDULER
========================= */
export const startTransactionInactivityScheduler = () => {
  console.log('🚀 Starting transaction inactivity reminder scheduler (runs every hour)');
  
  // Run immediately on startup
  checkTransactionInactivity();
  
  // Then run every hour
  setInterval(() => {
    checkTransactionInactivity();
  }, HOUR_IN_MS);
};
