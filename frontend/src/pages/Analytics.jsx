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

function isSameMonth(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth()
  );
}

/* ================= CUSTOM TOOLTIP ================= */

const ComparisonTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border rounded-lg shadow-sm px-3 py-2 text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((item) => (
        <p
          key={item.dataKey}
          className={
            item.dataKey === "income"
              ? "text-emerald-600"
              : "text-orange-600"
          }
        >
          {item.dataKey}: Rs. {item.value}
        </p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [compareMode, setCompareMode] = useState("daily");
  const [timeScope, setTimeScope] = useState("week");
  const [categoryType, setCategoryType] = useState("expense");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
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

  /* ================= DATE BASE ================= */

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const thisWeekStart = getStartOfISOWeek(today);
  const thisWeekEnd = getEndOfISOWeek(today);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

  /* ================= MONTHLY DATA ================= */

  const monthlyTransactions = transactions.filter((t) =>
    isSameMonth(new Date(t.date), today)
  );

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const monthlyBalance = monthlyIncome - monthlyExpense;

  /* ================= SCOPE ================= */

  const scopedTransactions =
    timeScope === "week"
      ? transactions.filter(
          (t) =>
            new Date(t.date) >= thisWeekStart &&
            new Date(t.date) <= thisWeekEnd
        )
      : monthlyTransactions;

  /* ================= TOTALS ================= */

  const incomeTotal = scopedTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const expenseTotal = scopedTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  /* ================= COMPARISON ================= */

  const sum = (type, filterFn) =>
    scopedTransactions
      .filter((t) => t.type === type && filterFn(new Date(t.date)))
      .reduce((s, t) => s + Number(t.amount || 0), 0);

  const sumFromAll = (type, filterFn) =>
    transactions
      .filter((t) => t.type === type && filterFn(new Date(t.date)))
      .reduce((s, t) => s + Number(t.amount || 0), 0);

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
      income: sumFromAll(
        "income",
        (d) => d >= lastWeekStart && d <= lastWeekEnd
      ),
      expense: sumFromAll(
        "expense",
        (d) => d >= lastWeekStart && d <= lastWeekEnd
      ),
    },
    {
      label: "This Week",
      income: sumFromAll(
        "income",
        (d) => d >= thisWeekStart && d <= thisWeekEnd
      ),
      expense: sumFromAll(
        "expense",
        (d) => d >= thisWeekStart && d <= thisWeekEnd
      ),
    },
  ];

  const comparisonData =
    compareMode === "daily" ? dailyData : weeklyData;

  /* ================= CATEGORY-WISE DATA ================= */

  const categoryMap = {};

  scopedTransactions
    .filter((t) => t.type === categoryType)
    .forEach((t) => {
      const key = t.category || "Other";
      categoryMap[key] =
        (categoryMap[key] || 0) + Number(t.amount || 0);
    });

  const categoryData = Object.keys(categoryMap).map((key) => ({
    category: key,
    amount: categoryMap[key],
  }));

  if (loading) {
    return <p className="text-sm text-gray-500">Loading analytics…</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Analytics
          </h1>
          <p className="text-sm text-gray-500">
            Detailed insights into your financial activity
          </p>
        </div>

        <select
          value={timeScope}
          onChange={(e) => setTimeScope(e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Monthly Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">This Month Income</p>
          <p className="text-2xl font-semibold text-emerald-600">
            Rs. {monthlyIncome}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">This Month Expense</p>
          <p className="text-2xl font-semibold text-red-500">
            Rs. {monthlyExpense}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Net Balance</p>
          <p
            className={`text-2xl font-semibold ${
              monthlyBalance >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            Rs. {monthlyBalance}
          </p>
        </div>
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

      {/* Comparison Chart */}
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
              <Tooltip content={<ComparisonTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" />
              <Bar dataKey="expense" fill="#fb923c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category-wise Chart */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {categoryType === "expense"
              ? "Expense Breakdown by Category"
              : "Income Breakdown by Category"}
          </h3>

          <select
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value)}
            className="border rounded-lg px-3 py-1 text-sm"
          >
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </div>

        {categoryData.length === 0 ? (
          <p className="text-sm text-gray-500">
            No data available for this period.
          </p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="amount"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
