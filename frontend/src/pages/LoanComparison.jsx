import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Trash2, TrendingDown, DollarSign, Calendar, Percent } from 'lucide-react';
import * as loanAPI from '../services/api';

const LoanComparison = () => {
  const { formatCurrency } = useCurrency();
  const [loanOffers, setLoanOffers] = useState([
    { id: 1, name: 'Loan Offer 1', principal: '', rate: '', tenure: '', tenureUnit: 'months', processingFee: '', prepaymentPenalty: '', calculated: null },
    { id: 2, name: 'Loan Offer 2', principal: '', rate: '', tenure: '', tenureUnit: 'months', processingFee: '', prepaymentPenalty: '', calculated: null }
  ]);
  const [calculating, setCalculating] = useState(false);

  const addLoanOffer = () => {
    const newId = Math.max(...loanOffers.map(l => l.id)) + 1;
    setLoanOffers([...loanOffers, {
      id: newId,
      name: `Loan Offer ${newId}`,
      principal: '',
      rate: '',
      tenure: '',
      tenureUnit: 'months',
      processingFee: '',
      prepaymentPenalty: '',
      calculated: null
    }]);
  };

  const removeLoanOffer = (id) => {
    if (loanOffers.length > 2) {
      setLoanOffers(loanOffers.filter(loan => loan.id !== id));
    }
  };

  const updateLoanOffer = (id, field, value) => {
    setLoanOffers(loanOffers.map(loan =>
      loan.id === id ? { ...loan, [field]: value } : loan
    ));
  };

  const calculateAllLoans = async () => {
    setCalculating(true);
    try {
      const updatedLoans = await Promise.all(
        loanOffers.map(async (loan) => {
          if (loan.principal && loan.rate && loan.tenure) {
            try {
              const principal = parseFloat(loan.principal);
              const rate = parseFloat(loan.rate);
              const tenure = parseInt(loan.tenure);
              
              // Validate parsed values
              if (isNaN(principal) || principal <= 0 ||
                  isNaN(rate) || rate <= 0 ||
                  isNaN(tenure) || tenure <= 0) {
                return { ...loan, calculated: { error: 'Invalid input values' } };
              }
              
              const tenureInMonths = loan.tenureUnit === 'years' ? tenure * 12 : tenure;
              
              const response = await loanAPI.calculateEMI(principal, rate, tenureInMonths);

              const processingFee = loan.processingFee ? parseFloat(loan.processingFee) : 0;
              const totalCost = response.calculation.totalAmount + processingFee;

              return {
                ...loan,
                calculated: {
                  ...response.calculation,
                  tenureInMonths,
                  processingFee,
                  totalCost,
                  prepaymentPenalty: loan.prepaymentPenalty ? parseFloat(loan.prepaymentPenalty) : 0
                }
              };
            } catch {
              return { ...loan, calculated: { error: 'Calculation failed' } };
            }
          }
          return loan;
        })
      );
      setLoanOffers(updatedLoans);
    } catch (error) {
      console.error('Error calculating loans:', error);
    } finally {
      setCalculating(false);
    }
  };

  const getBestLoan = () => {
    const validLoans = loanOffers.filter(loan => loan.calculated && !loan.calculated.error);
    if (validLoans.length === 0) return null;
    
    return validLoans.reduce((best, current) => 
      current.calculated.totalCost < best.calculated.totalCost ? current : best
    );
  };

  const bestLoan = getBestLoan();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Loan Comparison Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare multiple loan offers side by side to find the best deal
        </p>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {loanOffers.map((loan) => (
          <div 
            key={loan.id} 
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
              bestLoan && bestLoan.id === loan.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                value={loan.name}
                onChange={(e) => updateLoanOffer(loan.id, 'name', e.target.value)}
                className="text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
              />
              <div className="flex items-center gap-2">
                {bestLoan && bestLoan.id === loan.id && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                    Best Deal
                  </span>
                )}
                {loanOffers.length > 2 && (
                  <button
                    onClick={() => removeLoanOffer(loan.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Principal Amount ({formatCurrency(0).replace('0', '').trim()})
                </label>
                <input
                  type="number"
                  value={loan.principal}
                  onChange={(e) => updateLoanOffer(loan.id, 'principal', e.target.value)}
                  placeholder="500000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Percent className="w-4 h-4 inline mr-1" />
                  Interest Rate (% p.a.)
                </label>
                <input
                  type="number"
                  value={loan.rate}
                  onChange={(e) => updateLoanOffer(loan.id, 'rate', e.target.value)}
                  placeholder="8.5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Tenure
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={loan.tenure}
                    onChange={(e) => updateLoanOffer(loan.id, 'tenure', e.target.value)}
                    placeholder="60"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    value={loan.tenureUnit}
                    onChange={(e) => updateLoanOffer(loan.id, 'tenureUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Processing Fee ({formatCurrency(0).replace('0', '').trim()})
                </label>
                <input
                  type="number"
                  value={loan.processingFee}
                  onChange={(e) => updateLoanOffer(loan.id, 'processingFee', e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prepayment Penalty (%)
                </label>
                <input
                  type="number"
                  value={loan.prepaymentPenalty}
                  onChange={(e) => updateLoanOffer(loan.id, 'prepaymentPenalty', e.target.value)}
                  placeholder="2"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Results */}
            {loan.calculated && !loan.calculated.error && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Monthly EMI</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(loan.calculated.emiAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Interest</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(loan.calculated.totalInterest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Repayment</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(loan.calculated.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Cost</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(loan.calculated.totalCost)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {loan.calculated && loan.calculated.error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                {loan.calculated.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={addLoanOffer}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
        >
          <Plus className="w-5 h-5" />
          Add Another Loan
        </button>
        <button
          onClick={calculateAllLoans}
          disabled={calculating}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          <TrendingDown className="w-5 h-5" />
          {calculating ? 'Calculating...' : 'Compare All Loans'}
        </button>
      </div>

      {/* Summary Comparison Table */}
      {bestLoan && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Comparison Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Loan Offer</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Monthly EMI</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Total Interest</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Processing Fee</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Total Cost</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loanOffers.filter(loan => loan.calculated && !loan.calculated.error).map(loan => {
                  const savings = loan.calculated.totalCost - bestLoan.calculated.totalCost;
                  return (
                    <tr 
                      key={loan.id}
                      className={loan.id === bestLoan.id ? 'bg-green-50 dark:bg-green-900/10' : ''}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {loan.name}
                        {loan.id === bestLoan.id && (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Best</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(loan.calculated.emiAmount)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(loan.calculated.totalInterest)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(loan.calculated.processingFee)}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatCurrency(loan.calculated.totalCost)}</td>
                      <td className="px-4 py-3 text-center">
                        {savings === 0 ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">Best!</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">
                            +{formatCurrency(savings)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="text-blue-600 dark:text-blue-400">💡 Tip:</strong> The "Best Deal" is determined by the lowest total cost 
              (including principal, interest, and processing fees). Consider other factors like prepayment flexibility, 
              lender reputation, and additional benefits when making your final decision.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanComparison;
