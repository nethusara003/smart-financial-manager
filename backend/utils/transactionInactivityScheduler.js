import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { sendTransactionInactivityReminder } from "../Services/notificationService.js";

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
    let remindersSent = 0;

    for (const user of users) {
      try {
        const notificationSettings = user.notificationSettings || {};
        
        // Skip if user has disabled transaction inactivity reminders
        if (!notificationSettings.transactionInactivityReminders) {
          continue;
        }

        const interval = notificationSettings.inactivityReminderInterval || '1day';
        
        // Calculate inactivity threshold
        let thresholdDate = new Date(now);
        if (interval === '2hours') {
          thresholdDate.setHours(thresholdDate.getHours() - 2);
        } else {
          // Default to 1 day
          thresholdDate.setDate(thresholdDate.getDate() - 1);
        }

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

        // Check if last transaction is older than threshold
        if (lastTransactionDate < thresholdDate) {
          console.log(`📧 User ${user.email} hasn't recorded a transaction since ${lastTransactionDate.toISOString()} (threshold: ${interval})`);
          
          // Send reminder
          const result = await sendTransactionInactivityReminder(user._id, interval, lastTransactionDate);
          
          if (result.success) {
            remindersSent++;
            console.log(`✅ Sent reminder to ${user.email}`);
          } else {
            console.log(`❌ Failed to send reminder to ${user.email}:`, result.reason || result.error);
          }
        } else {
          console.log(`✓ User ${user.email} is active (last transaction: ${lastTransactionDate.toISOString()})`);
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
  // Run every hour to check for inactivity
  const HOUR_IN_MS = 60 * 60 * 1000;
  
  console.log('🚀 Starting transaction inactivity reminder scheduler (runs every hour)');
  
  // Run immediately on startup
  checkTransactionInactivity();
  
  // Then run every hour
  setInterval(() => {
    checkTransactionInactivity();
  }, HOUR_IN_MS);
};
