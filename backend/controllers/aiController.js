/**
 * AI Chatbot Controller
 * Handles chatbot API endpoints for intelligent financial conversations
 */

import { processMessage } from '../utils/intentRecognition.js';
import { generateResponse } from '../utils/responseGenerator.js';
import {
  loadContext,
  updateContext,
  getContextualInfo,
  resolveReferences,
  startNewConversation,
  getConversationHistory,
  getUserConversations,
  deactivateConversation,
  getContextualSuggestions
} from '../utils/contextManager.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

/**
 * Send message to chatbot
 * POST /api/ai/chat
 */
export const chatWithAssistant = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user._id;

    // Fetch user with currency preference
    const user = await User.findById(userId).select('currency');
    const userCurrency = user?.currency || 'LKR';

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required and must be a non-empty string' 
      });
    }

    if (message.length > 500) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is too long (maximum 500 characters)' 
      });
    }

    // Load or create conversation context
    let context;
    let actualConversationId = conversationId;
    
    if (!conversationId) {
      // Start new conversation
      const newConversation = await startNewConversation(userId);
      actualConversationId = newConversation.conversationId;
      context = await loadContext(actualConversationId, userId);
    } else {
      context = await loadContext(conversationId, userId);
    }

    // Save user message first
    await updateContext(actualConversationId, userId, 'user', message.trim());

    // Get contextual information
    const contextInfo = getContextualInfo(context);

    // Resolve references using context
    const resolvedMessage = resolveReferences(message, contextInfo);

    // Process message to detect intent and extract entities
    const processedMessage = processMessage(resolvedMessage, {
      userCategories: context.userCategories || [],
      userGoals: context.userGoals || []
    });

    // Generate response based on intent and entities
    const response = await generateResponse(
      processedMessage.intent,
      processedMessage.entities,
      resolvedMessage,
      userId,
      userCurrency
    );

    // Save bot response
    await updateContext(
      actualConversationId,
      userId,
      'assistant',
      response.text,
      processedMessage.intent,
      processedMessage.entities
    );

    // Get contextual suggestions if not provided in response
    const suggestions = response.suggestions || getContextualSuggestions(contextInfo);

    // Return response
    return res.status(200).json({
      success: true,
      conversationId: actualConversationId,
      reply: response.text,
      intent: processedMessage.intent,
      confidence: processedMessage.confidence,
      suggestions,
      metadata: {
        wordCount: processedMessage.wordCount,
        isQuestion: processedMessage.isQuestion,
        sentiment: processedMessage.sentiment
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      reply: "I apologize, but I encountered an error processing your message. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Start a new conversation
 * POST /api/ai/conversations/new
 */
export const createNewConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const conversation = await startNewConversation(userId);
    
    return res.status(201).json({
      success: true,
      conversationId: conversation.conversationId,
      message: "New conversation started",
      welcomeMessage: conversation.messages[0].content
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create new conversation'
    });
  }
};

/**
 * Get conversation history
 * GET /api/ai/conversations/:conversationId
 */
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const history = await getConversationHistory(conversationId, userId, page, limit);

    return res.status(200).json({
      success: true,
      ...history
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation'
    });
  }
};

/**
 * Get all conversations for user
 * GET /api/ai/conversations
 */
export const getAllConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const conversations = await getUserConversations(userId, limit);

    return res.status(200).json({
      success: true,
      conversations,
      count: conversations.length
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversations'
    });
  }
};

/**
 * Delete/clear a conversation
 * DELETE /api/ai/conversations/:conversationId
 */
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOneAndDelete({ conversationId, userId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete conversation'
    });
  }
};

/**
 * Get suggested questions based on user data
 * GET /api/ai/suggestions
 */
export const getSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Load user context to get personalized suggestions
    const tempConvId = `temp_${Date.now()}`;
    const context = await loadContext(tempConvId, userId);
    const contextInfo = getContextualInfo(context);
    
    // Delete temp conversation
    await Conversation.findOneAndDelete({ conversationId: tempConvId });
    
    const suggestions = getContextualSuggestions(contextInfo);
    
    // Add some general popular questions
    const popularQuestions = [
      "How much did I spend this month?",
      "Show my spending by category",
      "What was my biggest expense?",
      "Am I on track with my budget?",
      "Show my savings progress",
      "Compare this month to last month",
      "Tips for saving money",
      "How can I reduce spending?"
    ];
    
    return res.status(200).json({
      success: true,
      contextual: suggestions,
      popular: popularQuestions.slice(0, 5)
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return res.status(500).json({
      success: false,
      suggestions: [
        "Show my spending this month",
        "What can you help me with?",
        "Tips for saving money"
      ]
    });
  }
};

/**
 * Submit feedback on a response
 * POST /api/ai/feedback
 */
export const submitFeedback = async (req, res) => {
  try {
    const { conversationId, messageId, helpful } = req.body;
    const userId = req.user._id;

    // Find the conversation and message
    const conversation = await Conversation.findOne({ conversationId, userId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    const message = conversation.messages.id(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // Store feedback (you could add a feedback field to the message schema)
    // For now, just acknowledge receipt
    
    return res.status(200).json({
      success: true,
      message: 'Feedback received. Thank you!'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
};
