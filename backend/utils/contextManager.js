/**
 * Conversation Context Manager
 * Maintains conversation state for multi-turn dialogs
 */

import Conversation from '../models/Conversation.js';
import { getUserCategories } from './chatDataQueries.js';
import Goal from '../models/Goal.js';

/**
 * Load conversation context
 */
async function loadContext(conversationId, userId) {
  try {
    let conversation = await Conversation.findOne({ conversationId, userId });
    
    if (!conversation) {
      // Create new conversation if not exists
      conversation = await Conversation.create({
        userId,
        conversationId,
        messages: [],
        sessionMetadata: {
          isActive: true,
          contextData: {
            recentCategories: [],
            activeGoals: [],
            currentTopic: null,
            userPreferences: new Map()
          }
        }
      });
    }
    
    // Update last activity timestamp
    conversation.sessionMetadata.lastActivityAt = new Date();
    await conversation.save();
    
    // Load user-specific context
    const [categories, goals] = await Promise.all([
      getUserCategories(userId),
      Goal.find({ userId, status: { $ne: 'completed' } }).select('name')
    ]);
    
    return {
      conversation,
      userCategories: categories,
      userGoals: goals.map(g => g.name),
      recentMessages: conversation.messages.slice(-10)
    };
  } catch (error) {
    console.error('Error loading context:', error);
    throw error;
  }
}

/**
 * Update conversation context with new message
 */
async function updateContext(conversationId, userId, role, content, intent = null, entities = {}) {
  try {
    const conversation = await Conversation.findOne({ conversationId, userId });
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Add message to conversation
    conversation.messages.push({
      role,
      content,
      intent,
      entities,
      timestamp: new Date()
    });
    conversation.sessionMetadata.lastActivityAt = new Date();
    
    // Update context data based on message and entities
    if (entities.categories && entities.categories.length > 0) {
      const contextData = conversation.sessionMetadata.contextData;
      
      // Update recent categories
      if (!contextData.recentCategories) {
        contextData.recentCategories = [];
      }
      
      entities.categories.forEach(category => {
        if (!contextData.recentCategories.includes(category)) {
          contextData.recentCategories.unshift(category);
          // Keep only last 5 categories
          if (contextData.recentCategories.length > 5) {
            contextData.recentCategories.pop();
          }
        }
      });
    }
    
    // Update current topic based on intent
    if (intent) {
      conversation.sessionMetadata.contextData.currentTopic = intent;
    }
    
    await conversation.save();
    
    return conversation;
  } catch (error) {
    console.error('Error updating context:', error);
    throw error;
  }
}

/**
 * Get contextual information for better intent recognition
 */
function getContextualInfo(context) {
  if (!context || !context.conversation) {
    return {
      currentTopic: null,
      recentCategories: [],
      lastUserMessage: null,
      lastBotResponse: null
    };
  }
  
  const messages = context.conversation.messages;
  const contextData = context.conversation.sessionMetadata.contextData;
  
  // Find last user message and bot response
  let lastUserMessage = null;
  let lastBotResponse = null;
  
  for (let i = messages.length - 1; i >= 0; i--) {
    if (!lastUserMessage && messages[i].role === 'user') {
      lastUserMessage = messages[i];
    }
    if (!lastBotResponse && messages[i].role === 'assistant') {
      lastBotResponse = messages[i];
    }
    if (lastUserMessage && lastBotResponse) break;
  }
  
  return {
    currentTopic: contextData.currentTopic,
    recentCategories: contextData.recentCategories || [],
    activeGoals: contextData.activeGoals || [],
    lastUserMessage: lastUserMessage ? lastUserMessage.content : null,
    lastBotResponse: lastBotResponse ? lastBotResponse.content : null,
    lastIntent: lastUserMessage ? lastUserMessage.intent : null
  };
}

/**
 * Resolve pronouns and references using context
 */
function resolveReferences(message, contextInfo) {
  let resolved = message;
  
  // Resolve "it", "that", "this" to last mentioned category
  if (contextInfo.recentCategories && contextInfo.recentCategories.length > 0) {
    const pronounPattern = /\b(it|that|this)\b/gi;
    
    if (pronounPattern.test(message) && !/(add|create|show|list)/i.test(message)) {
      // Only replace if it seems like a follow-up question
      const lastCategory = contextInfo.recentCategories[0];
      resolved = message.replace(pronounPattern, lastCategory);
    }
  }
  
  // Handle implicit time period continuation
  if (contextInfo.lastIntent === 'transaction_query' && 
      !/(month|week|year|day|yesterday|today)/i.test(message)) {
    // If last query was about a specific period, assume same period for follow-ups
    // This is handled in the intent processing, not here
  }
  
  return resolved;
}

/**
 * Determine if message is a follow-up question
 */
function isFollowUp(message, contextInfo) {
  const normalized = message.toLowerCase().trim();
  
  // Short questions that depend on context
  if (normalized.length < 15 && /^(and|also|what about|how about)/.test(normalized)) {
    return true;
  }
  
  // Questions with pronouns that likely refer to previous context
  if (/\b(it|that|this|same)\b/i.test(message) && contextInfo.currentTopic) {
    return true;
  }
  
  // Comparative questions
  if (/compare|vs|versus|than (that|last|previous)/i.test(message) && contextInfo.lastIntent) {
    return true;
  }
  
  return false;
}

/**
 * Get suggested follow-up questions based on current context
 */
function getContextualSuggestions(contextInfo) {
  const suggestions = [];
  
  if (contextInfo.currentTopic === 'transaction_query') {
    suggestions.push(
      "Show spending by category",
      "Compare to last month",
      "What was my biggest expense?"
    );
  } else if (contextInfo.currentTopic === 'budget_query') {
    suggestions.push(
      "Show all budgets",
      "Which categories am I over?",
      "Tips for budgeting"
    );
  } else if (contextInfo.currentTopic === 'goal_query') {
    suggestions.push(
      "Show all goals",
      "How can I save more?",
      "Set a new goal"
    );
  } else if (contextInfo.recentCategories && contextInfo.recentCategories.length > 0) {
    const category = contextInfo.recentCategories[0];
    suggestions.push(
      `How much did I spend on ${category}?`,
      "Show all spending categories",
      "Compare this month to last"
    );
  } else {
    suggestions.push(
      "Show my spending this month",
      "How am I doing financially?",
      "Tips for saving money"
    );
  }
  
  return suggestions.slice(0, 3);
}

/**
 * Clear old context data (called periodically)
 */
async function clearOldContext(conversationId, userId) {
  try {
    const conversation = await Conversation.findOne({ conversationId, userId });
    
    if (!conversation) {
      return;
    }
    
    const inactiveMinutes = 30;
    const inactiveThreshold = new Date(Date.now() - inactiveMinutes * 60 * 1000);
    
    if (conversation.sessionMetadata.lastActivityAt < inactiveThreshold) {
      // Reset context but keep conversation history
      conversation.sessionMetadata.contextData = {
        recentCategories: [],
        activeGoals: [],
        currentTopic: null,
        userPreferences: new Map()
      };
      
      await conversation.save();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error clearing old context:', error);
    return false;
  }
}

/**
 * Deactivate conversation
 */
async function deactivateConversation(conversationId, userId) {
  try {
    const conversation = await Conversation.findOne({ conversationId, userId });
    
    if (conversation) {
      conversation.sessionMetadata.isActive = false;
      await conversation.save();
    }
  } catch (error) {
    console.error('Error deactivating conversation:', error);
    throw error;
  }
}

/**
 * Start new conversation (create with welcome message)
 */
async function startNewConversation(userId) {
  try {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation = await Conversation.create({
      userId,
      conversationId,
      messages: [{
        role: 'assistant',
        content: "Hello! I'm your financial assistant. I can help you understand your spending, track your goals, and provide financial insights. What would you like to know?",
        intent: 'general',
        timestamp: new Date()
      }],
      sessionMetadata: {
        isActive: true,
        contextData: {
          recentCategories: [],
          activeGoals: [],
          currentTopic: null,
          userPreferences: new Map()
        }
      }
    });
    
    return conversation;
  } catch (error) {
    console.error('Error starting new conversation:', error);
    throw error;
  }
}

/**
 * Get conversation history with pagination
 */
async function getConversationHistory(conversationId, userId, page = 1, limit = 50) {
  try {
    const conversation = await Conversation.findOne({ conversationId, userId });
    
    if (!conversation) {
      return {
        messages: [],
        hasMore: false,
        total: 0
      };
    }
    
    const totalMessages = conversation.messages.length;
    const skip = (page - 1) * limit;
    const messages = conversation.messages.slice(skip, skip + limit);
    
    return {
      messages,
      hasMore: skip + limit < totalMessages,
      total: totalMessages,
      page,
      limit
    };
  } catch (error) {
    console.error('Error getting conversation history:', error);
    throw error;
  }
}

/**
 * Get all conversations for user
 */
async function getUserConversations(userId, limit = 10) {
  try {
    const conversations = await Conversation.find({ userId })
      .sort({ 'sessionMetadata.lastActivityAt': -1 })
      .limit(limit)
      .select('conversationId summary sessionMetadata messages');
    
    return conversations.map(conv => {
      const lastMessage = conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1] 
        : null;
      
      return {
        conversationId: conv.conversationId,
        summary: conv.summary || 'New conversation',
        lastActivity: conv.sessionMetadata.lastActivityAt,
        messageCount: conv.sessionMetadata.messageCount,
        isActive: conv.sessionMetadata.isActive,
        lastMessage: lastMessage ? {
          role: lastMessage.role,
          content: lastMessage.content.substring(0, 100),
          timestamp: lastMessage.timestamp
        } : null
      };
    });
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
}

export {
  loadContext,
  updateContext,
  getContextualInfo,
  resolveReferences,
  isFollowUp,
  getContextualSuggestions,
  clearOldContext,
  deactivateConversation,
  startNewConversation,
  getConversationHistory,
  getUserConversations
};
