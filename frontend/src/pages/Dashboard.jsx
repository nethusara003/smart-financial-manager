import React, { useEffect, useState } from "react";

const Dashboard = () => {
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
        setTransactions(data);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // === KPI CALCULATIONS ===
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  const spendingRate =
    income === 0 ? 0 : Math.round((expense / income) * 100);

  // === INTELLIGENCE LOGIC ===
  let healthStatus = "Healthy";
  let healthColor = "emerald";
  let insightText =
    "Your spending is within healthy limits. Keep up the good financial habits.";

  if (spendingRate >= 70 && spendingRate < 90) {
    healthStatus = "Watch";
    healthColor = "yellow";
    insightText =
      "Your expenses are increasing. Consider monitoring discretionary spending.";
  }

  if (spendingRate >= 90) {
    healthStatus = "Critical";
    healthColor = "red";
    insightText =
      "Your expenses are dangerously close to your income. Immediate action is recommended.";
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
        <div className="bg-white p-6 rounded-xl border shadow-sm transition hover:shadow-lg hover:-translate-y-1">
          <p className="text-sm text-gray-500">Total Income</p>
          <h2 className="text-2xl font-bold text-emerald-600">
            Rs. {income.toLocaleString()}
          </h2>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm transition hover:shadow-lg hover:-translate-y-1">
          <p className="text-sm text-gray-500">Total Expense</p>
          <h2 className="text-2xl font-bold text-red-500">
            Rs. {expense.toLocaleString()}
          </h2>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm transition hover:shadow-lg hover:-translate-y-1">
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
        <div className="bg-white p-6 rounded-xl border shadow-sm transition hover:shadow-lg hover:-translate-y-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-800">
              Spending Analysis
            </h3>
            <span
              className={`text-xs px-3 py-1 rounded-full bg-${healthColor}-100 text-${healthColor}-700`}
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
        <div className="bg-white p-6 rounded-xl border shadow-sm transition hover:shadow-lg hover:-translate-y-1">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Financial Health Indicator
          </h3>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full bg-${healthColor}-500`}
              style={{ width: `${Math.min(spendingRate, 100)}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">{insightText}</p>
        </div>
      </div>

      {/* Actions + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm transition hover:shadow-lg hover:-translate-y-1">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Action Required
          </h3>

          <ul className="text-sm text-gray-600 space-y-2">
            {spendingRate >= 70 && (
              <li>• Review high-cost expense categories</li>
            )}
            <li>• No savings goal configured</li>
            <li>• Subscription optimization recommended</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm transition hover:shadow-lg hover:-translate-y-1">
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
