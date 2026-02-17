import User from "../models/User.js";
import Budget from "../models/Budget.js";
import { checkBudgetAlerts } from "./budgetChecker.js";

/* =========================
   CHECK ALL USERS' BUDGETS
========================= */
export const checkAllUsersBudgets = async () => {
  try {
    console.log('🔍 Checking budgets for all users...');
    
    // Get all active users
    const users = await User.find({ 
      role: { $in: ['user', 'admin', 'super_admin'] },
      email: { $exists: true, $ne: '' }
    });

    console.log(`Found ${users.length} users to check budgets`);

    let alertsSent = 0;

    for (const user of users) {
      try {
        const notificationSettings = user.notificationSettings || {};
        
        // Skip if user has disabled budget email alerts
        if (!notificationSettings.budgetEmailAlerts || !notificationSettings.emailNotifications) {
          console.log(`⏭️  Skipping user ${user.email} (budget email alerts disabled)`);
          continue;
        }

        // Get all active budgets for this user
        const budgets = await Budget.find({ 
          userId: user._id, 
          active: true 
        });

        if (budgets.length === 0) {
          console.log(`⏭️  User ${user.email} has no active budgets`);
          continue;
        }

        console.log(`📊 Checking ${budgets.length} budget(s) for user ${user.email}`);
        
        // Check budgets and send alerts
        await checkBudgetAlerts(user._id, budgets);
        alertsSent++;
        
      } catch (userError) {
        console.error(`Error checking budgets for user ${user.email}:`, userError);
        continue;
      }
    }

    console.log(`✅ Budget check completed for ${alertsSent} users`);
    return { success: true, usersChecked: alertsSent };
  } catch (error) {
    console.error('❌ Error in budget check:', error);
    return { success: false, error: error.message };
  }
};

/* =========================
   START BUDGET CHECKER SCHEDULER
========================= */
export const startBudgetCheckerScheduler = () => {
  // Run every 30 minutes to check budgets
  const INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  console.log('🚀 Starting budget checker scheduler (runs every 30 minutes)');
  
  // Run immediately on startup
  checkAllUsersBudgets();
  
  // Then run every 30 minutes
  setInterval(() => {
    checkAllUsersBudgets();
  }, INTERVAL);
};
