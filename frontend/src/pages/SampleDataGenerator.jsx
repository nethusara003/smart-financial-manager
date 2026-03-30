import { useState } from 'react';
import { Database, Check, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../services/apiClient';

export default function SampleDataGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generateData = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/sample-data/generate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate sample data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sample Data Generator</h1>
            <p className="text-gray-600">Generate realistic financial data to test intelligent features</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What will be generated:</h3>
          <ul className="space-y-1 text-blue-800 text-sm">
            <li>• <strong>3 months</strong> of transaction history (~100 transactions)</li>
            <li>• <strong>14 budget</strong> entries for current and next month</li>
            <li>• <strong>4 financial goals</strong> with progress tracking</li>
            <li>• <strong>7 recurring bills</strong> for various categories</li>
          </ul>
          <p className="mt-3 text-blue-700 text-sm font-medium">
            ⚠️ This will replace all your existing financial data!
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateData}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Sample Data...
            </>
          ) : (
            <>
              <Database className="w-5 h-5" />
              Generate Sample Data
            </>
          )}
        </button>

        {/* Success Result */}
        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">Success! Sample data generated</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-green-800">
                  <div>
                    <span className="font-medium">Transactions:</span> {result.data?.transactions}
                  </div>
                  <div>
                    <span className="font-medium">Budgets:</span> {result.data?.budgets}
                  </div>
                  <div>
                    <span className="font-medium">Goals:</span> {result.data?.goals}
                  </div>
                  <div>
                    <span className="font-medium">Bills:</span> {result.data?.bills}
                  </div>
                </div>
                <p className="mt-3 text-green-700 font-medium">
                  ✨ You can now use all intelligent features! Navigate to:
                </p>
                <ul className="mt-2 space-y-1 text-green-700">
                  <li>• Budget Recommendations</li>
                  <li>• Financial Health Score</li>
                  <li>• Expense Forecasting</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Why do I need sample data?</h3>
          <p className="text-gray-600 text-sm mb-3">
            The intelligent features require historical financial data to generate meaningful insights:
          </p>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>
              <strong>Budget Recommendations:</strong> Analyzes spending patterns across categories
            </li>
            <li>
              <strong>Financial Health Score:</strong> Evaluates savings, expenses, debts, and goal progress
            </li>
            <li>
              <strong>Expense Forecasting:</strong> Predicts future expenses based on historical trends
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
