import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['Features', 'Performance', 'UI/UX', 'Support', 'Overall', 'Other'],
    default: 'Overall'
  },
  isPremiumFeedback: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  markedHelpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

// Index for efficient querying
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ isPremiumFeedback: 1 });

export default mongoose.model('Feedback', feedbackSchema);
