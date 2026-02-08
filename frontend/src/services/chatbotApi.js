/**
 * Chatbot API Service
 * Handles all chatbot-related API calls
 */

const API_URL = "http://localhost:5000/api";

/**
 * Send message to chatbot
 */
export const sendMessage = async (message, conversationId = null) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  return res.json();
};

/**
 * Start a new conversation
 */
export const startNewConversation = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/ai/conversations/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to start new conversation");
  }

  return res.json();
};

/**
 * Get conversation history
 */
export const getConversationHistory = async (conversationId, page = 1, limit = 50) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/ai/conversations/${conversationId}?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to get conversation history");
  }

  return res.json();
};

/**
 * Get all conversations for user
 */
export const getAllConversations = async (limit = 10) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/ai/conversations?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to get conversations");
  }

  return res.json();
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/ai/conversations/${conversationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete conversation");
  }

  return res.json();
};

/**
 * Get suggested questions
 */
export const getSuggestions = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/ai/suggestions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to get suggestions");
    }

    return res.json();
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
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/ai/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ conversationId, messageId, helpful }),
    });

    if (!res.ok) {
      throw new Error("Failed to submit feedback");
    }

    return res.json();
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
