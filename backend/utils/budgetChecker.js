import Transaction from "../models/Transaction.js";
import { sendBudgetAlert } from "../Services/notificationService.js";
import { createNotification } from "../controllers/notificationController.js";

/* =========================
   CHECK USER BUDGET AND SEND ALERTS
========================= */
export const checkBudgetAlerts = async (userId, budgets) => {
  try {
    if (!budgets || budgets.length === 0) return;

    const now = new Date();
    
    // Import Budget model to track last alert sent
    const Budget = (await import('../models/Budget.js')).default;

    // Check each budget
    for (const budget of budgets) {
      let startDate, endDate;

      // Calculate date range based on period
      switch (budget.period) {
        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 7);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear() + 1, 0, 1);
          break;
        case 'monthly':
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }

      // Get all transactions for this period
      const transactions = await Transaction.find({
        user: userId,
        type: 'expense',
        category: { $regex: new RegExp(`^${budget.category}$`, 'i') },
        date: { $gte: startDate, $lt: endDate }
      });

      const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      const alertThreshold = budget.alertThreshold || 80;

      // Determine which alert to send based on percentage
      let alertLevel = null;
      let alertTitle = '';
      let alertMessage = '';
      let alertColor = 'info';

      if (percentage >= 100) {
        alertLevel = 'exceeded';
        alertTitle = `Budget Exceeded: ${budget.category}`;
        alertMessage = `You've spent $${spent.toFixed(2)} of your $${budget.limit.toFixed(2)} budget (${Math.round(percentage)}%)`;
        alertColor = 'danger';
      } else if (percentage >= 90) {
        alertLevel = '90';
        alertTitle = `Budget Warning: ${budget.category}`;
        alertMessage = `You've used ${Math.round(percentage)}% of your ${budget.category} budget`;
        alertColor = 'warning';
      } else if (percentage >= alertThreshold) {
        alertLevel = String(alertThreshold);
        alertTitle = `Budget Alert: ${budget.category}`;
        alertMessage = `You've used ${Math.round(percentage)}% of your ${budget.category} budget`;
        alertColor = 'warning';
      }

      // Send alert if threshold reached and not already sent for this level
      if (alertLevel && budget.lastAlertLevel !== alertLevel) {
        console.log(`📧 Sending budget alert for ${budget.category}: ${Math.round(percentage)}% (level: ${alertLevel})`);
        
        // Send email alert
        const emailResult = await sendBudgetAlert(userId, budget.category, spent, budget.limit, Math.round(percentage));
        console.log(`📧 Email result:`, emailResult);
        
        // Create in-app notification
        await createNotification(
          userId,
          'budget_alert',
          alertTitle,
          alertMessage,
          { category: budget.category, spent, limit: budget.limit, percentage: Math.round(percentage) },
          'AlertCircle',
          alertColor,
          '/budgets'
        );

        // Update budget to track this alert was sent
        await Budget.findByIdAndUpdate(budget._id, { 
          lastAlertLevel: alertLevel,
          lastAlertDate: new Date()
        });

        console.log(`✅ Budget alert sent for ${budget.category} at ${Math.round(percentage)}%`);
      } else if (alertLevel && budget.lastAlertLevel === alertLevel) {
        console.log(`⏭️ Skipping duplicate alert for ${budget.category} at ${Math.round(percentage)}% (already sent level: ${alertLevel})`);
      }

      // Reset alert level if we're back below the threshold (budget period might have reset or spending decreased)
      if (!alertLevel && budget.lastAlertLevel) {
        await Budget.findByIdAndUpdate(budget._id, { 
          lastAlertLevel: null,
          lastAlertDate: null
        });
        console.log(`✅ Budget alert level reset for ${budget.category}`);
      }
    }

    console.log(`✅ Budget check completed for user ${userId}`);
  } catch (error) {
    console.error('Error checking budgets:', error);
  }
};

/* =========================
   CHECK BUDGETS FROM LOCALSTORAGE DATA
   This is called when a transaction is added
========================= */
export const checkBudgetOnTransaction = async (userId) => {
  try {
    // Note: Budgets are stored in localStorage on frontend
    // For real-time alerts, we'd need to store budgets in the database
    // For now, this is a placeholder for when Budget model is created
    console.log(`Budget check triggered for user ${userId}`);
  } catch (error) {
    console.error('Error in budget check:', error);
  }
};
