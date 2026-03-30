import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, Target, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const BudgetRecommendations = () => {
  const { formatCurrency } = useCurrency();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeSpan, setTimeSpan] = useState(1); // Default to 1 month

  async function fetchRecommendations() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/recommendations/budget?months=${timeSpan}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRecommendations(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recommendations');
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecommendations();
  }, [timeSpan]); // Refetch when time span changes

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      case 'warning': return <AlertCircle className="text-yellow-500" size={20} />;
      case 'critical': return <AlertCircle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_track': return 'border-green-500 bg-green-50';
      case 'overspending': return 'border-red-500 bg-red-50';
      case 'underspending': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 dark:border-dark-border-strong bg-gray-50 dark:bg-dark-surface-elevated';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Analyzing your finances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Recommendations</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!recommendations?.success) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header with Time Span Selector */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">💡 Budget Recommendations</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">AI-powered budget suggestions based on your spending patterns</p>
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

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
          <AlertCircle className="text-yellow-500 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-3">Insufficient Data</h3>
          <p className="text-gray-600 dark:text-dark-text-secondary mb-4">{recommendations?.message || 'No financial data available'}</p>
          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
            Add income and expense transactions to see AI-powered budget recommendations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Time Span Selector */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">💡 Budget Recommendations</h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">AI-powered budget suggestions based on your spending patterns</p>
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
      {recommendations.dataQuality && (
        <div className={`mb-6 p-4 rounded-lg border ${
          recommendations.dataQuality.reliability === 'High' ? 'bg-green-50 border-green-200' :
          recommendations.dataQuality.reliability === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                Data Quality: <span className="font-bold">{recommendations.dataQuality.reliability}</span>
              </p>
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary">
                Based on {recommendations.dataQuality.monthsAnalyzed} month(s) of data
              </p>
            </div>
            {recommendations.dataQuality.note && (
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary italic">{recommendations.dataQuality.note}</p>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Monthly Income</span>
            <DollarSign className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatCurrency(recommendations.summary.monthlyIncome)}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Current Spending</span>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatCurrency(recommendations.summary.currentTotalSpending)}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Current Savings</span>
            <Target className="text-purple-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatCurrency(recommendations.summary.currentSavings)}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Savings Rate</span>
            <CheckCircle className="text-teal-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary">
            {recommendations.summary.currentSavingsRate}
          </p>
        </div>
      </div>

      {/* 50/30/20 Allocation */}
      <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-6">Recommended Allocation (50/30/20 Rule)</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700 dark:text-dark-text-secondary">Needs (50%)</span>
              <span className="font-semibold text-gray-800 dark:text-dark-text-primary">
                {formatCurrency(recommendations.summary.recommendedAllocation.needs)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-border-strong rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700 dark:text-dark-text-secondary">Wants (30%)</span>
              <span className="font-semibold text-gray-800 dark:text-dark-text-primary">
                {formatCurrency(recommendations.summary.recommendedAllocation.wants)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-border-strong rounded-full h-3">
              <div className="bg-purple-500 h-3 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700 dark:text-dark-text-secondary">Savings (20%)</span>
              <span className="font-semibold text-gray-800 dark:text-dark-text-primary">
                {formatCurrency(recommendations.summary.recommendedAllocation.savings)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-border-strong rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
        </div>

        {recommendations.summary.goalBasedSavingsRequired > 0 && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm text-indigo-800">
              <strong>💡 Goal-Based Savings:</strong> Based on your active goals, you need to save 
              <strong> {formatCurrency(recommendations.summary.goalBasedSavingsRequired)}</strong> monthly.
            </p>
          </div>
        )}

        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>🛡️ Emergency Fund Target:</strong> Aim for 
            <strong> {formatCurrency(recommendations.summary.emergencyFundRecommendation)}</strong> (6 months of expenses).
          </p>
        </div>
      </div>

      {/* Insights */}
      {recommendations.insights && recommendations.insights.length > 0 && (
        <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-4">💡 Personalized Insights</h2>
          <div className="space-y-3">
            {recommendations.insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  insight.priority === 'high' ? 'bg-red-50 border-red-200' :
                  insight.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-dark-text-primary">{insight.category}</p>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Recommendations */}
      <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-6">Category-wise Recommendations</h2>
        <div className="space-y-4">
          {recommendations.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`border-l-4 rounded-lg p-4 ${getStatusColor(rec.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary">{rec.category}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rec.categoryType === 'essential' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {rec.categoryType}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rec.status === 'on_track' ? 'bg-green-100 text-green-700' :
                    rec.status === 'overspending' ? 'bg-red-100 text-red-700' :
                    rec.status === 'underspending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 dark:bg-dark-surface-elevated text-gray-700 dark:text-dark-text-secondary'
                  }`}>
                    {rec.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-dark-text-secondary mb-1">Current Spending</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary">{formatCurrency(rec.currentSpending)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-dark-text-secondary mb-1">Recommended Budget</p>
                  <p className="text-lg font-semibold text-indigo-600">{formatCurrency(rec.recommendedBudget)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-dark-text-secondary mb-1">% of Income</p>
                  <p className="text-lg font-semibold text-purple-600">{rec.percentageOfIncome}%</p>
                </div>
              </div>

              <p className="text-sm text-gray-700 dark:text-dark-text-secondary italic">💡 {rec.suggestion}</p>

              {rec.hasExistingBudget && (
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2">
                  Current budget limit: {formatCurrency(rec.existingBudgetLimit)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetRecommendations;

