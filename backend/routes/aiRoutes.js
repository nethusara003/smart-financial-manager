import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  chatWithAssistant,
  createNewConversation,
  getConversation,
  getAllConversations,
  deleteConversation,
  getSuggestions,
  submitFeedback
} from '../controllers/aiController.js';

const router = express.Router();

// Chat endpoint - send message to chatbot
router.post('/chat', protect, chatWithAssistant);

// Conversation management
router.post('/conversations/new', protect, createNewConversation);
router.get('/conversations', protect, getAllConversations);
router.get('/conversations/:conversationId', protect, getConversation);
router.delete('/conversations/:conversationId', protect, deleteConversation);

// Suggestions and feedback
router.get('/suggestions', protect, getSuggestions);
router.post('/feedback', protect, submitFeedback);

export default router;
