import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

function Summary({ auth }) {
  const navigate = useNavigate();

  /* ================= GUEST BLOCK ================= */

  if (auth?.isGuest) {
    return (
      <div className="summary-page">
        <h1>Financial Summary</h1>

        <div className="card">
          <p>
            You are using a demo account.  
            Please log in or create an account to view the full summary.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  /* ================= STATE ================= */

  const [transactions, setTransactions] = useState([]);
  const [compareMode, setCompareMode] = useState("daily");
  const [quoteMode, setQuoteMode] = useState("professional");

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    };

    fetchTransactions();
  }, [navigate]);

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

  /* ================= INSIGHT ================= */

  const current =
    compareMode === "daily"
      ? dailyData[1]
      : weeklyData[1];

  const previous =
    compareMode === "daily"
      ? dailyData[0]
      : weeklyData[0];

  const expenseDiff = current.expense - previous.expense;

  const expenseTrend =
    expenseDiff > 0
      ? "📈 Spending increased"
      : expenseDiff < 0
      ? "📉 Spending decreased"
      : "➖ No change in spending";

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

  const budgetMessage =
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

  let quote = "";

  if (weeklyBudget > 0 && weeklyExpense >= weeklyBudget) {
    quote =
      quoteMode === "sarcastic"
        ? "Congratulations, you murdered your budget."
        : "You have exceeded your weekly budget. Immediate action recommended.";
  } else if (expenseTotal > incomeTotal) {
    quote =
      quoteMode === "sarcastic"
        ? "Money is sprinting out faster than it walks in."
        : "Your expenses are higher than your income.";
  } else {
    quote =
      quoteMode === "sarcastic"
        ? "Still alive financially. Impressive."
        : "You’re managing your finances well.";
  }

  /* ================= UI ================= */

  return (
    <div className="summary-page">
      <h1>Financial Summary</h1>

      <button
        className="btn btn-secondary"
        onClick={() => navigate("/dashboard")}
        style={{ marginBottom: "16px" }}
      >
        ← Back to Dashboard
      </button>

      <div className="card">
        <h3>Overall Income vs Expense</h3>

        <div style={{ height: "300px", marginBottom: "12px" }}>
          <IncomeExpenseChart
            income={incomeTotal}
            expense={expenseTotal}
          />
        </div>

        <hr className="section-divider" />

        <h3>Income & Expense Comparison</h3>

        <label style={{ fontSize: "0.9rem" }}>
          Compare:&nbsp;
          <select
            value={compareMode}
            onChange={(e) => setCompareMode(e.target.value)}
          >
            <option value="daily">
              Today vs Yesterday
            </option>
            <option value="weekly">
              This Week vs Last Week
            </option>
          </select>
        </label>

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

        <p style={{ fontStyle: "italic" }}>
          {expenseTrend}
          {expenseDiff !== 0 &&
            ` by Rs. ${Math.abs(expenseDiff)}`}
        </p>

        <hr className="section-divider" />

        <h3>Weekly Budget Usage</h3>

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

        <p style={{ fontStyle: "italic" }}>
          {budgetMessage}
          {weeklyBudget > 0 &&
            ` (Rs. ${weeklyExpense} / Rs. ${weeklyBudget})`}
        </p>

        <label style={{ fontSize: "0.85rem" }}>
          Quote mode:&nbsp;
          <select
            value={quoteMode}
            onChange={(e) => setQuoteMode(e.target.value)}
          >
            <option value="professional">
              Professional
            </option>
            <option value="sarcastic">
              Sarcastic
            </option>
          </select>
        </label>

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
