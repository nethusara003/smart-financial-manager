import express from 'express';
import * as loanController from '../controllers/loanController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Loan CRUD operations
router.post('/', loanController.createLoan); // Create new loan
router.get('/', loanController.getAllLoans); // Get all user loans
router.get('/:id', loanController.getLoanById); // Get single loan
router.put('/:id', loanController.updateLoan); // Update loan
router.delete('/:id', loanController.deleteLoan); // Close/delete loan

// EMI calculations
router.post('/calculate-emi', loanController.calculateEMI); // Calculate EMI without creating loan

// Amortization schedule
router.get('/:id/amortization', loanController.getAmortizationSchedule); // Get loan's amortization schedule

// Payment operations
router.post('/:id/payments', loanController.recordPayment); // Record a payment
router.get('/:id/payments', loanController.getPaymentHistory); // Get payment history

// Extra payment simulations
router.post('/:id/simulate-extra-payment', loanController.simulateExtraPayment); // Simulate extra payment impact

// Early payoff
router.get('/:id/early-payoff', loanController.getEarlyPayoffAmount); // Calculate early payoff amount
router.post('/:id/prepayment', loanController.processPrepayment); // Process prepayment

// Analytics & reports
router.get('/analytics/summary', loanController.getLoansSummary); // Get loans summary
router.get('/analytics/overdue', loanController.getOverdueLoans); // Get overdue loans

// Loan comparison
router.post('/compare', loanController.compareLoans); // Compare multiple loan offers

export default router;
