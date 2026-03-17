import Loan from '../models/Loan.js';
import LoanPayment from '../models/LoanPayment.js';
import AmortizationSchedule from '../models/AmortizationSchedule.js';
import Notification from '../models/Notification.js';
import Transaction from '../models/Transaction.js';
import * as loanCalc from '../Services/loanCalculationService.js';
import { formatCurrency } from '../utils/dataFormatters.js';

/**
 * Create a new loan
 * POST /api/loans
 */
export const createLoan = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      loanName,
      loanType,
      principalAmount,
      interestRate,
      tenure,
      startDate,
      paymentDay,
      financialInstitution,
      accountNumber,
      processingFee,
      prepaymentPenalty,
      insuranceAmount,
      collateral,
    } = req.body;

    // Calculate EMI and total interest
    const emiAmount = loanCalc.calculateEMI(principalAmount, interestRate, tenure);
    const totalPayment = loanCalc.calculateTotalPayment(emiAmount, tenure);
    const totalInterest = loanCalc.calculateTotalInterest(totalPayment, principalAmount);

    // Calculate first payment date (next month from start date)
    const paymentDayValue = paymentDay || new Date(startDate).getDate();
    const nextPaymentDate = loanCalc.calculateNextPaymentDate(
      paymentDayValue,
      new Date(startDate)
    );
    
    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + tenure);

    // Create loan
    const loan = new Loan({
      userId,
      loanName,
      loanType,
      principalAmount,
      interestRate,
      tenure,
      startDate,
      endDate,
      emiAmount,
      totalInterest,
      totalPayment,
      remainingBalance: principalAmount,
      nextPaymentDate,
      paymentDay: paymentDayValue,
      lender: financialInstitution,
      accountNumber,
      processingFee: processingFee || 0,
      prepaymentPenalty: prepaymentPenalty || 0,
      insuranceAmount: insuranceAmount || 0,
      collateral,
      status: 'active',
    });

    await loan.save();

    // Generate and save amortization schedule
    const scheduleData = loanCalc.generateAmortizationSchedule(
      principalAmount,
      interestRate,
      tenure,
      new Date(startDate)
    );

    const amortizationSchedule = new AmortizationSchedule({
      loanId: loan._id,
      userId,
      schedule: scheduleData,
    });

    await amortizationSchedule.save();

    // Create notification
    const userCurrency = req.user.currency || 'LKR';
    await Notification.create({
      userId,
      type: 'system',
      title: 'Loan Created',
      message: `New loan "${loanName}" created with EMI of ${formatCurrency(emiAmount, userCurrency)}`,
      read: false,
    });

    res.status(201).json({
      success: true,
      message: 'Loan created successfully',
      loan,
      amortizationSchedule,
    });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating loan',
      error: error.message,
    });
  }
};

/**
 * Get all loans for a user
 * GET /api/loans
 */
export const getAllLoans = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, sortBy = 'nextPaymentDate', order = 'asc' } = req.query;

    // Build filter
    const filter = { userId };
    if (status) {
      filter.status = status;
    } else {
      // Exclude closed loans by default (soft delete)
      filter.status = { $ne: 'closed' };
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const loans = await Loan.find(filter).sort(sortOptions);

    // Calculate summary statistics
    const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
    const totalRemainingBalance = loans.reduce(
      (sum, loan) => sum + loan.remainingBalance,
      0
    );
    const totalMonthlyEmi = loans
      .filter((loan) => loan.status === 'active')
      .reduce((sum, loan) => sum + loan.emiAmount, 0);

    res.json({
      success: true,
      count: loans.length,
      loans,
      summary: {
        totalLoans: loans.length,
        totalPrincipal,
        totalBorrowed: totalPrincipal,
        totalRemainingBalance,
        totalOutstanding: totalRemainingBalance,
        totalMonthlyEmi,
        activeLoans: loans.filter((loan) => loan.status === 'active').length,
      },
    });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loans',
      error: error.message,
    });
  }
};

/**
 * Get single loan by ID
 * GET /api/loans/:id
 */
export const getLoanById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const loan = await Loan.findOne({ _id: id, userId });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    // Get amortization schedule
    const schedule = await AmortizationSchedule.findOne({ loanId: id });

    // Get payment history
    const payments = await LoanPayment.find({ loanId: id }).sort({
      paymentDate: -1,
    });

    res.json({
      success: true,
      loan,
      schedule,
      payments,
    });
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loan',
      error: error.message,
    });
  }
};

/**
 * Update loan
 * PUT /api/loans/:id
 */
export const updateLoan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const loan = await Loan.findOne({ _id: id, userId });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    // Check if financial terms are being updated (requires recalculation)
    const financialFieldsChanged = 
      req.body.principalAmount !== undefined ||
      req.body.interestRate !== undefined ||
      req.body.tenure !== undefined ||
      req.body.startDate !== undefined ||
      req.body.paymentDay !== undefined;

    // Update basic fields
    if (req.body.loanName !== undefined) loan.loanName = req.body.loanName;
    if (req.body.loanType !== undefined) loan.loanType = req.body.loanType;
    if (req.body.lender !== undefined) loan.lender = req.body.lender;
    if (req.body.financialInstitution !== undefined) loan.lender = req.body.financialInstitution;
    if (req.body.accountNumber !== undefined) loan.accountNumber = req.body.accountNumber;
    if (req.body.collateral !== undefined) loan.collateral = req.body.collateral;
    if (req.body.processingFee !== undefined) loan.processingFee = req.body.processingFee;
    if (req.body.prepaymentPenalty !== undefined) loan.prepaymentPenalty = req.body.prepaymentPenalty;
    if (req.body.insuranceAmount !== undefined) loan.insuranceAmount = req.body.insuranceAmount;

    // If financial fields changed, recalculate everything
    if (financialFieldsChanged) {
      const principalAmount = req.body.principalAmount !== undefined 
        ? req.body.principalAmount 
        : loan.principalAmount;
      const interestRate = req.body.interestRate !== undefined 
        ? req.body.interestRate 
        : loan.interestRate;
      const tenure = req.body.tenure !== undefined 
        ? req.body.tenure 
        : loan.tenure;
      const startDate = req.body.startDate !== undefined 
        ? new Date(req.body.startDate) 
        : loan.startDate;
      const paymentDay = req.body.paymentDay !== undefined 
        ? req.body.paymentDay 
        : loan.paymentDay;

      // Update loan financial fields
      loan.principalAmount = principalAmount;
      loan.interestRate = interestRate;
      loan.tenure = tenure;
      loan.startDate = startDate;
      loan.paymentDay = paymentDay;

      // Recalculate EMI and totals
      loan.emiAmount = loanCalc.calculateEMI(principalAmount, interestRate, tenure);
      loan.totalPayment = loanCalc.calculateTotalPayment(loan.emiAmount, tenure);
      loan.totalInterest = loanCalc.calculateTotalInterest(loan.totalPayment, principalAmount);

      // Recalculate end date
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + tenure);
      loan.endDate = endDate;

      // Recalculate next payment date
      loan.nextPaymentDate = loanCalc.calculateNextPaymentDate(paymentDay, startDate);

      // Reset remaining balance to principal (only if no payments have been made)
      const paymentsMade = await LoanPayment.countDocuments({ loanId: id });
      if (paymentsMade === 0) {
        loan.remainingBalance = principalAmount;
      }

      // Regenerate amortization schedule
      const newSchedule = loanCalc.generateAmortizationSchedule(
        principalAmount,
        interestRate,
        tenure,
        startDate
      );

      await AmortizationSchedule.findOneAndUpdate(
        { loanId: id },
        { 
          schedule: newSchedule,
          lastModified: new Date()
        },
        { upsert: true }
      );
    }

    await loan.save();

    // Create notification for loan update
    const userCurrency = req.user.currency || 'LKR';
    await Notification.create({
      userId,
      type: 'system',
      title: 'Loan Updated',
      message: `Loan "${loan.loanName}" has been updated successfully${financialFieldsChanged ? ' with recalculated EMI' : ''}`,
      read: false,
    });

    res.json({
      success: true,
      message: 'Loan updated successfully',
      loan,
    });
  } catch (error) {
    console.error('Update loan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating loan',
      error: error.message,
    });
  }
};

/**
 * Delete/close loan
 * DELETE /api/loans/:id
 */
export const deleteLoan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const loan = await Loan.findOne({ _id: id, userId });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    // Mark as closed instead of deleting
    loan.status = 'closed';
    await loan.save();

    res.json({
      success: true,
      message: 'Loan closed successfully',
    });
  } catch (error) {
    console.error('Delete loan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing loan',
      error: error.message,
    });
  }
};

/**
 * Calculate EMI (without creating loan)
 * POST /api/loans/calculate-emi
 */
export const calculateEMI = async (req, res) => {
  try {
    const { principal, interestRate, tenure } = req.body;

    if (!principal || !interestRate || !tenure) {
      return res.status(400).json({
        success: false,
        message: 'Principal, interest rate, and tenure are required',
      });
    }

    const emi = loanCalc.calculateEMI(principal, interestRate, tenure);
    const totalPayment = loanCalc.calculateTotalPayment(emi, tenure);
    const totalInterest = loanCalc.calculateTotalInterest(totalPayment, principal);

    res.json({
      success: true,
      calculation: {
        principal,
        interestRate,
        tenure,
        emiAmount: emi,
        totalPayment,
        totalInterest,
        effectiveInterestRate: interestRate,
      },
    });
  } catch (error) {
    console.error('Calculate EMI error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating EMI',
      error: error.message,
    });
  }
};

/**
 * Get amortization schedule for a loan
 * GET /api/loans/:id/amortization
 */
export const getAmortizationSchedule = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Verify loan belongs to user
    const loan = await Loan.findOne({ _id: id, userId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    let schedule = await AmortizationSchedule.findOne({ loanId: id });

    // If schedule doesn't exist, generate it on-the-fly
    if (!schedule) {
      console.log('Amortization schedule not found, generating on-the-fly for loan:', id);
      
      const scheduleData = loanCalc.generateAmortizationSchedule(
        loan.principalAmount,
        loan.interestRate,
        loan.tenure,
        new Date(loan.startDate)
      );

      // Create and save the schedule
      schedule = new AmortizationSchedule({
        loanId: loan._id,
        userId,
        schedule: scheduleData,
      });

      await schedule.save();
      console.log('Amortization schedule created successfully');
    }

    // Get statistics
    const stats = schedule.getStatistics();

    res.json({
      success: true,
      schedule: schedule.schedule,
      statistics: stats,
    });
  } catch (error) {
    console.error('Get amortization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching amortization schedule',
      error: error.message,
    });
  }
};

/**
 * Record a loan payment
 * POST /api/loans/:id/payments
 */
/**
 * Record a loan payment
 * POST /api/loans/:id/payments
 */
export const recordPayment = async (req, res) => {
  console.log('\n\n=================================');
  console.log('🚨 RECORD PAYMENT REQUEST RECEIVED');
  console.log('=================================\n');
  
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { paymentAmount, paymentDate, paymentType, notes, createTransaction } = req.body;

    console.log('=== Recording Payment ===');
    console.log('Loan ID:', id);
    console.log('User ID:', userId);
    console.log('Payment Data:', { paymentAmount, paymentDate, paymentType, notes, createTransaction });

    // Find loan
    const loan = await Loan.findOne({ _id: id, userId });
    if (!loan) {
      console.error('Loan not found');
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    console.log('Loan found:', loan.loanName, 'Status:', loan.status);

    // Check if loan is active
    if (loan.status !== 'active') {
      console.error('Loan is not active:', loan.status);
      return res.status(400).json({
        success: false,
        message: `Cannot record payment for ${loan.status} loan`,
      });
    }

    // Get amortization schedule
    let schedule = await AmortizationSchedule.findOne({ loanId: id });
    
    console.log('Schedule found:', !!schedule);

    // Auto-generate schedule if missing
    if (!schedule) {
      console.log('Generating amortization schedule...');
      const scheduleData = loanCalc.generateAmortizationSchedule(
        loan.principalAmount,
        loan.interestRate,
        loan.tenure,
        new Date(loan.startDate)
      );

      schedule = new AmortizationSchedule({
        loanId: id,
        userId,
        schedule: scheduleData,
      });

      await schedule.save();
      console.log('Schedule generated and saved');
    }

    const nextPayment = schedule.getNextPaymentDue();

    console.log('Next payment:', nextPayment);

    if (!nextPayment) {
      console.error('No pending payments found');
      return res.status(400).json({
        success: false,
        message: 'No pending payments found. Loan may be fully paid.',
      });
    }

    // Calculate principal and interest split
    const monthlyRate = loan.interestRate / 12 / 100;
    const { principal, interest } = loanCalc.calculatePrincipalAndInterest(
      loan.remainingBalance,
      monthlyRate,
      paymentAmount
    );

    console.log('Calculated split - Principal:', principal, 'Interest:', interest);

    // Create payment record
    const payment = new LoanPayment({
      loanId: id,
      userId,
      paymentDate: paymentDate || new Date(),
      paymentAmount,
      principalPaid: principal,
      interestPaid: interest,
      remainingBalance: Math.max(0, loan.remainingBalance - principal),
      paymentNumber: nextPayment.paymentNumber,
      paymentType: paymentType || 'regular',
      notes,
    });

    await payment.save();
    console.log('Payment record saved:', payment._id);

    // Update loan
    loan.remainingBalance = payment.remainingBalance;
    loan.lastPaymentDate = payment.paymentDate;

    // Calculate next payment date
    if (loan.remainingBalance > 0) {
      const paymentDay = new Date(loan.startDate).getDate();
      loan.nextPaymentDate = loanCalc.calculateNextPaymentDate(
        paymentDay,
        new Date(payment.paymentDate)
      );
    } else {
      loan.status = 'paid';
      loan.nextPaymentDate = null;
    }

    await loan.save();
    console.log('Loan updated - Remaining balance:', loan.remainingBalance, 'Status:', loan.status);

    // Mark payment as paid in schedule
    schedule.markPaymentPaid(nextPayment.paymentNumber, payment.paymentDate);
    await schedule.save();
    console.log('Schedule updated - Payment marked as paid');

    // Create transaction record if requested
    if (createTransaction !== false) {
      await Transaction.create({
        user: userId,
        amount: paymentAmount,
        category: 'Loan Payment',
        type: 'expense',
        date: payment.paymentDate,
        note: `Loan Payment - ${loan.loanName} (EMI #${nextPayment.paymentNumber})`,
      });
      console.log('Transaction record created');
    }

    // Create notification
    const userCurrency = req.user.currency || 'LKR';
    await Notification.create({
      userId,
      type: 'system',
      title: 'Payment Recorded',
      message: `Payment of ${formatCurrency(paymentAmount, userCurrency)} recorded for ${loan.loanName}`,
      read: false,
    });
    console.log('Notification created');

    console.log('=== Payment Recording Completed Successfully ===');

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      payment,
      loan,
    });
  } catch (error) {
    console.error('Record payment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message,
    });
  }
};

/**
 * Get payment history for a loan
 * GET /api/loans/:id/payments
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Verify loan belongs to user
    const loan = await Loan.findOne({ _id: id, userId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    const payments = await LoanPayment.find({ loanId: id }).sort({
      paymentDate: -1,
    });

    // Calculate summary
    const totalPaid = payments.reduce((sum, p) => sum + p.paymentAmount, 0);
    const totalPrincipalPaid = payments.reduce((sum, p) => sum + p.principalPaid, 0);
    const totalInterestPaid = payments.reduce((sum, p) => sum + p.interestPaid, 0);

    res.json({
      success: true,
      payments,
      summary: {
        totalPayments: payments.length,
        totalPaid,
        totalPrincipalPaid,
        totalInterestPaid,
      },
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message,
    });
  }
};

/**
 * Simulate extra payment impact
 * POST /api/loans/:id/simulate-extra-payment
 */
export const simulateExtraPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { extraAmount, frequency } = req.body;

    const loan = await Loan.findOne({ _id: id, userId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    const simulation = loanCalc.simulateExtraPayment(loan, extraAmount, frequency);

    res.json({
      success: true,
      simulation,
    });
  } catch (error) {
    console.error('Simulate extra payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error simulating extra payment',
      error: error.message,
    });
  }
};

/**
 * Calculate early payoff amount
 * GET /api/loans/:id/early-payoff
 */
export const getEarlyPayoffAmount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const loan = await Loan.findOne({ _id: id, userId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    const payoffDetails = loanCalc.calculateEarlyPayoffAmount(loan);

    res.json({
      success: true,
      payoffDetails,
    });
  } catch (error) {
    console.error('Get early payoff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating early payoff',
      error: error.message,
    });
  }
};

/**
 * Process prepayment
 * POST /api/loans/:id/prepayment
 */
export const processPrepayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { amount, notes } = req.body;

    const loan = await Loan.findOne({ _id: id, userId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    if (amount > loan.remainingBalance) {
      return res.status(400).json({
        success: false,
        message: 'Prepayment amount exceeds remaining balance',
      });
    }

    // Calculate penalty
    const penalty = (amount * loan.prepaymentPenalty) / 100;
    const totalAmount = amount + penalty;

    // Create payment record
    const payment = new LoanPayment({
      loanId: id,
      userId,
      paymentDate: new Date(),
      paymentAmount: totalAmount,
      principalPaid: amount,
      interestPaid: 0,
      lateFee: penalty,
      remainingBalance: Math.max(0, loan.remainingBalance - amount),
      paymentType: 'prepayment',
      notes: notes || 'Prepayment',
    });

    await payment.save();

    // Update loan
    const newBalance = loan.remainingBalance - amount;
    loan.remainingBalance = Math.max(0, newBalance);

    if (newBalance <= 0) {
      loan.status = 'paid';
      loan.nextPaymentDate = null;
    } else {
      // Recalculate schedule
      const newSchedule = loanCalc.recalculateScheduleAfterPrepayment(loan, amount);
      await AmortizationSchedule.findOneAndUpdate(
        { loanId: id },
        { schedule: newSchedule, lastModified: new Date() }
      );
    }

    await loan.save();

    // Create transaction
    await Transaction.create({
      user: userId,
      amount: totalAmount,
      category: 'Loan Prepayment',
      type: 'expense',
      date: new Date(),
      note: `Prepayment for ${loan.loanName}`,
    });

    // Send notification
    const userCurrency = req.user.currency || 'LKR';
    await Notification.create({
      userId,
      type: 'system',
      title: 'Prepayment Processed',
      message: `Prepayment of ${formatCurrency(amount, userCurrency)} processed for ${loan.loanName}`,
      read: false,
    });

    res.json({
      success: true,
      message: 'Prepayment processed successfully',
      payment,
      loan,
      penalty,
    });
  } catch (error) {
    console.error('Process prepayment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing prepayment',
      error: error.message,
    });
  }
};

/**
 * Get loans summary/analytics
 * GET /api/loans/analytics/summary
 */
export const getLoansSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Exclude closed loans from summary (soft delete)
    const loans = await Loan.find({ userId, status: { $ne: 'closed' } });
    const payments = await LoanPayment.find({ userId });

    // Calculate totals
    const totalLoans = loans.length;
    const activeLoans = loans.filter((l) => l.status === 'active').length;
    const paidOffLoans = loans.filter((l) => l.status === 'paid').length;

    const totalBorrowed = loans.reduce((sum, l) => sum + l.principalAmount, 0);
    const totalOutstanding = loans.reduce((sum, l) => sum + l.remainingBalance, 0);
    const totalMonthlyEmi = loans
      .filter((l) => l.status === 'active')
      .reduce((sum, l) => sum + l.emiAmount, 0);

    const totalPaidTillDate = payments.reduce((sum, p) => sum + p.paymentAmount, 0);
    const totalInterestPaid = payments.reduce((sum, p) => sum + p.interestPaid, 0);

    // Group by loan type
    const loansByType = loans.reduce((acc, loan) => {
      const type = loan.loanType;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          totalAmount: 0,
          outstanding: 0,
        };
      }
      acc[type].count++;
      acc[type].totalAmount += loan.principalAmount;
      acc[type].outstanding += loan.remainingBalance;
      return acc;
    }, {});

    // Upcoming payments (next 30 days)
    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingPayments = loans
      .filter(
        (l) =>
          l.status === 'active' &&
          l.nextPaymentDate &&
          new Date(l.nextPaymentDate) <= in30Days
      )
      .map((l) => ({
        loanId: l._id,
        loanName: l.loanName,
        amount: l.emiAmount,
        dueDate: l.nextPaymentDate,
      }))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    res.json({
      success: true,
      summary: {
        totalLoans,
        activeLoans,
        paidOffLoans,
        totalBorrowed,
        totalOutstanding,
        totalMonthlyEmi,
        totalPaidTillDate,
        totalInterestPaid,
        loansByType,
        upcomingPayments,
      },
    });
  } catch (error) {
    console.error('Get loans summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loans summary',
      error: error.message,
    });
  }
};

/**
 * Get overdue loans
 * GET /api/loans/overdue
 */
export const getOverdueLoans = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();

    const loans = await Loan.find({
      userId,
      status: 'active',
      nextPaymentDate: { $lt: today },
    }).sort({ nextPaymentDate: 1 });

    const overdueLoans = loans.map((loan) => {
      const dueStatus = loanCalc.checkPaymentDue(loan, today);
      return {
        ...loan.toObject(),
        daysOverdue: dueStatus.daysOverdue,
      };
    });

    res.json({
      success: true,
      count: overdueLoans.length,
      overdueLoans,
    });
  } catch (error) {
    console.error('Get overdue loans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue loans',
      error: error.message,
    });
  }
};

/**
 * Compare loan offers
 * POST /api/loans/compare
 */
export const compareLoans = async (req, res) => {
  try {
    const { offers } = req.body;

    if (!Array.isArray(offers) || offers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of loan offers',
      });
    }

    const comparisons = offers.map((offer) => {
      const emi = loanCalc.calculateEMI(
        offer.principal,
        offer.interestRate,
        offer.tenure
      );
      const totalPayment = loanCalc.calculateTotalPayment(emi, offer.tenure);
      const totalInterest = loanCalc.calculateTotalInterest(totalPayment, offer.principal);

      return {
        ...offer,
        emiAmount: emi,
        totalPayment,
        totalInterest,
        totalCost: totalPayment + (offer.processingFee || 0),
      };
    });

    // Sort by total cost (best offer first)
    comparisons.sort((a, b) => a.totalCost - b.totalCost);

    res.json({
      success: true,
      comparisons,
      bestOffer: comparisons[0],
    });
  } catch (error) {
    console.error('Compare loans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing loans',
      error: error.message,
    });
  }
};
