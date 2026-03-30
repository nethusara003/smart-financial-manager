import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../ui';
import { Calculator, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as loanAPI from '../../services/api';

const RefinancingCalculator = ({ existingLoan = null }) => {
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [formData, setFormData] = useState({
    currentPrincipal: existingLoan?.remainingBalance?.toString() || '',
    currentRate: existingLoan?.interestRate?.toString() || '',
    remainingTenure: existingLoan ? Math.ceil((new Date(existingLoan.endDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)) : '',
    newRate: '',
    newTenure: '',
    refinancingFee: '',
    prepaymentPenalty: existingLoan?.prepaymentPenalty?.toString() || '0'
  });

  const [currentLoanDetails, setCurrentLoanDetails] = useState(null);
  const [newLoanDetails, setNewLoanDetails] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (existingLoan) {
      const remainingMonths = Math.ceil((new Date(existingLoan.endDate) - new Date()) / (1000 * 60 * 60 * 24 * 30));
      setFormData(prev => ({
        ...prev,
        currentPrincipal: existingLoan.remainingBalance.toString(),
        currentRate: existingLoan.interestRate.toString(),
        remainingTenure: remainingMonths.toString(),
        prepaymentPenalty: existingLoan.prepaymentPenalty?.toString() || '0'
      }));
    }
  }, [existingLoan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateRefinancing = async () => {
    // Validate input values
    const currentPrincipal = parseFloat(formData.currentPrincipal);
    const currentRate = parseFloat(formData.currentRate);
    const remainingTenure = parseInt(formData.remainingTenure);
    const newRate = parseFloat(formData.newRate);
    
    if (isNaN(currentPrincipal) || currentPrincipal <= 0 ||
        isNaN(currentRate) || currentRate <= 0 ||
        isNaN(remainingTenure) || remainingTenure <= 0 ||
        isNaN(newRate) || newRate <= 0) {
      toast.warning('Please enter valid positive numbers for all required fields');
      return;
    }
    
    setCalculating(true);
    try {
      // Calculate current loan details
      const currentResponse = await loanAPI.calculateEMI(
        currentPrincipal,
        currentRate,
        remainingTenure
      );

      // Calculate new loan details
      const newTenure = formData.newTenure ? parseInt(formData.newTenure) : remainingTenure;
      const newResponse = await loanAPI.calculateEMI(
        currentPrincipal,
        newRate,
        newTenure
      );

      const refinancingFee = formData.refinancingFee ? parseFloat(formData.refinancingFee) : 0;
      const prepaymentPenalty = formData.prepaymentPenalty ? 
        (currentPrincipal * parseFloat(formData.prepaymentPenalty) / 100) : 0;

      const currentTotalCost = currentResponse.calculation.totalAmount;
      const newTotalCost = newResponse.calculation.totalAmount + refinancingFee + prepaymentPenalty;

      const monthlySavings = currentResponse.calculation.emiAmount - newResponse.calculation.emiAmount;
      const totalSavings = currentTotalCost - newTotalCost;
      const breakEvenMonths = totalSavings > 0 ? Math.ceil((refinancingFee + prepaymentPenalty) / monthlySavings) : null;

      setCurrentLoanDetails(currentResponse.calculation);
      setNewLoanDetails(newResponse.calculation);
      setComparison({
        currentTotalCost,
        newTotalCost,
        monthlySavings,
        totalSavings,
        refinancingFee,
        prepaymentPenalty,
        upfrontCost: refinancingFee + prepaymentPenalty,
        breakEvenMonths,
        recommended: totalSavings > 0 && (breakEvenMonths === null || breakEvenMonths < newTenure)
      });
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error('Failed to calculate refinancing details');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
          <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Refinancing Calculator
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Evaluate if refinancing your loan makes financial sense
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-6 mb-6">
        {/* Current Loan Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Loan Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remaining Principal ({formatCurrency(0).replace('0', '').trim()})
              </label>
              <input
                type="number"
                name="currentPrincipal"
                value={formData.currentPrincipal}
                onChange={handleChange}
                placeholder="500000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                name="currentRate"
                value={formData.currentRate}
                onChange={handleChange}
                placeholder="10.5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remaining Tenure (months)
              </label>
              <input
                type="number"
                name="remainingTenure"
                value={formData.remainingTenure}
                onChange={handleChange}
                placeholder="36"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* New Loan Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Refinancing Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Interest Rate (% p.a.) *
              </label>
              <input
                type="number"
                name="newRate"
                value={formData.newRate}
                onChange={handleChange}
                placeholder="8.5"
                step="0.1"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Tenure (months, optional)
                <span className="text-xs text-gray-500 ml-2">Leave blank to keep same</span>
              </label>
              <input
                type="number"
                name="newTenure"
                value={formData.newTenure}
                onChange={handleChange}
                placeholder={formData.remainingTenure}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Fees and Penalties */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Costs & Penalties
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Refinancing Fee ({formatCurrency(0).replace('0', '').trim()})
              </label>
              <input
                type="number"
                name="refinancingFee"
                value={formData.refinancingFee}
                onChange={handleChange}
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prepayment Penalty (%)
              </label>
              <input
                type="number"
                name="prepaymentPenalty"
                value={formData.prepaymentPenalty}
                onChange={handleChange}
                placeholder="2"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <button
          onClick={calculateRefinancing}
          disabled={calculating || !formData.currentPrincipal || !formData.currentRate || !formData.remainingTenure || !formData.newRate}
          className="w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          <TrendingDown className="w-5 h-5" />
          {calculating ? 'Calculating...' : 'Calculate Refinancing'}
        </button>
      </div>

      {/* Results */}
      {comparison && (
        <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          {/* Recommendation Banner */}
          {comparison.recommended ? (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-300 mb-1">
                  ✅ Refinancing Recommended
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Refinancing will save you {formatCurrency(comparison.totalSavings)} over the loan tenure.
                  {comparison.breakEvenMonths && ` You'll break even in ${comparison.breakEvenMonths} months.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-1">
                  ⚠️ Refinancing Not Recommended
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  The costs of refinancing outweigh the potential savings. You might pay {formatCurrency(Math.abs(comparison.totalSavings))} more.
                </p>
              </div>
            </div>
          )}

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Loan */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                Current Loan
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monthly EMI:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(currentLoanDetails.emiAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Interest:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">{formatCurrency(currentLoanDetails.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Repayment:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(comparison.currentTotalCost)}</span>
                </div>
              </div>
            </div>

            {/* New Loan */}
            <div className="border-2 border-purple-500 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                After Refinancing
                <span className="text-xs text-purple-600 dark:text-purple-400 font-normal">(New)</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monthly EMI:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(newLoanDetails.emiAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Interest:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">{formatCurrency(newLoanDetails.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Upfront Costs:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(comparison.upfrontCost)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-600 dark:text-gray-400">Total Repayment:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(comparison.newTotalCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Savings Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Savings</p>
                <p className={`text-2xl font-bold ${comparison.monthlySavings > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(Math.abs(comparison.monthlySavings))}
                  {comparison.monthlySavings < 0 && ' more'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Savings</p>
                <p className={`text-2xl font-bold ${comparison.totalSavings > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(Math.abs(comparison.totalSavings))}
                  {comparison.totalSavings < 0 && ' loss'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Break-Even Point</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {comparison.breakEvenMonths ? `${comparison.breakEvenMonths} months` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefinancingCalculator;
