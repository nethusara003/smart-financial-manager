/**
 * Loan Calculation Service
 * Provides mathematical calculations for loan EMI, amortization, and analysis
 */

/**
 * Calculate EMI using the standard formula
 * EMI = [P × R × (1+R)^N] / [(1+R)^N-1]
 * @param {Number} principal - Loan principal amount
 * @param {Number} annualRate - Annual interest rate (percentage)
 * @param {Number} tenureMonths - Loan tenure in months
 * @returns {Number} Monthly EMI amount
 */
export const calculateEMI = (principal, annualRate, tenureMonths) => {
  // Convert annual rate to monthly decimal
  const monthlyRate = annualRate / 12 / 100;
  
  // If interest rate is 0, EMI is simply principal divided by tenure
  if (monthlyRate === 0) {
    return Math.round((principal / tenureMonths) * 100) / 100;
  }
  
  // Apply EMI formula
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  
  // Round to 2 decimal places
  return Math.round(emi * 100) / 100;
};

/**
 * Calculate total payment amount
 * @param {Number} emi - Monthly EMI
 * @param {Number} tenure - Tenure in months
 * @returns {Number} Total payment amount
 */
export const calculateTotalPayment = (emi, tenure) => {
  return Math.round(emi * tenure * 100) / 100;
};

/**
 * Calculate total interest paid
 * @param {Number} totalPayment - Total amount to be paid
 * @param {Number} principal - Principal amount
 * @returns {Number} Total interest amount
 */
export const calculateTotalInterest = (totalPayment, principal) => {
  return Math.round((totalPayment - principal) * 100) / 100;
};

/**
 * Calculate principal and interest components for a payment
 * @param {Number} remainingBalance - Current outstanding balance
 * @param {Number} monthlyRate - Monthly interest rate (decimal)
 * @param {Number} emi - Monthly EMI amount
 * @returns {Object} { principal, interest }
 */
export const calculatePrincipalAndInterest = (
  remainingBalance,
  monthlyRate,
  emi
) => {
  // Interest for current month
  const interest = Math.round(remainingBalance * monthlyRate * 100) / 100;
  
  // Remaining amount goes to principal
  const principal = Math.round((emi - interest) * 100) / 100;
  
  return { principal, interest };
};

/**
 * Generate complete amortization schedule
 * @param {Number} principal - Loan principal amount
 * @param {Number} annualRate - Annual interest rate (percentage)
 * @param {Number} tenure - Tenure in months
 * @param {Date} startDate - Loan start date
 * @returns {Array} Array of payment objects
 */
export const generateAmortizationSchedule = (
  principal,
  annualRate,
  tenure,
  startDate
) => {
  const schedule = [];
  const emi = calculateEMI(principal, annualRate, tenure);
  const monthlyRate = annualRate / 12 / 100;
  
  let remainingBalance = principal;
  const start = new Date(startDate);
  
  for (let i = 1; i <= tenure; i++) {
    // Calculate payment date (same day each month)
    const paymentDate = new Date(
      start.getFullYear(),
      start.getMonth() + i,
      start.getDate()
    );
    
    // Calculate interest and principal for this payment
    const { principal: principalPaid, interest: interestPaid } =
      calculatePrincipalAndInterest(remainingBalance, monthlyRate, emi);
    
    // Update remaining balance
    remainingBalance = Math.max(0, remainingBalance - principalPaid);
    
    // For last payment, adjust to account for rounding
    const isLastPayment = i === tenure;
    const adjustedEmi = isLastPayment
      ? principalPaid + interestPaid
      : emi;
    const adjustedPrincipal = isLastPayment ? remainingBalance + principalPaid : principalPaid;
    const adjustedBalance = isLastPayment ? 0 : remainingBalance;
    
    schedule.push({
      paymentNumber: i,
      paymentDate,
      emiAmount: Math.round(adjustedEmi * 100) / 100,
      principalAmount: Math.round(adjustedPrincipal * 100) / 100,
      interestAmount: Math.round(interestPaid * 100) / 100,
      remainingBalance: Math.round(adjustedBalance * 100) / 100,
      isPaid: false,
      actualPaymentDate: null,
    });
    
    remainingBalance = adjustedBalance;
  }
  
  return schedule;
};

/**
 * Calculate early payoff amount
 * @param {Object} loan - Loan object
 * @param {Date} currentDate - Date for payoff calculation
 * @returns {Object} Payoff details
 */
export const calculateEarlyPayoffAmount = (loan, currentDate = new Date()) => {
  const payoffAmount = loan.remainingBalance;
  const penalty = (payoffAmount * loan.prepaymentPenalty) / 100;
  const totalPayoff = payoffAmount + penalty;
  
  return {
    remainingBalance: Math.round(payoffAmount * 100) / 100,
    prepaymentPenalty: Math.round(penalty * 100) / 100,
    totalPayoffAmount: Math.round(totalPayoff * 100) / 100,
    payoffDate: currentDate,
  };
};

/**
 * Simulate extra payment impact
 * @param {Object} loan - Loan object
 * @param {Number} extraAmount - Extra payment amount
 * @param {String} frequency - Frequency of extra payment ('monthly', 'one-time')
 * @returns {Object} Simulation results
 */
export const simulateExtraPayment = (loan, extraAmount, frequency = "monthly") => {
  const originalTenure = loan.tenure;
  const originalEmi = loan.emiAmount;
  const monthlyRate = loan.interestRate / 12 / 100;
  
  let remainingBalance = loan.remainingBalance;
  let monthsPaid = 0;
  let totalInterestPaid = 0;
  
  // Simulate payments with extra amount
  while (remainingBalance > 0 && monthsPaid < originalTenure) {
    monthsPaid++;
    
    const { principal, interest } = calculatePrincipalAndInterest(
      remainingBalance,
      monthlyRate,
      originalEmi
    );
    
    totalInterestPaid += interest;
    
    // Apply extra payment
    const extraForThisMonth = frequency === "monthly" ? extraAmount : 
                              (frequency === "one-time" && monthsPaid === 1 ? extraAmount : 0);
    
    const totalPrincipalPaid = principal + extraForThisMonth;
    remainingBalance = Math.max(0, remainingBalance - totalPrincipalPaid);
  }
  
  const originalTotalInterest = loan.totalInterest;
  const interestSaved = originalTotalInterest - totalInterestPaid;
  const timeSaved = originalTenure - monthsPaid;
  
  return {
    newTenure: monthsPaid,
    originalTenure,
    monthsSaved: timeSaved,
    newTotalInterest: Math.round(totalInterestPaid * 100) / 100,
    originalTotalInterest: Math.round(originalTotalInterest * 100) / 100,
    interestSaved: Math.round(interestSaved * 100) / 100,
    extraPaymentAmount: extraAmount,
    frequency,
  };
};

/**
 * Calculate remaining balance from payments
 * @param {Object} loan - Loan object
 * @param {Array} payments - Array of payment records
 * @returns {Number} Current remaining balance
 */
export const calculateRemainingBalance = (loan, payments) => {
  const totalPrincipalPaid = payments.reduce(
    (sum, payment) => sum + payment.principalPaid,
    0
  );
  
  return Math.max(0, loan.principalAmount - totalPrincipalPaid);
};

/**
 * Check if payment is due
 * @param {Object} loan - Loan object
 * @param {Date} currentDate - Current date
 * @returns {Object} Due status
 */
export const checkPaymentDue = (loan, currentDate = new Date()) => {
  if (!loan.nextPaymentDate) {
    return { isDue: false, daysOverdue: 0 };
  }
  
  const nextPayment = new Date(loan.nextPaymentDate);
  const today = new Date(currentDate);
  
  // Reset time part for accurate day comparison
  nextPayment.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - nextPayment.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    isDue: diffDays >= 0,
    daysOverdue: Math.max(0, diffDays),
    nextPaymentDate: loan.nextPaymentDate,
  };
};

/**
 * Calculate loan-to-value ratio
 * @param {Number} loanAmount - Loan amount
 * @param {Number} assetValue - Asset value
 * @returns {Number} LTV ratio percentage
 */
export const calculateLoanToValueRatio = (loanAmount, assetValue) => {
  if (assetValue === 0) return 0;
  return Math.round((loanAmount / assetValue) * 100 * 100) / 100;
};

/**
 * Recalculate schedule after prepayment
 * @param {Object} loan - Loan object
 * @param {Number} prepaymentAmount - Prepayment amount
 * @returns {Array} New amortization schedule
 */
export const recalculateScheduleAfterPrepayment = (loan, prepaymentAmount) => {
  const newPrincipal = Math.max(0, loan.remainingBalance - prepaymentAmount);
  
  if (newPrincipal === 0) {
    return []; // Loan fully paid off
  }
  
  // Calculate new tenure based on original EMI
  const monthlyRate = loan.interestRate / 12 / 100;
  
  let newTenure = 0;
  let balance = newPrincipal;
  
  // Calculate how many months needed to pay off with original EMI
  while (balance > 0 && newTenure < loan.tenure) {
    newTenure++;
    const { principal } = calculatePrincipalAndInterest(
      balance,
      monthlyRate,
      loan.emiAmount
    );
    balance = Math.max(0, balance - principal);
  }
  
  // Generate new schedule
  const today = new Date();
  return generateAmortizationSchedule(
    newPrincipal,
    loan.interestRate,
    newTenure,
    today
  );
};

/**
 * Calculate effective interest rate (including fees)
 * @param {Object} loan - Loan object
 * @returns {Number} Effective interest rate
 */
export const calculateEffectiveInterestRate = (loan) => {
  const totalCost =
    loan.totalInterest + loan.processingFee + (loan.insuranceAmount || 0);
  const effectiveRate =
    (totalCost / loan.principalAmount / (loan.tenure / 12)) * 100;
  
  return Math.round(effectiveRate * 100) / 100;
};

/**
 * Calculate next payment date based on payment day
 * @param {Number} paymentDay - Day of month for payment (1-31)
 * @param {Date} fromDate - Reference date (default: today)
 * @returns {Date} Next payment date
 */
export const calculateNextPaymentDate = (paymentDay, fromDate = new Date()) => {
  const today = new Date(fromDate);
  const currentDay = today.getDate();
  
  let nextPayment = new Date(today);
  
  // If payment day hasn't passed this month, use this month
  if (currentDay < paymentDay) {
    nextPayment.setDate(paymentDay);
  } else {
    // Otherwise, next month
    nextPayment.setMonth(nextPayment.getMonth() + 1);
    nextPayment.setDate(paymentDay);
  }
  
  return nextPayment;
};
