import { useState, useEffect } from 'react';
import { Zap, TrendingUp, TrendingDown, AlertTriangle, Info, Lightbulb, ThumbsUp, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SmartBudgetGenerator({ onBudgetGenerated, formatCurrency }) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1); // 1: Select category, 2: Show analysis, 3: Confirm
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const categories = [
    'Food',
    'Groceries',
    'Dining Out',
    'Transport',
    'Transportation',
    'Rent',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Shopping',
    'Subscriptions',
    'Insurance',
    'Other Expense'
  ];

  useEffect(() => {
    const handleOpen = () => setShow(true);
    window.addEventListener('openSmartBudget', handleOpen);
    return () => window.removeEventListener('openSmartBudget', handleOpen);
  }, []);

  const handleClose = () => {
    setShow(false);
    setStep(1);
    setSelectedCategory('');
    setAnalysis(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/budgets/smart-generate`,
        { category: selectedCategory, lookbackMonths: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAnalysis(response.data);
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to generate budget analysis');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze spending');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (analysis && onBudgetGenerated) {
      onBudgetGenerated({
        category: analysis.category,
        limit: analysis.suggestedLimit
      });
    }
    handleClose();
  };

  const getIconForRecommendation = (icon) => {
    switch (icon) {
      case 'AlertTriangle': return <AlertTriangle className="w-4 h-4" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
      case 'ThumbsUp': return <ThumbsUp className="w-4 h-4" />;
      case 'Info': return <Info className="w-4 h-4" />;
      case 'Lightbulb': return <Lightbulb className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'data_quality': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-200';
      case 'trend': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-200';
      case 'explanation': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-200';
      case 'tip': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-200';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-500/30 text-gray-800 dark:text-gray-200';
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="min-h-screen w-full flex items-center justify-center py-8">
        <div className="bg-white dark:bg-dark-surface-primary rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border-strong w-full max-w-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border-default flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Budget Generator</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered budget suggestions based on your spending</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Select a category to analyze
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-border-default bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Choose a category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How it works</h4>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Analyzes your last month of spending in the selected category</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Calculates average monthly spending and spending patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Suggests a realistic budget with a safety buffer for unexpected expenses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Provides personalized tips to help you stay within budget</span>
                    </li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-dark-border-default text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!selectedCategory || loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Analyze Spending
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && analysis && (
              <div className="space-y-6">
                {analysis.hasSufficientData ? (
                  <>
                    {/* Analysis Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Budget Analysis for {analysis.category}</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Monthly</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(analysis.analysis.averageMonthlySpending)}</p>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Suggested Budget</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(analysis.suggestedLimit)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Min Month</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(analysis.analysis.minMonthly)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Max Month</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(analysis.analysis.maxMonthly)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Trend</p>
                          <p className="font-semibold text-gray-900 dark:text-white capitalize flex items-center gap-1">
                            {analysis.analysis.trend === 'increasing' && <TrendingUp className="w-4 h-4 text-red-500" />}
                            {analysis.analysis.trend === 'decreasing' && <TrendingDown className="w-4 h-4 text-green-500" />}
                            {analysis.analysis.trend}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-500/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Based on {analysis.analysis.transactionCount} transactions over {analysis.analysis.lookbackMonths} months
                        </p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Recommendations</h4>
                        {analysis.recommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            className={`border rounded-xl p-4 flex items-start gap-3 ${getColorForType(rec.type)}`}
                          >
                            {getIconForRecommendation(rec.icon)}
                            <p className="text-sm flex-1">{rec.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-dark-border-default text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-all"
                      >
                        Try Different Category
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirm}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        Use This Budget
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* No Data Available */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-xl p-6 text-center">
                      <AlertTriangle className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Insufficient Data</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        {analysis.message}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Start tracking expenses in the "{selectedCategory}" category to get personalized budget recommendations.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-dark-border-default text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-all"
                      >
                        Try Different Category
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
