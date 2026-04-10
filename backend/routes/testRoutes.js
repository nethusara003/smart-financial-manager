// @ts-nocheck
import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';
import User from '../models/User.js';
import Budget from '../models/Budget.js';
import { sendBudgetAlert } from '../Services/notificationService.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

/* =========================
   TEST EMAIL NOTIFICATION
========================= */
router.post('/test-email', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const result = await sendBudgetAlert(
      user._id,
      'Food',
      150,
      100,
      150
    );

    res.json({
      message: 'Test email sent',
      result,
      userEmail: user.email,
      notificationSettings: user.notificationSettings
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error sending test email',
      error: error.message 
    });
  }
});

/* =========================
   CHECK USER NOTIFICATION SETTINGS
========================= */
router.get('/notification-settings', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      email: user.email,
      notificationSettings: user.notificationSettings || 'NOT SET (using defaults)',
      budgets: await Budget.find({ userId: user._id })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   RESET BUDGET ALERT LEVELS
========================= */
router.post('/reset-budget-alerts', async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Budget.updateMany(
      { userId },
      { 
        lastAlertLevel: null,
        lastAlertDate: null
      }
    );

    res.json({
      message: 'Budget alert levels reset',
      modified: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
