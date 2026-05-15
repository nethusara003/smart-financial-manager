# Notification System - Implementation Guide

## Overview

The Smart Financial Tracker now features a **comprehensive, premium notification system** that provides users with real-time updates about their financial activities. The system includes:

- ✅ **Email Notifications** - Beautiful HTML email templates
- ✅ **Budget Alerts** - Automatic warnings when approaching budget limits
- ✅ **Bill Reminders** - Scheduled reminders for upcoming bill payments
- ✅ **Weekly Reports** - Automated weekly financial summaries
- ✅ **Transaction Alerts** - Notifications for every new transaction
- ✅ **In-App Notification Center** - Real-time notification panel
- ✅ **User Preferences** - Granular control over notification types

---

## Features & Purpose

### 1. Email Notifications 📧
**Purpose:** Keep users informed via email about important financial events.

**Features:**
- Professional HTML email templates with responsive design
- Beautiful gradient headers and styled content
- Dark mode compatible design
- Direct links to relevant app sections

**Triggers:**
- Transaction alerts (when enabled)
- Budget warnings (80%, 90%, 100% thresholds)
- Bill payment reminders
- Weekly financial summaries

### 2. Budget Alerts ⚠️
**Purpose:** Prevent overspending by alerting users when approaching budget limits.

**How It Works:**
- Monitors spending in each budget category
- Sends alerts at configurable thresholds (default: 80%, 90%, 100%)
- Shows amount spent, budget limit, and remaining balance
- Includes visual progress bars in email

**Notification Triggers:**
- 80% of budget used (Warning)
- 90% of budget used (Critical Warning)
- 100% of budget used (Budget Exceeded)

### 3. Bill Reminders 🔔
**Purpose:** Ensure users never miss a bill payment.

**How It Works:**
- Users add bills with due dates and amounts
- System automatically sends reminders based on reminder days setting
- Marks bills as paid and calculates next due date for recurring bills
- Runs daily at 9 AM to check upcoming bills

**Features:**
- Configurable reminder days (e.g., remind 3 days before due date)
- Recurring bill support (weekly, biweekly, monthly, quarterly, yearly)
- Auto-pay tracking
- Bill categories (utilities, rent, subscriptions, etc.)

### 4. Weekly Reports 📊
**Purpose:** Provide users with a comprehensive weekly financial summary.

**What's Included:**
- Total income for the week
- Total expenses for the week
- Net balance (income - expenses)
- Transaction count
- Top 5 spending categories
- Savings rate calculation
- Personalized insights and tips

**Schedule:** Runs every Sunday at 8 AM

### 5. Transaction Alerts 💳
**Purpose:** Confirm every financial transaction immediately.

**How It Works:**
- Triggered automatically when user creates a transaction
- Sends email with transaction details
- Creates in-app notification
- Shows transaction type (income/expense), category, amount, and notes

### 6. In-App Notification Center 🔔
**Purpose:** Provide a central hub for all notifications within the app.

**Features:**
- Real-time notification feed
- Unread badge counter
- Filter notifications (All / Unread)
- Mark as read / Mark all as read
- Delete individual or clear all read notifications
- Direct links to relevant pages
- Beautiful slide-in panel with smooth animations
- Dark mode support

---

## Backend Architecture

### Models

#### Notification Model
```javascript
{
  userId: ObjectId,
  type: 'budget_alert' | 'bill_reminder' | 'transaction_alert' | 'weekly_report' | 'goal_update' | 'system',
  title: String,
  message: String,
  data: Object,
  read: Boolean,
  icon: String,
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info',
  actionUrl: String,
  createdAt: Date
}
```

#### Bill Model
```javascript
{
  userId: ObjectId,
  name: String,
  amount: Number,
  category: String,
  dueDate: Date,
  recurring: Boolean,
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly',
  reminderDays: Number,
  isPaid: Boolean,
  paidDate: Date,
  autoPay: Boolean,
  notes: String,
  lastReminderSent: Date
}
```

### Services

#### notificationService.js
- `sendBudgetAlert(userId, category, spent, limit, percentage)` - Send budget alert email
- `sendBillReminder(userId, billName, amount, dueDate, daysUntilDue)` - Send bill reminder email
- `sendWeeklyReport(userId, weekData)` - Send weekly report email
- `sendTransactionAlert(userId, transaction)` - Send transaction alert email
- `checkBudgetAndAlert(userId, category, currentSpent, budgetLimit)` - Check and send budget alerts

### Controllers

#### notificationController.js
- `GET /api/notifications` - Get user notifications (paginated)
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications` - Clear all read notifications

#### billController.js
- `GET /api/bills` - Get all user bills
- `GET /api/bills/upcoming` - Get upcoming bills
- `POST /api/bills` - Create new bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill
- `PATCH /api/bills/:id/mark-paid` - Mark bill as paid

### Schedulers

#### Bill Reminder Scheduler
- **Schedule:** Daily at 9:00 AM
- **Function:** Checks all unpaid bills and sends reminders if within reminder window
- **Location:** `server.js` - `startBillReminderScheduler()`

#### Weekly Report Scheduler
- **Schedule:** Every Sunday at 8:00 AM
- **Function:** Generates and sends weekly financial summaries to all users with the feature enabled
- **Location:** `server.js` - `startWeeklyReportScheduler()`

---

## Frontend Architecture

### Components

#### NotificationCenter.jsx
Premium notification panel with:
- Slide-in animation
- Real-time updates
- Filter functionality
- Bulk actions (mark all read, clear all)
- Individual notification actions
- Direct navigation to relevant pages
- Beautiful gradient header
- Dark mode support

### Integration

#### Topbar.jsx
- Notification bell icon with unread badge
- Opens NotificationCenter on click
- Auto-refreshes unread count every 30 seconds

#### Settings.jsx
User can control:
- Email Notifications (master toggle)
- Budget Alerts
- Bill Reminders
- Weekly Reports
- Transaction Alerts
- Goal Updates

---

## API Endpoints

### Notification Endpoints
```
GET    /api/notifications                    Get user notifications
GET    /api/notifications?unreadOnly=true    Get only unread notifications
PATCH  /api/notifications/:id/read           Mark notification as read
PATCH  /api/notifications/read-all           Mark all as read
DELETE /api/notifications/:id                Delete notification
DELETE /api/notifications                    Clear all read notifications
```

### Bill Endpoints
```
GET    /api/bills                  Get all user bills
GET    /api/bills/upcoming         Get upcoming bills (default: next 7 days)
POST   /api/bills                  Create new bill
PUT    /api/bills/:id              Update bill
DELETE /api/bills/:id              Delete bill
PATCH  /api/bills/:id/mark-paid    Mark bill as paid
```

### User Preferences
```
PUT    /api/users/notification-settings    Update notification preferences
PUT    /api/users/privacy-settings         Update privacy settings
```

### Testing Endpoints
```
POST   /api/users/trigger-weekly-report    Manually trigger weekly report (testing)
```

---

## How to Use

### For Users

#### Enable/Disable Notifications
1. Go to **Settings** → **Notifications** tab
2. Toggle each notification type on/off
3. Click "Save Preferences"

#### Manage Bills
1. Go to **Dashboard** (bills are shown there)
2. Click "Add Bill" to create a new bill
3. Set amount, due date, category
4. Enable recurring if it's a regular payment
5. Set reminder days (how many days before due date to be reminded)
6. Mark bills as paid when you pay them

#### View Notifications
1. Click the bell icon in the top bar
2. See all notifications in the panel
3. Click "View" to go to related page
4. Click "Mark read" or "Mark all read"
5. Delete or clear old notifications

### For Developers

#### Trigger a Notification
```javascript
import { createNotification } from '../controllers/notificationController.js';

await createNotification(
  userId,
  'budget_alert',                    // type
  'Budget Alert',                    // title
  'You exceeded your budget',        // message
  { category: 'Food', amount: 500 }, // data
  'AlertCircle',                     // icon
  'warning',                         // color
  '/budgets'                         // actionUrl
);
```

#### Send Email Notification
```javascript
import { sendBudgetAlert } from '../Services/notificationService.js';

await sendBudgetAlert(userId, 'Food', 450, 500, 90);
```

#### Add Bill Tracking to Feature
```javascript
// Example: In Dashboard or Bills page
const createBill = async (billData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/bills', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(billData)
  });

  if (response.ok) {
    const data = await response.json();
    console.log('Bill created:', data.bill);
  }
};
```

---

## Email Template Customization

All email templates are in `backend/Services/notificationService.js`:

### Available Templates
1. `budgetAlert` - Budget warning emails
2. `billReminder` - Bill payment reminders
3. `weeklyReport` - Weekly financial summaries
4. `transactionAlert` - Transaction confirmations

### Customizing Templates
- Edit HTML in the `emailTemplates` object
- Use inline CSS for email client compatibility
- Include personalization with user data
- Add call-to-action buttons
- Use environment variable `FRONTEND_URL` for links

---

## Environment Variables

Add to `.env`:
```env
# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:5173
```

---

## Testing

### Test Email Notifications
1. Go to Settings → Notifications
2. Enable email notifications
3. Create a transaction → Should receive transaction alert
4. Add a bill with due date today → Should receive bill reminder at 9 AM
5. Trigger weekly report: 
   ```
   POST http://localhost:5000/api/users/trigger-weekly-report
   Authorization: Bearer YOUR_TOKEN
   ```

### Test In-App Notifications
1. Click bell icon in top bar
2. Should see notification center
3. Create transactions, add bills, etc.
4. Notifications should appear in real-time

### Test Bill Reminders
1. Create a bill with due date = today or tomorrow
2. Set reminder days = 3
3. Wait for 9 AM (or run manually in code)
4. Should receive email and in-app notification

---

## Premium Features

### Email Design
- ✨ Gradient headers
- 📊 Visual progress bars
- 💳 KPI cards with stats
- 🎨 Color-coded alerts
- 📱 Mobile-responsive
- 🌙 Dark mode friendly

### In-App UI
- ✨ Smooth slide-in animations
- 🎯 Smart filtering
- 🔢 Real-time unread badges
- 🎨 Color-coded notification types
- 🌙 Full dark mode support
- ⚡ Auto-refresh every 30 seconds

### User Experience
- 🔔 Non-intrusive notifications
- 🎯 Relevant and timely
- 🔗 Direct navigation to related pages
- 📱 Responsive on all devices
- ♿ Accessible design

---

## Future Enhancements

- [ ] Push notifications (browser notifications API)
- [ ] SMS notifications integration
- [ ] Notification sound preferences
- [ ] Custom notification schedules
- [ ] Notification templates customization
- [ ] Digest mode (bundle notifications)
- [ ] Snooze functionality
- [ ] Notification priority levels

---

## Technical Stack

**Backend:**
- Node.js + Express
- MongoDB (Mongoose)
- Nodemailer (Email)
- Scheduled Jobs (setInterval)

**Frontend:**
- React
- Tailwind CSS
- Lucide Icons
- React Router

---

## Troubleshooting

### Emails Not Sending
1. Check `.env` has correct EMAIL_USER and EMAIL_PASS
2. For Gmail, use App Password (not regular password)
3. Check console for error messages
4. Verify notification settings are enabled for user

### Notifications Not Appearing
1. Check user has enabled notifications in Settings
2. Verify backend routes are registered in `server.js`
3. Check browser console for API errors
4. Ensure token is valid

### Scheduler Not Running
1. Check server console for scheduler start messages
2. Verify time-based conditions in schedulers
3. For testing, adjust times or trigger manually

---

## Support

For issues or questions, check:
- Server console logs for errors
- Browser console for frontend errors
- Database for saved settings and notifications
- Email service configuration

---

**Last Updated:** February 16, 2026
**Version:** 1.0.0
