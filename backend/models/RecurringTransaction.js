import mongoose from "mongoose";

const recurringTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  nextDate: {
    type: Date,
    required: true
  },
  iconName: {
    type: String,
    default: 'Repeat'
  },
  color: {
    type: String,
    default: 'cyan'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
recurringTransactionSchema.index({ userId: 1, type: 1 });
recurringTransactionSchema.index({ userId: 1, active: 1 });

export default mongoose.model('RecurringTransaction', recurringTransactionSchema);
