import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
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
router.post('/chat', requireAuth, chatWithAssistant);

// Conversation management
router.post('/conversations/new', requireAuth, createNewConversation);
router.get('/conversations', requireAuth, getAllConversations);
router.get('/conversations/:conversationId', requireAuth, getConversation);
router.delete('/conversations/:conversationId', requireAuth, deleteConversation);

// Suggestions and feedback
router.get('/suggestions', requireAuth, getSuggestions);
router.post('/feedback', requireAuth, submitFeedback);

export default router;
