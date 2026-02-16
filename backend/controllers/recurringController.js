import RecurringTransaction from '../models/RecurringTransaction.js';

// Get all recurring transactions for the logged-in user
const getRecurringTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query; // optional filter by type (income/expense)

    const filter = { userId };
    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }

    const recurringTransactions = await RecurringTransaction.find(filter).sort({ nextDate: 1 });
    res.json(recurringTransactions);
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    res.status(500).json({ message: 'Server error fetching recurring transactions' });
  }
};

// Create a new recurring transaction
const createRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, amount, type, category, frequency, nextDate, iconName, color } = req.body;

    // Validation
    if (!name || !amount || !type || !category || !frequency || !nextDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be income or expense' });
    }

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)) {
      return res.status(400).json({ message: 'Invalid frequency' });
    }

    const recurringTransaction = new RecurringTransaction({
      userId,
      name,
      amount: parseFloat(amount),
      type,
      category,
      frequency,
      nextDate: new Date(nextDate),
      iconName: iconName || 'Repeat',
      color: color || 'cyan',
      active: true
    });

    await recurringTransaction.save();
    res.status(201).json(recurringTransaction);
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    res.status(500).json({ message: 'Server error creating recurring transaction' });
  }
};

// Update a recurring transaction
const updateRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const allowedUpdates = ['name', 'amount', 'type', 'category', 'frequency', 'nextDate', 'iconName', 'color', 'active'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'nextDate') {
          updates[key] = new Date(req.body[key]);
        } else if (key === 'amount') {
          updates[key] = parseFloat(req.body[key]);
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const recurringTransaction = await RecurringTransaction.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!recurringTransaction) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    res.json(recurringTransaction);
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    res.status(500).json({ message: 'Server error updating recurring transaction' });
  }
};

// Delete a recurring transaction
const deleteRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const recurringTransaction = await RecurringTransaction.findOneAndDelete({ _id: id, userId });

    if (!recurringTransaction) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    res.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    res.status(500).json({ message: 'Server error deleting recurring transaction' });
  }
};

// Toggle active status
const toggleRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const recurringTransaction = await RecurringTransaction.findOne({ _id: id, userId });

    if (!recurringTransaction) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    recurringTransaction.active = !recurringTransaction.active;
    await recurringTransaction.save();

    res.json(recurringTransaction);
  } catch (error) {
    console.error('Error toggling recurring transaction:', error);
    res.status(500).json({ message: 'Server error toggling recurring transaction' });
  }
};

export {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction
};
