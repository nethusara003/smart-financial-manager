import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Info, BarChart3 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useExpenseForecast } from '../hooks/useInsights';

const ExpenseForecast = () => {
  const { formatCurrency } = useCurrency();
  const [months, setMonths] = useState(3);
  const {
    data: forecast,
    isLoading: loading,
    error,
  } = useExpenseForecast(months);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="text-red-500" size={20} />;
      case 'decreasing': return <TrendingDown className="text-green-500" size={20} />;
      default: return <Minus className="text-blue-500" size={20} />;
    }
  };

  const getTrendBadge = (trend) => {
    const colors = {
      increasing: 'bg-red-100 text-red-700',
      decreasing: 'bg-green-100 text-green-700',
      stable: 'bg-blue-100 text-blue-700',
    };
    return `${colors[trend] || 'bg-gray-100 dark:bg-dark-surface-elevated text-gray-700 dark:text-dark-text-secondary'} px-2 py-1 rounded text-xs font-medium`;
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-300 text-green-800';
      case 'info': return 'bg-blue-50 border-blue-300 text-blue-800';
      default: return 'bg-gray-50 dark:bg-dark-surface-elevated border-gray-300 dark:border-dark-border-strong text-gray-800 dark:text-dark-text-primary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Generating expense forecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Generate Forecast</h3>
          <p className="text-red-600">{error?.message || 'Failed to generate forecast'}</p>
        </div>
      </div>
    );
  }

  if (!forecast?.success) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">📊 Expense Forecast</h1>
              <p className="text-gray-600 dark:text-dark-text-secondary">AI-powered predictions for your future expenses</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Forecast Period:</label>
              <select
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-dark-border-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
          <AlertCircle className="text-yellow-500 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-3">Insufficient Data</h3>
          <p className="text-gray-600 dark:text-dark-text-secondary mb-4">{forecast?.message || 'No expense data available'}</p>
          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
            Add expense transactions to see AI-powered forecasts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">📊 Expense Forecast</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">AI-powered predictions for your future expenses</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Forecast Period:</label>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border-strong rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Quality Card */}
      <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="text-indigo-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary">Forecast Reliability</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600">{forecast.dataQuality.monthsAnalyzed}</p>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">Months Analyzed</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{forecast.dataQuality.transactionsAnalyzed}</p>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">Transactions</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{forecast.dataQuality.categoriesTracked}</p>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">Categories</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className={`text-2xl font-bold ${
              forecast.dataQuality.reliability === 'High' ? 'text-green-600' : 
              forecast.dataQuality.reliability === 'Medium' ? 'text-yellow-600' :
              'text-blue-600'
            }`}>
              {forecast.dataQuality.reliability}
            </p>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">Reliability</p>
          </div>
        </div>
        {forecast.dataQuality.note && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">💡 {forecast.dataQuality.note}</p>
          </div>
        )}
      </div>

      {/* Overall Forecast Summary */}
      <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-6">Overall Expense Predictions</h2>
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Historical Average:</strong> {formatCurrency(forecast.summary.historicalMonthlyAverage)} per month
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecast.summary.overallForecast.map((month, index) => (
            <div key={index} className="border-2 border-indigo-200 rounded-lg p-5 bg-gradient-to-br from-white to-indigo-50 dark:from-dark-surface-secondary dark:to-indigo-900/20">
              <div className="text-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-1">{month.month}</h3>
                <p className="text-3xl font-bold text-indigo-600">
                  {formatCurrency(month.totalPredicted)}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">Predicted Expenses</p>
              </div>
              <div className="border-t border-indigo-200 pt-3 mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Min Estimate:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(month.minEstimate)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Max Estimate:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(month.maxEstimate)}</span>
                </div>
                <div className="flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    month.confidence === 'High' ? 'bg-green-100 text-green-700' :
                    month.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {month.confidence} Confidence
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {forecast.insights && forecast.insights.length > 0 && (
        <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-4">💡 Forecast Insights</h2>
          <div className="space-y-3">
            {forecast.insights.map((insight, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <Info size={20} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{insight.category}</p>
                    <p className="text-sm mb-2">{insight.message}</p>
                    <p className="text-xs italic">💡 {insight.recommendation}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    insight.priority === 'high' ? 'bg-red-200 text-red-800' :
                    insight.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {insight.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category-wise Forecasts */}
      <div className="bg-white dark:bg-dark-surface-secondary rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-6">Category-wise Predictions</h2>
        <div className="space-y-6">
          {forecast.categoryForecasts.map((cat, index) => (
            <div key={index} className="border border-gray-200 dark:border-dark-border-strong rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary">{cat.category}</h3>
                  {getTrendIcon(cat.historical.trend)}
                  <span className={getTrendBadge(cat.historical.trend, cat.historical.trendConfidence)}>
                    {cat.historical.trend} ({cat.historical.percentChange}%)
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-dark-surface-elevated text-gray-700 dark:text-dark-text-secondary rounded text-xs font-medium">
                    {cat.historical.trendConfidence} confidence
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-dark-surface-elevated rounded p-3">
                  <p className="text-xs text-gray-600 dark:text-dark-text-secondary mb-1">Historical Avg</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-dark-text-primary">{formatCurrency(cat.historical.average)}</p>
                </div>
                <div className="bg-indigo-50 rounded p-3">
                  <p className="text-xs text-gray-600 dark:text-dark-text-secondary mb-1">Next Month</p>
                  <p className="text-lg font-bold text-indigo-600">{formatCurrency(cat.forecast[0].predicted)}</p>
                </div>
                {cat.forecast[1] && (
                  <div className="bg-purple-50 rounded p-3">
                    <p className="text-xs text-gray-600 dark:text-dark-text-secondary mb-1">Month 2</p>
                    <p className="text-lg font-bold text-purple-600">{formatCurrency(cat.forecast[1].predicted)}</p>
                  </div>
                )}
                {cat.forecast[2] && (
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-xs text-gray-600 dark:text-dark-text-secondary mb-1">Month 3</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(cat.forecast[2].predicted)}</p>
                  </div>
                )}
              </div>

              {/* Visual Forecast Bar */}
              <div className="mb-4">
                <div className="flex gap-1">
                  {cat.forecast.map((f, idx) => (
                    <div key={idx} className="flex-1 text-center">
                      <div
                        className="bg-indigo-500 rounded-t"
                        style={{
                          height: `${(f.predicted / Math.max(...cat.forecast.map(x => x.predicted))) * 80}px`,
                          minHeight: '20px'
                        }}
                      ></div>
                      <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-2">M{f.month}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {cat.insights.seasonalPattern}
                </span>
                {cat.insights.anomalies > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                    ⚠️ {cat.insights.anomalies} anomalies detected
                  </span>
                )}
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                  {cat.insights.reliability} reliability
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseForecast;

