/**
 * Chatbot API Service
 * Handles all chatbot-related API calls
 */

import { request } from "./apiClient";

const DEFAULT_SUGGESTIONS = [
  "How can I reduce monthly expenses?",
  "Help me create a savings plan",
  "Build a simple budget for my income",
];

/**
 * Send message to chatbot
 */
export const sendMessage = async (message, conversationId = null, history = []) => {
  const sessionId = conversationId || (typeof crypto !== "undefined" ? crypto.randomUUID() : `chat-${Date.now()}`);

  const normalizedHistory = Array.isArray(history)
    ? history
        .filter((entry) => entry && (entry.role === "user" || entry.role === "assistant"))
        .map((entry) => ({
          role: entry.role,
          content: String(entry.content || ""),
        }))
    : [];

  const payload = await request("/chat", {
    method: "POST",
    body: {
      message,
      sessionId,
      history: normalizedHistory,
    },
    fallbackMessage: "Failed to send message",
    auth: false,
  });

  return {
    conversationId: sessionId,
    reply: payload.reply,
    updatedHistory: payload.updatedHistory,
  };
};

/**
 * Start a new conversation
 */
export const startNewConversation = async () => {
  const conversationId =
    typeof crypto !== "undefined" ? crypto.randomUUID() : `chat-${Date.now()}`;

  return {
    success: true,
    conversationId,
    welcomeMessage: "Hi. I am your financial assistant. Tell me what you want to improve, and we will plan it together.",
  };
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
  return {
    success: true,
    contextual: DEFAULT_SUGGESTIONS,
    popular: DEFAULT_SUGGESTIONS,
  };
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
