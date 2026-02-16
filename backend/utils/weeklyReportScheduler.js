import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { sendWeeklyReport } from "../Services/notificationService.js";
import { createNotification } from "../controllers/notificationController.js";

/* =========================
   GENERATE WEEKLY REPORT DATA
========================= */
const getWeeklyData = async (userId) => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: weekAgo, $lte: today }
  });

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get top spending categories
  const categoryTotals = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const topCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  return {
    weekStart: weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weekEnd: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    income,
    expenses,
    transactionCount: transactions.length,
    topCategories,
    savingsRate
  };
};

/* =========================
   SEND WEEKLY REPORTS TO ALL USERS
========================= */
export const sendWeeklyReports = async () => {
  try {
    console.log('⏰ Starting weekly report generation...');

    const users = await User.find({ 
      role: { $ne: 'guest' },
      'notificationSettings.weeklyReports': true,
      'notificationSettings.emailNotifications': true
    });

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        const weekData = await getWeeklyData(user._id);

        // Only send if there were transactions
        if (weekData.transactionCount > 0) {
          // Send email report
          await sendWeeklyReport(user._id, weekData);

          // Create in-app notification
          await createNotification(
            user._id,
            'weekly_report',
            'Weekly Financial Summary',
            `${weekData.income > 0 ? `Income: $${weekData.income.toFixed(2)}` : ''} ${weekData.expenses > 0 ? `| Expenses: $${weekData.expenses.toFixed(2)}` : ''}`,
            weekData,
            'BarChart',
            'info',
            '/analytics'
          );

          successCount++;
          console.log(`✅ Weekly report sent to ${user.email}`);
        }
      } catch (error) {
        console.error(`❌ Failed to send report to ${user.email}:`, error.message);
        failCount++;
      }
    }

    console.log(`✅ Weekly reports completed: ${successCount} sent, ${failCount} failed`);
  } catch (error) {
    console.error('Error sending weekly reports:', error);
  }
};

/* =========================
   MANUAL TRIGGER (FOR TESTING)
========================= */
export const triggerWeeklyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const weekData = await getWeeklyData(userId);

    if (weekData.transactionCount === 0) {
      return res.json({ message: "No transactions this week", weekData });
    }

    await sendWeeklyReport(userId, weekData);
    
    await createNotification(
      userId,
      'weekly_report',
      'Weekly Financial Summary',
      `Income: $${weekData.income.toFixed(2)} | Expenses: $${weekData.expenses.toFixed(2)}`,
      weekData,
      'BarChart',
      'info',
      '/analytics'
    );

    res.json({ message: "Weekly report sent", weekData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
