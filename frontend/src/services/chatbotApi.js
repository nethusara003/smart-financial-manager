/**
 * Chatbot API Service
 * Handles all chatbot-related API calls
 */

import { request } from "./apiClient";

/**
 * Send message to chatbot
 */
export const sendMessage = async (message, conversationId = null) => {
  return request("/ai/chat", {
    method: "POST",
    body: { message, conversationId },
    fallbackMessage: "Failed to send message",
  });
};

/**
 * Start a new conversation
 */
export const startNewConversation = async () => {
  return request("/ai/conversations/new", {
    method: "POST",
    fallbackMessage: "Failed to start new conversation",
  });
};

/**
 * Get conversation history
 */
export const getConversationHistory = async (conversationId, page = 1, limit = 50) => {
  return request(`/ai/conversations/${conversationId}?page=${page}&limit=${limit}`, {
    fallbackMessage: "Failed to get conversation history",
  });
};

/**
 * Get all conversations for user
 */
export const getAllConversations = async (limit = 10) => {
  return request(`/ai/conversations?limit=${limit}`, {
    fallbackMessage: "Failed to get conversations",
  });
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId) => {
  return request(`/ai/conversations/${conversationId}`, {
    method: "DELETE",
    fallbackMessage: "Failed to delete conversation",
  });
};

/**
 * Get suggested questions
 */
export const getSuggestions = async () => {
  try {
    return await request("/ai/suggestions", {
      fallbackMessage: "Failed to get suggestions",
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return {
      success: true,
      contextual: [
        "Show my spending this month",
        "What can you help me with?",
        "Tips for saving money"
      ],
      popular: [
        "How much did I spend this month?",
        "Show my spending by category",
        "Compare this month to last month"
      ]
    };
  }
};

/**
 * Submit feedback on a response
 */
export const submitFeedback = async (conversationId, messageId, helpful) => {
  try {
    return await request("/ai/feedback", {
      method: "POST",
      body: { conversationId, messageId, helpful },
      fallbackMessage: "Failed to submit feedback",
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    // Silent failure for feedback
    return null;
  }
};

export default {
  sendMessage,
  startNewConversation,
  getConversationHistory,
  getAllConversations,
  deleteConversation,
  getSuggestions,
  submitFeedback
};
