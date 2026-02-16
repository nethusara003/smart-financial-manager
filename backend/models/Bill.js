import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      enum: [
        'utilities',
        'rent',
        'mortgage',
        'insurance',
        'subscription',
        'phone',
        'internet',
        'electricity',
        'water',
        'gas',
        'credit_card',
        'loan',
        'other'
      ]
    },
    dueDate: {
      type: Date,
      required: true
    },
    recurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    reminderDays: {
      type: Number,
      default: 3,
      min: 0,
      max: 30
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidDate: {
      type: Date,
      default: null
    },
    autoPay: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      default: ''
    },
    lastReminderSent: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Index for efficient querying of upcoming bills
billSchema.index({ userId: 1, dueDate: 1, isPaid: 1 });

// Method to calculate next due date for recurring bills
billSchema.methods.calculateNextDueDate = function() {
  if (!this.recurring) return null;

  const current = new Date(this.dueDate);
  const now = new Date();

  // If current due date is in the past, calculate next occurrence
  if (current < now) {
    switch (this.frequency) {
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'biweekly':
        current.setDate(current.getDate() + 14);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'quarterly':
        current.setMonth(current.getMonth() + 3);
        break;
      case 'yearly':
        current.setFullYear(current.getFullYear() + 1);
        break;
    }
    return current;
  }

  return this.dueDate;
};

export default mongoose.model("Bill", billSchema);
