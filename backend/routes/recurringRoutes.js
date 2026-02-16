import express from 'express';
const router = express.Router();
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction
} from '../controllers/recurringController.js';
import requireAuth from '../middleware/requireAuth.js';

// All routes require authentication
router.use(requireAuth);

// GET /api/recurring - Get all recurring transactions
router.get('/', getRecurringTransactions);

// POST /api/recurring - Create a new recurring transaction
router.post('/', createRecurringTransaction);

// PUT /api/recurring/:id - Update a recurring transaction
router.put('/:id', updateRecurringTransaction);

// DELETE /api/recurring/:id - Delete a recurring transaction
router.delete('/:id', deleteRecurringTransaction);

// PATCH /api/recurring/:id/toggle - Toggle active status
router.patch('/:id/toggle', toggleRecurringTransaction);

export default router;
