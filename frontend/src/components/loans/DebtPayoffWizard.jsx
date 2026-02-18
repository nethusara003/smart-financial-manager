import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import * as loanAPI from '../../services/api';
import { Sparkles, TrendingDown, DollarSign, Calendar, Zap, Target, ArrowRight } from 'lucide-react';

const DebtPayoffWizard = () => {
  const { formatCurrency } = useCurrency();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extraPayment, setExtraPayment] = useState('');
  const [snowballStrategy, setSnowballStrategy] = useState(null);
  const [avalancheStrategy, setAvalancheStrategy] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const response = await loanAPI.getLoans({ status: 'active' });
      setLoans(response.loans || []);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSnowball = () => {
    if (!extraPayment || loans.length === 0) return;

    const extra = parseFloat(extraPayment);
    const sortedLoans = [...loans].sort((a, b) => a.remainingBalance - b.remainingBalance);
    
    let totalMonths = 0;
    let totalInterestPaid = 0;
    const payoffOrder = [];
    
    sortedLoans.forEach((loan, index) => {
      const monthlyPayment = loan.emiAmount + (index === 0 ? extra : 0);
      const monthsToPayoff = Math.ceil(loan.remainingBalance / monthlyPayment);
      const interestPaid = (monthlyPayment * monthsToPayoff) - loan.remainingBalance;
      
      totalMonths = Math.max(totalMonths, monthsToPayoff);
      totalInterestPaid += interestPaid;
      
      payoffOrder.push({
        ...loan,
        payoffMonth: monthsToPayoff,
        monthlyPayment,
        interestPaid,
        order: index + 1
      });
    });

    setSnowballStrategy({
      method: 'Snowball',
      description: 'Pay off smallest balance first',
      loans: payoffOrder,
      totalMonths,
      totalInterestPaid,
      motivation: 'Quick wins boost motivation'
    });
  };

  const calculateAvalanche = () => {
    if (!extraPayment || loans.length === 0) return;

    const extra = parseFloat(extraPayment);
    const sortedLoans = [...loans].sort((a, b) => b.interestRate - a.interestRate);
    
    let totalMonths = 0;
    let totalInterestPaid = 0;
    const payoffOrder = [];
    
    sortedLoans.forEach((loan, index) => {
      const monthlyPayment = loan.emiAmount + (index === 0 ? extra : 0);
      const monthsToPayoff = Math.ceil(loan.remainingBalance / monthlyPayment);
      const interestPaid = (monthlyPayment * monthsToPayoff) - loan.remainingBalance;
      
      totalMonths = Math.max(totalMonths, monthsToPayoff);
      totalInterestPaid += interestPaid;
      
      payoffOrder.push({
        ...loan,
        payoffMonth: monthsToPayoff,
        monthlyPayment,
        interestPaid,
        order: index + 1
      });
    });

    setAvalancheStrategy({
      method: 'Avalanche',
      description: 'Pay off highest interest rate first',
      loans: payoffOrder,
      totalMonths,
      totalInterestPaid,
      motivation: 'Maximum interest savings'
    });
  };

  const handleCalculate = () => {
    calculateSnowball();
    calculateAvalanche();
  };

  const getBestStrategy = () => {
    if (!snowballStrategy || !avalancheStrategy) return null;
    
    if (avalancheStrategy.totalInterestPaid < snowballStrategy.totalInterestPaid) {
      return 'avalanche';
    }
    return 'snowball';
  };

  const bestStrategy = getBestStrategy();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Active Loans
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          You need to have active loans to use the debt payoff wizard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Sparkles className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold">Debt Payoff Strategy Wizard</h1>
            <p className="text-purple-100">
              Discover the fastest path to becoming debt-free with personalized strategies
            </p>
          </div>
        </div>
      </div>

      {/* Current Loans Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Your Active Loans
        </h2>
        <div className="space-y-3 mb-6">
          {loans.map((loan) => (
            <div 
              key={loan._id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{loan.loanName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {loan.interestRate}% interest rate • {formatCurrency(loan.emiAmount)}/month
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(loan.remainingBalance)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">remaining</p>
              </div>
            </div>
          ))}
        </div>

        {/* Extra Payment Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Extra Monthly Payment Amount ({formatCurrency(0).replace('0', '').trim()})
          </label>
          <div className="flex gap-4">
            <input
              type="number"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
              placeholder="5000"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleCalculate}
              disabled={!extraPayment}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Calculate Strategies
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter the extra amount you can afford to pay each month beyond your regular EMIs
          </p>
        </div>
      </div>

      {/* Strategy Comparison */}
      {snowballStrategy && avalancheStrategy && (
        <div className="space-y-6">
          {/* Comparison Banner */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Strategy Comparison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Interest Savings</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(Math.abs(snowballStrategy.totalInterestPaid - avalancheStrategy.totalInterestPaid))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {bestStrategy === 'avalanche' ? 'Avalanche saves more' : 'Similar savings'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Difference</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.abs(snowballStrategy.totalMonths - avalancheStrategy.totalMonths)} months
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {snowballStrategy.totalMonths < avalancheStrategy.totalMonths ? 'Snowball is faster' : 'Avalanche is faster'}
                </p>
              </div>
            </div>
          </div>

          {/* Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Snowball Strategy */}
            <div
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
                bestStrategy === 'snowball' ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">🔥 Snowball Method</h3>
                  {bestStrategy === 'snowball' && (
                    <span className="px-3 py-1 bg-green-500 rounded-full text-sm font-semibold">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-orange-100">{snowballStrategy.description}</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Interest</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(snowballStrategy.totalInterestPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Debt-Free In</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {snowballStrategy.totalMonths} months
                    </p>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Payoff Order:</h4>
                <div className="space-y-2">
                  {snowballStrategy.loans.map((loan) => (
                    <div key={loan._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        {loan.order}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.loanName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatCurrency(loan.remainingBalance)} • {loan.interestRate}%
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Month {loan.payoffMonth}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>💪 Best for:</strong> Psychological wins and motivation. Pay off smallest loans first to see progress quickly.
                  </p>
                </div>
              </div>
            </div>

            {/* Avalanche Strategy */}
            <div
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
                bestStrategy === 'avalanche' ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">⚡ Avalanche Method</h3>
                  {bestStrategy === 'avalanche' && (
                    <span className="px-3 py-1 bg-green-500 rounded-full text-sm font-semibold">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-blue-100">{avalancheStrategy.description}</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Interest</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(avalancheStrategy.totalInterestPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Debt-Free In</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {avalancheStrategy.totalMonths} months
                    </p>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Payoff Order:</h4>
                <div className="space-y-2">
                  {avalancheStrategy.loans.map((loan) => (
                    <div key={loan._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {loan.order}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.loanName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatCurrency(loan.remainingBalance)} • {loan.interestRate}%
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Month {loan.payoffMonth}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>💰 Best for:</strong> Maximum savings. Pay off highest interest rates first to minimize total interest paid.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📊 Our Recommendation
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {bestStrategy === 'avalanche' ? (
                <>
                  The <strong className="text-blue-600 dark:text-blue-400">Avalanche Method</strong> will save you{' '}
                  <strong>{formatCurrency(Math.abs(snowballStrategy.totalInterestPaid - avalancheStrategy.totalInterestPaid))}</strong>{' '}
                  in interest compared to the Snowball method. This is the most mathematically efficient approach.
                </>
              ) : (
                <>
                  Both methods result in similar interest costs. The <strong className="text-orange-600 dark:text-orange-400">Snowball Method</strong>{' '}
                  may be better for you if you value quick psychological wins and motivation from paying off smaller debts first.
                </>
              )}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedStrategy('snowball')}
                className="flex-1 px-4 py-3 border-2 border-orange-500 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                Choose Snowball
              </button>
              <button
                onClick={() => setSelectedStrategy('avalanche')}
                className="flex-1 px-4 py-3 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Choose Avalanche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtPayoffWizard;
