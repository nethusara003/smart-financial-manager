import { useState, useMemo } from 'react';
import { Heart, TrendingUp, AlertCircle, CheckCircle, Target, DollarSign, CreditCard } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useFinancialHealthScore } from '../hooks/useInsights';
import {
  DATE_RANGE_OPTIONS,
  getPresetDateBounds,
  getRangeBounds,
  formatDateInputValue,
  parseDateInputValue,
  toStartOfDay,
  toEndOfDay,
} from '../utils/dateRangeFilter';

const FinancialHealth = () => {
  const { formatCurrency } = useCurrency();
  const defaultCustomRange = useMemo(() => getPresetDateBounds('week'), []);
  const [timeRange, setTimeRange] = useState('thisMonth');
  const [customDateRange, setCustomDateRange] = useState(defaultCustomRange);
  const [customRangeDraft, setCustomRangeDraft] = useState(defaultCustomRange);
  const [showCustomRangePanel, setShowCustomRangePanel] = useState(false);
  const months = useMemo(() => {
    const { startDate, endDate } = getRangeBounds(timeRange, customDateRange);
    const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
    return Math.min(24, Math.max(1, Math.ceil(days / 30)));
  }, [customDateRange, timeRange]);
  const {
    data: healthData,
    isLoading: loading,
    error,
  } = useFinancialHealthScore(months);

  const handleTimeRangeChange = (nextRange) => {
    setTimeRange(nextRange);
    if (nextRange === 'custom') {
      setCustomRangeDraft(customDateRange);
      setShowCustomRangePanel(true);
      return;
    }
    setShowCustomRangePanel(false);
  };

  const handleCustomDateDraftChange = (field, value) => {
    const parsed = parseDateInputValue(value, field === 'endDate');
    if (!parsed) {
      return;
    }

    setCustomRangeDraft((prev) => ({
      ...prev,
      [field]: parsed,
    }));
  };

  const handleApplyCustomRange = () => {
    const startDate = toStartOfDay(customRangeDraft.startDate);
    const endDate = toEndOfDay(customRangeDraft.endDate);

    if (startDate > endDate) {
      return;
    }

    setCustomDateRange({ startDate, endDate });
    setTimeRange('custom');
    setShowCustomRangePanel(false);
  };

  const handleCancelCustomRange = () => {
    setCustomRangeDraft(customDateRange);
    setShowCustomRangePanel(false);
  };

  const handleQuickCustomPreset = (presetValue) => {
    setCustomRangeDraft(getPresetDateBounds(presetValue));
  };

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
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header with Time Span Selector */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-1.5">💚 Financial Health Score</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">Comprehensive analysis of your financial wellness</p>
          </div>
          <div className="flex w-full items-center gap-3 md:w-auto">
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Analysis Period:</label>
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="w-full md:w-auto px-3 py-2 text-sm border border-gray-300 dark:border-dark-border-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-dark-surface-secondary"
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {timeRange === 'custom' && showCustomRangePanel && (
          <div className="mb-6 rounded-xl border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary p-4">
            <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              <button type="button" onClick={() => handleQuickCustomPreset('week')} className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover">Last 7 days</button>
              <button type="button" onClick={() => handleQuickCustomPreset('thisMonth')} className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover">This month</button>
              <button type="button" onClick={() => handleQuickCustomPreset('thisYear')} className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover">This year</button>
              <button type="button" onClick={() => handleQuickCustomPreset('pastYear')} className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover">Past year</button>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <input type="date" value={formatDateInputValue(customRangeDraft.startDate)} onChange={(event) => handleCustomDateDraftChange('startDate', event.target.value)} className="rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-surface-primary px-2.5 py-1.5 text-sm text-gray-800 dark:text-dark-text-primary" />
              <input type="date" value={formatDateInputValue(customRangeDraft.endDate)} onChange={(event) => handleCustomDateDraftChange('endDate', event.target.value)} className="rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-surface-primary px-2.5 py-1.5 text-sm text-gray-800 dark:text-dark-text-primary" />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={handleCancelCustomRange} className="rounded-lg border border-gray-200 dark:border-dark-border-default px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:text-dark-text-secondary dark:hover:bg-dark-surface-hover">Cancel</button>
              <button type="button" onClick={handleApplyCustomRange} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Apply</button>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="text-yellow-500 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Unable to Calculate Score</h3>
          <p className="text-yellow-700 mb-2">{error?.message || healthData?.message || 'No financial data available'}</p>
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header with Time Span Selector */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-1.5">💚 Financial Health Score</h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">Comprehensive analysis of your financial wellness</p>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Analysis Period:</label>
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-sm border border-gray-300 dark:border-dark-border-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-dark-surface-secondary"
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {timeRange === 'custom' && showCustomRangePanel && (
        <div className="mb-6 rounded-xl border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary p-4">
          <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            <button type="button" onClick={() => handleQuickCustomPreset('week')} className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover">Last 7 days</button>
            <button type="button" onClick={() => handleQuickCustomPreset('thisMonth')} className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover">This month</button>
            <button type="button" onClick={() => handleQuickCustomPreset('thisYear')} className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover">This year</button>
            <button type="button" onClick={() => handleQuickCustomPreset('pastYear')} className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover">Past year</button>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <input type="date" value={formatDateInputValue(customRangeDraft.startDate)} onChange={(event) => handleCustomDateDraftChange('startDate', event.target.value)} className="rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-surface-primary px-2.5 py-1.5 text-sm text-gray-800 dark:text-dark-text-primary" />
            <input type="date" value={formatDateInputValue(customRangeDraft.endDate)} onChange={(event) => handleCustomDateDraftChange('endDate', event.target.value)} className="rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-surface-primary px-2.5 py-1.5 text-sm text-gray-800 dark:text-dark-text-primary" />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={handleCancelCustomRange} className="rounded-lg border border-gray-200 dark:border-dark-border-default px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:text-dark-text-secondary dark:hover:bg-dark-surface-hover">Cancel</button>
            <button type="button" onClick={handleApplyCustomRange} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Apply</button>
          </div>
        </div>
      )}

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
                {Number.isFinite(healthData.dataQuality.confidence) ? ` • Confidence ${healthData.dataQuality.confidence}%` : ''}
              </p>
            </div>
            {healthData.dataQuality.reliability !== 'High' && (
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary italic">Tip: Add more transaction history for better accuracy</p>
            )}
          </div>
        </div>
      )}

      {/* Main Score Card */}
      <div className={`border-4 rounded-2xl p-5 md:p-6 mb-6 ${getScoreBg(score)}`}>
        <div className="flex flex-col xl:flex-row items-center justify-center gap-6">
          {/* Score Circle */}
          <div className="relative w-40 h-40 md:w-44 md:h-44">
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
              <p className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</p>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary font-medium">{category}</p>
            </div>
          </div>

          {/* Status & Summary */}
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-3">{status}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-dark-surface-secondary rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">Monthly Income</p>
                <p className="text-lg font-bold text-gray-800 dark:text-dark-text-primary">{formatCurrency(summary.monthlyIncome)}</p>
              </div>
              <div className="bg-white dark:bg-dark-surface-secondary rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">Monthly Expenses</p>
                <p className="text-lg font-bold text-gray-800 dark:text-dark-text-primary">{formatCurrency(summary.monthlyExpenses)}</p>
              </div>
              <div className="bg-white dark:bg-dark-surface-secondary rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">Monthly Savings</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(summary.monthlySavings)}</p>
              </div>
              <div className="bg-white dark:bg-dark-surface-secondary rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">Savings Rate</p>
                <p className="text-lg font-bold text-purple-600">{summary.savingsRate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-5">Score Components</h2>
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
                <p className={`text-2xl font-bold ${getScoreColor(components.savingsRatio.score)}`}>
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
                <p className={`text-2xl font-bold ${getScoreColor(components.expenseToIncomeRatio.score)}`}>
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
                <p className={`text-2xl font-bold ${getScoreColor(components.debtRatio.score)}`}>
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
                <p className={`text-2xl font-bold ${getScoreColor(components.budgetAdherence.score)}`}>
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
                <p className={`text-2xl font-bold ${getScoreColor(components.goalProgress.score)}`}>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
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
        <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow-md p-5">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-5">📋 Recommendations for Improvement</h2>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className={`border-2 rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-dark-text-primary">{rec.title}</h3>
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

