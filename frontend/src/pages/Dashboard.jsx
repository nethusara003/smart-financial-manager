import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  let barColor = "bg-emerald-500";
  let badgeColor = "bg-emerald-100 text-emerald-700";

  if (spendingRate >= 70 && spendingRate < 90) {
    healthStatus = "Watch";
    insightText =
      "Your expenses are increasing. Consider monitoring discretionary spending.";
    barColor = "bg-yellow-500";
    badgeColor = "bg-yellow-100 text-yellow-700";
  }

  if (spendingRate >= 90) {
    healthStatus = "Critical";
    insightText =
      "Your expenses are dangerously close to your income. Immediate action is recommended.";
    barColor = "bg-red-500";
    badgeColor = "bg-red-100 text-red-700";
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Financial Overview
        </h1>
        <p className="text-sm text-gray-500">
          A high-level snapshot of your financial health
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Total Income</p>
          <h2 className="text-2xl font-bold text-emerald-600">
            Rs. {income.toLocaleString()}
          </h2>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Total Expense</p>
          <h2 className="text-2xl font-bold text-red-500">
            Rs. {expense.toLocaleString()}
          </h2>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Current Balance</p>
          <h2 className="text-2xl font-bold text-gray-800">
            Rs. {balance.toLocaleString()}
          </h2>
          <p className="text-xs text-gray-400 mt-1">Net position</p>
        </div>
      </div>

      {/* Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Analysis */}
        <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-lg transition">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-800">
              Spending Analysis
            </h3>
            <span
              className={`text-xs px-3 py-1 rounded-full ${badgeColor}`}
            >
              {healthStatus}
            </span>
          </div>

          <p className="text-sm text-gray-600">
            Your expenses account for{" "}
            <strong>{spendingRate}%</strong> of your income.
          </p>
        </div>

        {/* Financial Health Indicator */}
        <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-lg transition">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Financial Health Indicator
          </h3>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${barColor}`}
              style={{ width: `${Math.min(spendingRate, 100)}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {insightText}
          </p>
        </div>
      </div>

      {/* Actions + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Required */}
        <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-lg transition">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Action Required
          </h3>

          <ul className="space-y-2 text-sm">
            {spendingRate >= 70 && (
              <li>
                <button
                  onClick={() => navigate("/analytics")}
                  className="text-blue-600 hover:underline"
                >
                  • Review high-cost expense categories
                </button>
              </li>
            )}

            <li>
              <button
                onClick={() => navigate("/goals")}
                className="text-blue-600 hover:underline"
              >
                • No savings goal configured
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate("/recurring")}
                className="text-blue-600 hover:underline"
              >
                • Subscription optimization recommended
              </button>
            </li>
          </ul>
        </div>

        {/* Financial Calendar */}
        <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-lg transition">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Financial Calendar
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Upcoming bills, salary dates, and reminders
          </p>

          <div className="h-32 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            Calendar view coming soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
