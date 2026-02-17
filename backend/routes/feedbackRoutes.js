import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Create new feedback
router.post('/', feedbackController.createFeedback);

// Get all approved feedbacks (with filters)
router.get('/', feedbackController.getAllFeedbacks);

// Get user's own feedbacks
router.get('/my-feedbacks', feedbackController.getMyFeedbacks);

// Update feedback
router.put('/:id', feedbackController.updateFeedback);

// Delete feedback
router.delete('/:id', feedbackController.deleteFeedback);

// Mark feedback as helpful
router.post('/:id/helpful', feedbackController.markHelpful);

export default router;
