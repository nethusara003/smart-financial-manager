import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Calendar,
  Zap
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  /* ================= KPI CALCULATIONS ================= */

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = income - expense;

  const spendingRate =
    income === 0 ? 0 : Math.round((expense / income) * 100);

  /* ================= FINANCIAL HEALTH LOGIC ================= */

  let healthStatus = "Healthy";
  let insightText =
    "Your spending is within healthy limits. Keep up the good financial habits.";
  let barColor = "bg-success-500";
  let badgeColor = "bg-success-100 text-success-700";

  if (spendingRate >= 70 && spendingRate < 90) {
    healthStatus = "Watch";
    insightText =
      "Your expenses are increasing. Consider monitoring discretionary spending.";
    barColor = "bg-warning-500";
    badgeColor = "bg-warning-100 text-warning-700";
  }

  if (spendingRate >= 90) {
    healthStatus = "Critical";
    insightText =
      "Your expenses are dangerously close to your income. Immediate action is recommended.";
    barColor = "bg-danger-500";
    badgeColor = "bg-danger-100 text-danger-700";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Financial Overview</h1>
          </div>
          <p className="text-primary-100 text-lg">A comprehensive snapshot of your financial health</p>
        </div>
      </div>

      {/* Premium KPI Cards with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Income Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-success-500 to-success-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="bg-success-700 bg-opacity-50 px-3 py-1 rounded-full">
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-white" />
                  <span className="text-xs font-semibold text-white">Income</span>
                </div>
              </div>
            </div>
            <p className="text-success-100 text-sm font-medium mb-1">Total Income</p>
            <h2 className="text-4xl font-bold text-white mb-2">
              Rs. {income.toLocaleString()}
            </h2>
            <p className="text-success-200 text-xs">All time earnings</p>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-danger-500 to-danger-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div className="bg-danger-700 bg-opacity-50 px-3 py-1 rounded-full">
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3 text-white" />
                  <span className="text-xs font-semibold text-white">Expense</span>
                </div>
              </div>
            </div>
            <p className="text-danger-100 text-sm font-medium mb-1">Total Expense</p>
            <h2 className="text-4xl font-bold text-white mb-2">
              Rs. {expense.toLocaleString()}
            </h2>
            <p className="text-danger-200 text-xs">All time spending</p>
          </div>
        </div>

        {/* Current Balance Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className={`px-3 py-1 rounded-full ${balance >= 0 ? 'bg-success-500 bg-opacity-50' : 'bg-danger-500 bg-opacity-50'}`}>
                <span className="text-xs font-semibold text-white">
                  {balance >= 0 ? 'Positive' : 'Negative'}
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">Current Balance</p>
            <h2 className={`text-4xl font-bold mb-2 ${balance >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
              Rs. {balance.toLocaleString()}
            </h2>
            <p className="text-gray-400 text-xs">Net position</p>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Spending Analysis */}
        <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 p-3 rounded-xl">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Spending Analysis</h3>
                <p className="text-sm text-gray-500">Expense to income ratio</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold text-sm shadow-sm ${badgeColor}`}>
              {healthStatus}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-900">{spendingRate}%</span>
              <span className="text-gray-500">of income</span>
            </div>
          </div>

          <p className="text-gray-600">
            Your expenses account for <strong className="text-gray-900">{spendingRate}%</strong> of your income.
          </p>
          
          {/* Visual Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Healthy</span>
              <span>Watch</span>
              <span>Critical</span>
            </div>
            <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="bg-success-200 w-[70%]"></div>
                <div className="bg-warning-200 w-[20%]"></div>
                <div className="bg-danger-200 w-[10%]"></div>
              </div>
              <div 
                className={`absolute top-0 bottom-0 ${barColor} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                style={{ width: `${Math.min(spendingRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Financial Health Indicator with Premium Design */}
        <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-xl ${
              healthStatus === 'Healthy' ? 'bg-success-100' :
              healthStatus === 'Watch' ? 'bg-warning-100' : 'bg-danger-100'
            }`}>
              {healthStatus === 'Healthy' && <CheckCircle2 className="w-6 h-6 text-success-600" />}
              {healthStatus === 'Watch' && <AlertCircle className="w-6 h-6 text-warning-600" />}
              {healthStatus === 'Critical' && <AlertTriangle className="w-6 h-6 text-danger-600" />}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Financial Health</h3>
              <p className="text-sm text-gray-500">Current status overview</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor} shadow-lg`}
                style={{ width: `${Math.min(spendingRate, 100)}%` }}
              />
            </div>
          </div>

          <div className={`p-4 rounded-xl ${
            healthStatus === 'Healthy' ? 'bg-success-50 border border-success-200' :
            healthStatus === 'Watch' ? 'bg-warning-50 border border-warning-200' : 
            'bg-danger-50 border border-danger-200'
          }`}>
            <p className={`text-sm font-medium ${
              healthStatus === 'Healthy' ? 'text-success-800' :
              healthStatus === 'Watch' ? 'text-warning-800' : 'text-danger-800'
            }`}>
              {insightText}
            </p>
          </div>
        </div>
      </div>

      {/* Actions + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Action Required Card */}
        <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-100 p-3 rounded-xl">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Action Required</h3>
              <p className="text-sm text-gray-500">Recommended next steps</p>
            </div>
          </div>

          <div className="space-y-3">
            {spendingRate >= 70 && (
              <button
                onClick={() => navigate("/analytics")}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-danger-50 to-danger-100 hover:from-danger-100 hover:to-danger-200 transition-all duration-300 group border border-danger-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-danger-500 rounded-lg p-2">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-danger-900">Review high-cost expense categories</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-danger-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            )}

            <button
              onClick={() => navigate("/goals")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 transition-all duration-300 group border border-primary-200"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary-500 rounded-lg p-2">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-primary-900">Set up your savings goal</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate("/recurring")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-warning-50 to-warning-100 hover:from-warning-100 hover:to-warning-200 transition-all duration-300 group border border-warning-200"
            >
              <div className="flex items-center gap-3">
                <div className="bg-warning-500 rounded-lg p-2">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-warning-900">Optimize your subscriptions</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-warning-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Premium Financial Calendar */}
        <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-secondary-100 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Financial Calendar</h3>
              <p className="text-sm text-gray-500">Upcoming bills and reminders</p>
            </div>
          </div>

          <div className="relative h-48 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
            <div className="relative text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Calendar view coming soon</p>
              <p className="text-gray-400 text-sm mt-1">Track bills, salary dates, and reminders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
