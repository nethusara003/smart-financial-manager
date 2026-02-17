/**
 * Sample Data Routes
 * Routes for generating and managing sample financial data
 */

import express from 'express';
import { generateSampleData, checkDataSufficiency } from '../controllers/sampleDataController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Generate sample data for current user
router.post('/generate', generateSampleData);

// Check if user has sufficient data
router.get('/check', checkDataSufficiency);

export default router;
