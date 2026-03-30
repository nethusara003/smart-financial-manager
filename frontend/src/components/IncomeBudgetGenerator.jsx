import { useState } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, PieChart, Star, CheckCircle, AlertCircle, Sparkles, X, Save } from 'lucide-react';
import { API_BASE_URL } from '../services/apiClient';

const IncomeBudgetGenerator = ({ isOpen, onClose, onBudgetsGenerated }) => {
  const [step, setStep] = useState(1); // 1: Input Income, 2: Review Recommendations, 3: Confirm
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [selectedBudgets, setSelectedBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingBudgets, setSavingBudgets] = useState(false);

  const handleGenerate = async () => {
    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
      setError('Please enter a valid monthly income');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/budgets/generate-from-income`,
        { monthlyIncome: parseFloat(monthlyIncome) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setRecommendations(response.data);
        // Pre-select all budgets
        setSelectedBudgets(response.data.recommendations.map(r => r.category));
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate budgets');
    } finally {
      setLoading(false);
    }
  };

  const toggleBudgetSelection = (category) => {
    setSelectedBudgets(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSaveBudgets = async () => {
    setSavingBudgets(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const selectedRecommendations = recommendations.recommendations.filter(r => 
        selectedBudgets.includes(r.category)
      );

      const groupId = `income-budget-${Date.now()}`;
      const totalBudget = selectedRecommendations.reduce((sum, rec) => sum + rec.recommendedAmount, 0);

      // Create parent budget group
      await axios.post(
        `${API_BASE_URL}/budgets`,
        {
          category: 'Monthly Budget',
          limit: totalBudget,
          period: 'monthly',
          active: true,
          isGroupParent: true,
          budgetGroup: groupId,
          groupMetadata: {
            monthlyIncome: recommendations.monthlyIncome,
            createdFrom: 'income-generator',
            categoryCount: selectedRecommendations.length,
            savingsRate: recommendations.summary.savingsRate,
            allocation: recommendations.summary.allocation
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Create child budgets
      const childPromises = selectedRecommendations.map(rec => 
        axios.post(
          `${API_BASE_URL}/budgets`,
          {
            category: rec.category,
            limit: rec.recommendedAmount,
            period: 'monthly',
            active: true,
            budgetGroup: groupId,
            isGroupParent: false
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(childPromises);
      
      // Notify parent component
      if (onBudgetsGenerated) {
        onBudgetsGenerated();
      }

      // Close modal
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budgets');
    } finally {
      setSavingBudgets(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setMonthlyIncome('');
    setRecommendations(null);
    setSelectedBudgets([]);
    setError('');
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl shadow-2xl dark:shadow-[0_0_50px_rgba(139,92,246,0.3)] border border-light-border-default dark:border-purple-500/30 max-w-4xl w-full my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-light-border-default dark:border-dark-border-default bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Generate Monthly Budget
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  AI-powered budget allocation based on your income and spending habits
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-purple-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600'}`}>
                1
              </div>
              <span className="text-sm font-medium">Income</span>
            </div>
            <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[600px] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Step 1: Income Input */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Enter Your Monthly Income
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      We'll analyze your spending history and create personalized budget recommendations based on your income.
                    </p>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monthly Income ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(e.target.value)}
                          placeholder="e.g., 5000"
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-surface-secondary border border-gray-300 dark:border-dark-border-default rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  How it works
                </h4>
                <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Analyzes your available expense history (uses all available data, even if less than 3 months)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Applies the 50/30/20 rule: 50% essentials, 30% wants, 20% savings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Creates category budgets based on your spending patterns and income</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Includes safety buffers to prevent overspending</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Review Recommendations */}
          {step === 2 && recommendations && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">Monthly Income</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(recommendations.monthlyIncome)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-2">
                    <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Budgets</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(recommendations.summary.totalRecommendedBudgets)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {recommendations.summary.allocation.essentials} essential, {recommendations.summary.allocation.discretionary} discretionary
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Savings</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {formatCurrency(recommendations.summary.recommendedSavings)}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {recommendations.summary.savingsRate} of income
                  </p>
                </div>
              </div>

              {/* Data Availability Info */}
              <div className={`p-4 rounded-xl border ${
                recommendations.dataAvailability.hasExpenseData 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              }`}>
                <div className="flex items-start gap-3">
                  {recommendations.dataAvailability.hasExpenseData ? (
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {recommendations.dataAvailability.hasExpenseData 
                        ? `Analysis based on ${recommendations.dataAvailability.transactionCount} transactions`
                        : 'No expense history found'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {recommendations.dataAvailability.hasExpenseData 
                        ? `Data from ${recommendations.dataAvailability.lookbackMonths} month${recommendations.dataAvailability.lookbackMonths !== 1 ? 's' : ''} of spending history`
                        : 'Recommendations based on standard income allocation guidelines'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Insights */}
              {recommendations.insights && recommendations.insights.length > 0 && (
                <div className="space-y-2">
                  {recommendations.insights.map((insight, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border text-sm ${
                        insight.includes('⚠️') 
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                          : insight.includes('✓')
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
                      }`}
                    >
                      {insight}
                    </div>
                  ))}
                </div>
              )}

              {/* Budget Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recommended Budgets ({selectedBudgets.length} selected)
                  </h3>
                  <button
                    onClick={() => setSelectedBudgets(
                      selectedBudgets.length === recommendations.recommendations.length 
                        ? []
                        : recommendations.recommendations.map(r => r.category)
                    )}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {selectedBudgets.length === recommendations.recommendations.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {recommendations.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleBudgetSelection(rec.category)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedBudgets.includes(rec.category)
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-md'
                          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedBudgets.includes(rec.category)
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedBudgets.includes(rec.category) && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {rec.category}
                                </h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  rec.type === 'essential'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                }`}>
                                  {rec.type}
                                </span>
                                {rec.priority === 1 && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {rec.reasoning}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {formatCurrency(rec.recommendedAmount)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {rec.percentageOfIncome}% of income
                              </p>
                              {rec.hasSpendingHistory && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Avg: {formatCurrency(rec.historicalAverage)}/mo
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-light-border-default dark:border-dark-border-default bg-gray-50 dark:bg-dark-surface-secondary">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            
            {step === 1 && (
              <button
                onClick={handleGenerate}
                disabled={loading || !monthlyIncome}
                className="px-8 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium shadow-lg disabled:shadow-none transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Budgets
                  </>
                )}
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleSaveBudgets}
                disabled={savingBudgets || selectedBudgets.length === 0}
                className="px-8 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium shadow-lg disabled:shadow-none transition-all flex items-center gap-2"
              >
                {savingBudgets ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save {selectedBudgets.length} Budget{selectedBudgets.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeBudgetGenerator;
