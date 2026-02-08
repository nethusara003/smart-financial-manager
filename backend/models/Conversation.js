import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  intent: {
    type: String,
    enum: [
      'transaction_query',
      'budget_query',
      'goal_query',
      'analytics',
      'action_request',
      'help',
      'financial_advice',
      'general',
      'unknown'
    ]
  },
  entities: {
    amounts: [Number],
    dates: mongoose.Schema.Types.Mixed,
    categories: [String],
    timePeriod: mongoose.Schema.Types.Mixed,
    goalName: String,
    transactionType: String
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  }
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  conversationId: {
    type: String,
    required: true,
    unique: true,
    default: () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  messages: [messageSchema],
  sessionMetadata: {
    startedAt: {
      type: Date,
      default: Date.now
    },
    lastActivityAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    messageCount: {
      type: Number,
      default: 0
    },
    contextData: {
      recentCategories: [String],
      activeGoals: [String],
      currentTopic: String,
      userPreferences: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    }
  },
  summary: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Index for faster queries
conversationSchema.index({ userId: 1, 'sessionMetadata.lastActivityAt': -1 });
// conversationId index removed - already created by unique: true

// Update lastActivityAt on new message
conversationSchema.pre('save', async function() {
  if (this.messages && this.messages.length > 0) {
    this.sessionMetadata.lastActivityAt = new Date();
    this.sessionMetadata.messageCount = this.messages.length;
    
    // Auto-generate summary from first user message
    if (!this.summary && this.messages.length > 0) {
      const firstUserMessage = this.messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        this.summary = firstUserMessage.content.substring(0, 100) + 
          (firstUserMessage.content.length > 100 ? '...' : '');
      }
    }
  }
});

// Method to add message
conversationSchema.methods.addMessage = function(role, content, intent = null, entities = {}) {
  this.messages.push({
    role,
    content,
    intent,
    entities,
    timestamp: new Date()
  });
  this.sessionMetadata.lastActivityAt = new Date();
  return this.save();
};

// Method to get recent context
conversationSchema.methods.getRecentContext = function(messageCount = 10) {
  return this.messages.slice(-messageCount);
};

// Method to deactivate conversation
conversationSchema.methods.deactivate = function() {
  this.sessionMetadata.isActive = false;
  return this.save();
};

// Static method to get active conversations for user
conversationSchema.statics.getActiveConversations = function(userId) {
  return this.find({ 
    userId, 
    'sessionMetadata.isActive': true 
  }).sort({ 'sessionMetadata.lastActivityAt': -1 });
};

// Static method to clean old inactive conversations (older than 30 days)
conversationSchema.statics.cleanOldConversations = async function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    'sessionMetadata.isActive': false,
    'sessionMetadata.lastActivityAt': { $lt: thirtyDaysAgo }
  });
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
