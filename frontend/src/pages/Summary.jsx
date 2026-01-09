import { useEffect, useState } from "react";
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

function Summary() {
  const [transactions, setTransactions] = useState([]);
  const [quoteMode, setQuoteMode] = useState("professional");
  const [compareMode, setCompareMode] = useState("daily");

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTransactions(data);
    };

    fetchTransactions();
  }, []);

  /* ================= TOTALS ================= */

  const incomeTotal = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expenseTotal = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  /* ================= COMPARISON LOGIC ================= */

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
      .reduce((s, t) => s + t.amount, 0);
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
    Number(localStorage.getItem("weeklyBudget")) || 0;

  const weeklyExpense = sum(
    "expense",
    (d) => d >= thisWeekStart && d <= thisWeekEnd
  );

  const budgetPercent =
    weeklyBudget > 0
      ? Math.min((weeklyExpense / weeklyBudget) * 100, 100)
      : 0;

  let budgetMessage =
    budgetPercent >= 100
      ? quoteMode === "sarcastic"
        ? "Budget deleted itself out of shame."
        : "You have exceeded your weekly budget."
      : budgetPercent >= 75
      ? quoteMode === "sarcastic"
        ? "Wallet is sweating."
        : "You’ve used most of your weekly budget."
      : quoteMode === "sarcastic"
      ? "Budget still breathing."
      : "Your spending is within safe limits.";

  /* ================= QUOTE ================= */

  const quote =
    expenseTotal > incomeTotal
      ? quoteMode === "sarcastic"
        ? "Money is leaving faster than it arrives."
        : "Expenses exceed income. Consider adjustments."
      : quoteMode === "sarcastic"
      ? "Not broke yet. Good discipline."
      : "You’re managing your finances well.";

  /* ================= UI ================= */

  return (
    <div className="dashboard">
      <h1>Financial Summary</h1>

      <div className="card">
        {/* PIE CHART */}
        <h3>Overall Income vs Expense</h3>

{/* PIE CHART WRAPPER (NO BORDER) */}
<div style={{ height: "300px", marginBottom: "12px" }}>
  <IncomeExpenseChart income={incomeTotal} expense={expenseTotal} />
</div>

{/* CONTROLS (OUTSIDE PIE COMPLETELY) */}
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "12px",
  }}
>
  <label style={{ fontSize: "0.9rem" }}>
    Compare:&nbsp;
    <select
      value={compareMode}
      onChange={(e) => setCompareMode(e.target.value)}
    >
      <option value="daily">Today vs Yesterday</option>
      <option value="weekly">This Week vs Last Week</option>
    </select>
  </label>
</div>

         {/* COMPARISON CONTROLS */}
<div className="chart-controls" style={{ marginBottom: "10px" }}>

  <label style={{ fontSize: "0.9rem" }}>
    Compare:&nbsp;
    <select
      value={compareMode}
      onChange={(e) => setCompareMode(e.target.value)}
    >
      <option value="daily">Today vs Yesterday</option>
      <option value="weekly">This Week vs Last Week</option>
    </select>
  </label>
</div>


        {/* COMPARISON BAR CHART */}
        <div style={{ height: "300px", margin: "20px 0" }}>
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

        {/* WEEKLY BUDGET */}
        <h3>Weekly Budget Progress</h3>

        <div
          style={{
            height: "10px",
            background: "#e5e7eb",
            borderRadius: "6px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: `${budgetPercent}%`,
              height: "100%",
              background:
                budgetPercent >= 90
                  ? "#dc2626"
                  : budgetPercent >= 75
                  ? "#f97316"
                  : "#22c55e",
            }}
          />
        </div>

        <p style={{ fontStyle: "italic" }}>{budgetMessage}</p>

        {/* QUOTE MODE */}
        <label style={{ fontSize: "0.85rem" }}>
          Quote mode:&nbsp;
          <select
            value={quoteMode}
            onChange={(e) => setQuoteMode(e.target.value)}
          >
            <option value="professional">Professional</option>
            <option value="sarcastic">Sarcastic</option>
          </select>
        </label>

        {/* QUOTE */}
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            background: "#f9fafb",
            borderLeft: "4px solid #2563eb",
            fontStyle: "italic",
          }}
        >
          {quote}
        </div>
      </div>
    </div>
  );
}

export default Summary;
