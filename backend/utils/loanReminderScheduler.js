import Loan from '../models/Loan.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { formatCurrency } from './dataFormatters.js';

/**
 * Loan Payment Reminder Scheduler
 * Runs daily at 9:00 AM to check for upcoming loan payments
 */

/**
 * Check and send reminders for upcoming loan payments
 */
export const checkLoanPaymentReminders = async () => {
  try {
    console.log('⏰ Running loan payment reminder check...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check for payments due in next 7 days
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    
    // Find active loans with upcoming payments
    const upcomingPayments = await Loan.find({
      status: 'active',
      nextPaymentDate: {
        $gte: today,
        $lte: in7Days,
      },
    })
    .select('userId loanName emiAmount nextPaymentDate')
    .populate('userId', 'currency');
    
    console.log(`Found ${upcomingPayments.length} upcoming loan payments`);
    
    // Send notifications for each upcoming payment
    for (const loan of upcomingPayments) {
      const daysUntilDue = Math.ceil(
        (new Date(loan.nextPaymentDate) - today) / (1000 * 60 * 60 * 24)
      );
      
      const userCurrency = loan.userId?.currency || 'LKR';
      const formattedAmount = formatCurrency(loan.emiAmount, userCurrency);
      let message = '';
      let color = 'info';
      
      if (daysUntilDue === 0) {
        message = `Your EMI of ${formattedAmount} for ${loan.loanName} is due today!`;
        color = 'danger';
      } else if (daysUntilDue === 1) {
        message = `Your EMI of ${formattedAmount} for ${loan.loanName} is due tomorrow`;
        color = 'warning';
      } else {
        message = `Your EMI of ${formattedAmount} for ${loan.loanName} is due in ${daysUntilDue} days`;
        color = 'info';
      }
      
      // Check if notification already sent today
      const existingNotification = await Notification.findOne({
        userId: loan.userId,
        type: 'bill_reminder',
        message,
        createdAt: { $gte: today },
      });
      
      if (!existingNotification) {
        await Notification.create({
          userId: loan.userId,
          type: 'bill_reminder',
          title: 'Loan Payment Reminder',
          message,
          color,
          read: false,
          actionUrl: '/loans',
          data: {
            loanId: loan._id,
            loanName: loan.loanName,
            amount: loan.emiAmount,
            dueDate: loan.nextPaymentDate,
            daysUntilDue,
          },
        });
        
        console.log(`✅ Sent reminder to user ${loan.userId} for ${loan.loanName}`);
      }
    }
    
    // Check for overdue payments
    const overdueLoans = await Loan.find({
      status: 'active',
      nextPaymentDate: { $lt: today },
    })
    .select('userId loanName emiAmount nextPaymentDate')
    .populate('userId', 'currency');
    
    console.log(`Found ${overdueLoans.length} overdue loan payments`);
    
    // Send overdue notifications
    for (const loan of overdueLoans) {
      const daysOverdue = Math.floor(
        (today - new Date(loan.nextPaymentDate)) / (1000 * 60 * 60 * 24)
      );
      
      const userCurrency = loan.userId?.currency || 'LKR';
      const formattedAmount = formatCurrency(loan.emiAmount, userCurrency);
      const message = `Your EMI of ${formattedAmount} for ${loan.loanName} is overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}!`;
      
      // Check if notification already sent today
      const existingNotification = await Notification.findOne({
        userId: loan.userId,
        type: 'bill_reminder',
        message,
        createdAt: { $gte: today },
      });
      
      if (!existingNotification) {
        await Notification.create({
          userId: loan.userId,
          type: 'bill_reminder',
          title: 'Overdue Loan Payment',
          message,
          color: 'danger',
          read: false,
          actionUrl: '/loans',
          data: {
            loanId: loan._id,
            loanName: loan.loanName,
            amount: loan.emiAmount,
            dueDate: loan.nextPaymentDate,
            daysOverdue,
            isOverdue: true,
          },
        });
        
        console.log(`✅ Sent overdue reminder to user ${loan.userId} for ${loan.loanName}`);
      }
    }
    
    console.log('✅ Loan payment reminder check completed');
  } catch (error) {
    console.error('Error checking loan payment reminders:', error);
  }
};

/**
 * Start the loan payment reminder scheduler
 * Runs every day at 9:00 AM
 */
export const startLoanReminderScheduler = () => {
  const checkLoans = () => {
    const now = new Date();
    // Run at 9 AM every day
    if (now.getHours() === 9 && now.getMinutes() === 0) {
      console.log('🔔 Starting scheduled loan payment reminder check...');
      checkLoanPaymentReminders();
    }
  };

  // Check every minute to see if it's 9 AM
  setInterval(checkLoans, 60000);
  console.log('✅ Loan payment reminder scheduler started (runs daily at 9:00 AM)');
};

/**
 * Manual trigger for testing (can be called via API endpoint)
 */
export const triggerLoanRemindersNow = async () => {
  console.log('🔔 Manual trigger: Running loan payment reminder check...');
  await checkLoanPaymentReminders();
};
