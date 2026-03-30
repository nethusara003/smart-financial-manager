import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Heart, TrendingUp, AlertCircle, CheckCircle, Target, DollarSign, CreditCard } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { API_BASE_URL } from '../services/apiClient';

const FinancialHealth = () => {
  const { formatCurrency } = useCurrency();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeSpan, setTimeSpan] = useState(1); // Default to 1 month

  const fetchHealthScore = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/financial-health/score?months=${timeSpan}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('✅ Financial Health Response:', response.data);
      
      // Check if response has success: false
      if (response.data.success === false) {
        setError(response.data.message || 'Unable to calculate financial health');
        setHealthData(null);
        setLoading(false);
        return;
      }
      
      setHealthData(response.data);
    } catch (err) {
      console.error('❌ Financial Health Error:', err);
      console.error('❌ Response data:', err.response?.data);
      console.error('❌ Full error object:', JSON.stringify(err.response?.data, null, 2));
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to fetch health score';
      setError(errorMsg);
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  }, [timeSpan]);

  useEffect(() => {
    const loadHealthScore = async () => {
      await fetchHealthScore();
    };

    loadHealthScore();
  }, [fetchHealthScore]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-500';
    if (score >= 60) return 'bg-blue-50 border-blue-500';
    if (score >= 40) return 'bg-yellow-50 border-yellow-500';
    return 'bg-red-50 border-red-500';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 dark:bg-dark-surface-elevated text-gray-700 dark:text-dark-text-secondary border-gray-300 dark:border-dark-border-strong';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Calculating your financial health...</p>
        </div>
      </div>
    );
  }

  if (error || !healthData?.success) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header with Time Span Selector */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">💚 Financial Health Score</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">Comprehensive analysis of your financial wellness</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Analysis Period:</label>
            <select
              value={timeSpan}
              onChange={(e) => setTimeSpan(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-dark-surface-secondary"
            >
              <option value="1">Last Month</option>
              <option value="3">Last 3 Months</option>
              <option value="6">Last 6 Months</option>
              <option value="12">Last Year</option>
            </select>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="text-yellow-500 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Unable to Calculate Score</h3>
          <p className="text-yellow-700 mb-2">{error || healthData?.message || 'No financial data available'}</p>
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Add income and expense transactions to see your financial health score.</p>
        </div>
      </div>
    );
  }

  // Safely destructure with defaults to prevent undefined errors
  const { 
    score = 0, 
    category = '', 
    status = '', 
    components = {}, 
    summary = {}, 
    recommendations = [] 
  } = healthData || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Time Span Selector */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">💚 Financial Health Score</h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">Comprehensive analysis of your financial wellness</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Analysis Period:</label>
          <select
            value={timeSpan}
            onChange={(e) => setTimeSpan(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-dark-surface-secondary"
          >
            <option value="1">Last Month</option>
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
            <option value="12">Last Year</option>
          </select>
        </div>
      </div>

      {/* Data Quality Indicator */}
      {healthData.dataQuality && (
        <div className={`mb-6 p-4 rounded-lg border ${
          healthData.dataQuality.reliability === 'High' ? 'bg-green-50 border-green-200' :
          healthData.dataQuality.reliability === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                Data Quality: <span className="font-bold">{healthData.dataQuality.reliability}</span>
              </p>
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary">
                Based on {healthData.dataQuality.monthsAnalyzed} month(s) of data • {healthData.dataQuality.transactionsAnalyzed} transactions
              </p>
            </div>
            {healthData.dataQuality.reliability !== 'High' && (
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary italic">Tip: Add more transaction history for better accuracy</p>
            )}
          </div>
        </div>
      )}

      {/* Main Score Card */}
      <div className={`border-4 rounded-2xl p-8 mb-8 ${getScoreBg(score)}`}>
        <div className="flex items-center justify-center gap-8">
          {/* Score Circle */}
          <div className="relative w-48 h-48">
            <svg className="transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                className={getScoreColor(score)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</p>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary font-medium">{category}</p>
            </div>
          </div>

          {/* Status & Summary */}
          <div className="flex-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-4">{status}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-dark-surface-secondary rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">Monthly Income</p>
                <p className="text-xl font-bold text-gray-800 dark:text-dark-text-primary">{formatCurrency(summary.monthlyIncome)}</p>
              </div>
              <div className="bg-white dark:bg-dark-surface-secondary rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">Monthly Expenses</p>
                <p className="text-xl font-bold text-gray-800 dark:text-dark-text-primary">{formatCurrency(summary.monthlyExpenses)}</p>
              </div>
              <div className="bg-white dark:bg-dark-surface-secondary rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">Monthly Savings</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(summary.monthlySavings)}</p>
              </div>
              <div className="bg-white dark:bg-dark-surface-secondary rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">Savings Rate</p>
                <p className="text-xl font-bold text-purple-600">{summary.savingsRate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text-primary mb-6">Score Components</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Savings Ratio */}
          <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-dark-text-primary">Savings Ratio</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">Weight: {components.savingsRatio.weight}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${getScoreColor(components.savingsRatio.score)}`}>
                  {components.savingsRatio.score}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">{components.savingsRatio.category}</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="w-full bg-gray-200 dark:bg-dark-border-strong rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${components.savingsRatio.score}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-dark-text-secondary">
                <span className="font-medium">Rate:</span> {components.savingsRatio.ratio}%
              </p>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                <span className="font-medium">Trend:</span> {components.savingsRatio.details.trend}
              </p>
            </div>
          </div>

          {/* Expense-to-Income Ratio */}
          <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-dark-text-primary">Expense Efficiency</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">Weight: {components.expenseToIncomeRatio.weight}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${getScoreColor(components.expenseToIncomeRatio.score)}`}>
                  {components.expenseToIncomeRatio.score}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">{components.expenseToIncomeRatio.category}</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="w-full bg-gray-200 dark:bg-dark-border-strong rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${components.expenseToIncomeRatio.score}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-dark-text-secondary">
                <span className="font-medium">Spending:</span> {components.expenseToIncomeRatio.ratio}%
              </p>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                <span className="font-medium">Efficiency:</span> {components.expenseToIncomeRatio.details.efficiency}
              </p>
            </div>
          </div>

          {/* Debt Ratio */}
          <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-dark-text-primary">Debt Management</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">Weight: {components.debtRatio.weight}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${getScoreColor(components.debtRatio.score)}`}>
                  {components.debtRatio.score}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">{components.debtRatio.category}</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="w-full bg-gray-200 dark:bg-dark-border-strong rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${components.debtRatio.score}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-dark-text-secondary">
                <span className="font-medium">Debt Payments:</span> {components.debtRatio.ratio}%
              </p>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                <span className="font-medium">Status:</span> {components.debtRatio.details.status}
              </p>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                <span className="font-medium">Active Debts:</span> {components.debtRatio.details.numberOfDebts}
              </p>
            </div>
          </div>

          {/* Budget Adherence */}
          <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Target className="text-yellow-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-dark-text-primary">Budget Adherence</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">Weight: {components.budgetAdherence.weight}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${getScoreColor(components.budgetAdherence.score)}`}>
                  {components.budgetAdherence.score}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">{components.budgetAdherence.category}</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="w-full bg-gray-200 dark:bg-dark-border-strong rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${components.budgetAdherence.score}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-dark-text-secondary">
                <span className="font-medium">Compliance:</span> {components.budgetAdherence.adherence}%
              </p>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                <span className="font-medium">Total Budgets:</span> {components.budgetAdherence.details.totalBudgets}
              </p>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                <span className="font-medium">On Track:</span> {components.budgetAdherence.details.categoriesOnTrack}
              </p>
            </div>
          </div>

          {/* Goal Progress - Full Width */}
          <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow-md p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <CheckCircle className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-dark-text-primary">Goal Achievement</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">Weight: {components.goalProgress.weight}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${getScoreColor(components.goalProgress.score)}`}>
                  {components.goalProgress.score}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">{components.goalProgress.category}</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="w-full bg-gray-200 dark:bg-dark-border-strong rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${components.goalProgress.score}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-dark-text-secondary"><span className="font-medium">Progress:</span> {components.goalProgress.progress}%</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-dark-text-secondary"><span className="font-medium">Total Goals:</span> {components.goalProgress.details.totalGoals}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-dark-text-secondary"><span className="font-medium">Active:</span> {components.goalProgress.details.activeGoals}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-dark-text-secondary"><span className="font-medium">Completed:</span> {components.goalProgress.details.completedGoals}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text-primary mb-6">📋 Recommendations for Improvement</h2>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className={`border-2 rounded-lg p-5 ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary">{rec.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(rec.priority)}`}>
                    {rec.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <p className="text-gray-700 dark:text-dark-text-secondary mb-4">{rec.description}</p>
                <div className="bg-white dark:bg-dark-surface-secondary rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Action Items:</p>
                  <ul className="space-y-2">
                    {rec.actionItems.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialHealth;

