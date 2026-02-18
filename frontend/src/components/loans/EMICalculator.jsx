import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import * as loanAPI from '../../services/api';
import { DollarSign, Calendar, TrendingUp, PieChart } from 'lucide-react';

const EMICalculator = () => {
  const { formatCurrency, formatCompact } = useCurrency();
  const [principal, setPrincipal] = useState(500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(60);
  const [tenureUnit, setTenureUnit] = useState('months');
  const [result, setResult] = useState(null);

  useEffect(() => {
    calculateEMI();
  }, [principal, interestRate, tenure, tenureUnit]);

  const calculateEMI = async () => {
    if (!principal || !interestRate || !tenure || 
        isNaN(principal) || principal <= 0 ||
        isNaN(interestRate) || interestRate <= 0 ||
        isNaN(tenure) || tenure <= 0) return;

    try {
      const tenureInMonths = tenureUnit === 'years' ? tenure * 12 : tenure;
      const response = await loanAPI.calculateEMI(principal, interestRate, tenureInMonths);
      setResult(response.calculation);
    } catch (err) {
      console.error('EMI calculation failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              EMI Calculator
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Calculate your loan EMI in seconds
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Principal Amount */}
            <div>
              <label className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loan Amount
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {formatCurrency(principal)}
                </span>
              </label>
              <input
                type="range"
                min="10000"
                max="10000000"
                step="10000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatCompact(10000)}</span>
                <span>{formatCompact(10000000)}</span>
              </div>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full mt-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
            </div>

            {/* Interest Rate */}
            <div>
              <label className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Interest Rate (% p.a.)
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {interestRate}%
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span>30%</span>
              </div>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                step="0.1"
                className="w-full mt-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
            </div>

            {/* Tenure */}
            <div>
              <label className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loan Tenure
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {tenure} {tenureUnit}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max={tenureUnit === 'years' ? 30 : 360}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 {tenureUnit === 'years' ? 'yr' : 'mo'}</span>
                <span>{tenureUnit === 'years' ? '30 yrs' : '360 mos'}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
                <select
                  value={tenureUnit}
                  onChange={(e) => setTenureUnit(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                >
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className="space-y-6">
              {/* EMI Amount */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Monthly EMI
                </p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(result.emiAmount)}
                </p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Principal Amount</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(result.principal)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Interest</p>
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(result.totalInterest)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Payment</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(result.totalPayment)}
                  </p>
                </div>
              </div>

              {/* Visual Breakdown */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Payment Breakdown
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all"
                        style={{
                          width: `${(result.principal / result.totalPayment) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-16 text-right">
                      {Math.round((result.principal / result.totalPayment) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Principal</span>
                    <span className="text-gray-600 dark:text-gray-400">Interest</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  💡 Tip: Making extra payments can significantly reduce your interest burden and help you pay off the loan faster.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;
