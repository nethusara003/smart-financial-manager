import React, { useEffect, useState } from "react";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ================= DATE HELPERS ================= */

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getStartOfISOWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfISOWeek(date) {
  const start = getStartOfISOWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [compareMode, setCompareMode] = useState("daily");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

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

  /* ================= TOTALS ================= */

  const incomeTotal = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const expenseTotal = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  /* ================= COMPARISON DATA ================= */

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const thisWeekStart = getStartOfISOWeek(today);
  const thisWeekEnd = getEndOfISOWeek(today);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

  function sum(type, filterFn) {
    return transactions
      .filter((t) => t.type === type && filterFn(new Date(t.date)))
      .reduce((s, t) => s + Number(t.amount || 0), 0);
  }

  const dailyData = [
    {
      label: "Yesterday",
      income: sum("income", (d) => isSameDay(d, yesterday)),
      expense: sum("expense", (d) => isSameDay(d, yesterday)),
    },
    {
      label: "Today",
      income: sum("income", (d) => isSameDay(d, today)),
      expense: sum("expense", (d) => isSameDay(d, today)),
    },
  ];

  const weeklyData = [
    {
      label: "Last Week",
      income: sum(
        "income",
        (d) => d >= lastWeekStart && d <= lastWeekEnd
      ),
      expense: sum(
        "expense",
        (d) => d >= lastWeekStart && d <= lastWeekEnd
      ),
    },
    {
      label: "This Week",
      income: sum(
        "income",
        (d) => d >= thisWeekStart && d <= thisWeekEnd
      ),
      expense: sum(
        "expense",
        (d) => d >= thisWeekStart && d <= thisWeekEnd
      ),
    },
  ];

  const comparisonData =
    compareMode === "daily" ? dailyData : weeklyData;

  /* ================= WEEKLY BUDGET ================= */

  const weeklyBudget =
    Number(localStorage.getItem("weeklyBudget")) || null;

  const weeklyExpense = sum(
    "expense",
    (d) => d >= thisWeekStart && d <= thisWeekEnd
  );

  let budgetMessage = "No weekly budget configured.";
  let budgetPercent = 0;

  if (weeklyBudget) {
    budgetPercent = Math.min(
      (weeklyExpense / weeklyBudget) * 100,
      100
    );

    if (weeklyExpense >= weeklyBudget) {
      budgetMessage = "You have exceeded your weekly budget.";
    } else if (budgetPercent >= 75) {
      budgetMessage = "You have used most of your weekly budget.";
    } else {
      budgetMessage = "Your spending is within your weekly budget.";
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading analytics…</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Analytics
        </h1>
        <p className="text-sm text-gray-500">
          Detailed insights into your financial activity
        </p>
      </div>

      {/* Overall Chart */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-medium mb-4">
          Overall Income vs Expense
        </h3>
        <IncomeExpenseChart
          income={incomeTotal}
          expense={expenseTotal}
        />
      </div>

      {/* Comparison Charts */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            Income & Expense Comparison
          </h3>

          <select
            value={compareMode}
            onChange={(e) => setCompareMode(e.target.value)}
            className="border rounded-lg px-3 py-1 text-sm"
          >
            <option value="daily">Today vs Yesterday</option>
            <option value="weekly">This Week vs Last Week</option>
          </select>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" />
              <Bar dataKey="expense" fill="#fb923c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Budget */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-medium mb-3">
          Weekly Budget Usage
        </h3>

        {weeklyBudget ? (
          <>
            <div className="h-2 bg-gray-200 rounded-full mb-2">
              <div
                className={`h-full rounded-full ${
                  budgetPercent >= 90
                    ? "bg-red-600"
                    : budgetPercent >= 75
                    ? "bg-orange-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 italic">
              {budgetMessage} (Rs. {weeklyExpense} / Rs. {weeklyBudget})
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No weekly budget has been set yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
