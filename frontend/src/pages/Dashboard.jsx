import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TransactionForm from "../components/TransactionForm";
import TransactionItem from "../components/TransactionItem";

/* ================= ISO DATE HELPERS ================= */

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

function isBetween(date, start, end) {
  return date >= start && date <= end;
}

function Dashboard() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("monthly");

  const [weeklyBudget, setWeeklyBudget] = useState(3000);
  const [monthlyBudget, setMonthlyBudget] = useState(5000);

  const [budgetMode, setBudgetMode] = useState("monthly"); // weekly | monthly
  const [editingTransaction, setEditingTransaction] = useState(null);

  /* ================= FETCH ================= */

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/transactions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTransactions(data);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/transactions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /* ================= FILTERING ================= */

  const now = new Date();

  const filteredByView = transactions.filter((t) => {
    const txDate = new Date(t.date);

    if (viewMode === "daily") {
      return txDate.toDateString() === now.toDateString();
    }

    if (viewMode === "weekly") {
      return isBetween(txDate, getStartOfISOWeek(now), getEndOfISOWeek(now));
    }

    return (
      txDate.getMonth() === now.getMonth() &&
      txDate.getFullYear() === now.getFullYear()
    );
  });

  const filteredTransactions =
    typeFilter === "all"
      ? filteredByView
      : filteredByView.filter((t) => t.type === typeFilter);

  /* ================= SUMMARY ================= */

  const incomeTotal = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expenseTotal = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const balance = incomeTotal - expenseTotal;

  /* ================= BUDGET CALCULATION ================= */

  const weeklyExpense = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === "expense" &&
        d >= getStartOfISOWeek(now) &&
        d <= getEndOfISOWeek(now)
      );
    })
    .reduce((s, t) => s + t.amount, 0);

  const monthlyExpense = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === "expense" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, t) => s + t.amount, 0);

  const activeBudget =
    budgetMode === "weekly" ? weeklyBudget : monthlyBudget;

  const usedAmount =
    budgetMode === "weekly" ? weeklyExpense : monthlyExpense;

  const budgetPercent =
    activeBudget > 0
      ? Math.min((usedAmount / activeBudget) * 100, 100)
      : 0;

  let budgetMessage = "";
  if (budgetPercent >= 100) {
    budgetMessage = `You have exceeded your ${budgetMode} budget.`;
  } else if (budgetPercent >= 75) {
    budgetMessage = `You are close to your ${budgetMode} budget.`;
  } else {
    budgetMessage = `You are within your ${budgetMode} budget.`;
  }

  /* ================= UI ================= */

  return (
    <div className="dashboard">
      <h1>Smart Financial Manager</h1>
      <h2>Dashboard</h2>

      <div className="dashboard-grid">
        {/* LEFT */}
        <div className="card">
          <TransactionForm
            onAdded={fetchTransactions}
            editingTransaction={editingTransaction}
            onCancelEdit={() => setEditingTransaction(null)}
          />

          <div className="filters">
            <label>
              View:&nbsp;
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>

            &nbsp;&nbsp;

            <label>
              Type:&nbsp;
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
          </div>

          <ul className="transaction-list">
            {filteredTransactions.map((t) => (
              <TransactionItem
                key={t._id}
                transaction={t}
                onDelete={handleDelete}
                onEdit={(tx) => setEditingTransaction(tx)}
              />
            ))}
          </ul>
        </div>

        {/* RIGHT */}
        <div className="card">
          <h3>Quick Summary</h3>
          <p className="summary-income">Income: {incomeTotal}</p>
          <p className="summary-expense">Expense: {expenseTotal}</p>
          <p className="summary-balance">Balance: {balance}</p>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/summary")}
          >
            View Full Summary →
          </button>

          <hr className="section-divider" />

          <h4>Budget</h4>

          {/* Budget Toggle */}
          <div style={{ marginBottom: "8px" }}>
            <button
              className={`btn btn-sm ${
                budgetMode === "weekly" ? "btn-primary" : "btn-edit"
              }`}
              onClick={() => setBudgetMode("weekly")}
            >
              Weekly
            </button>

            <button
              className={`btn btn-sm ${
                budgetMode === "monthly" ? "btn-primary" : "btn-edit"
              }`}
              onClick={() => setBudgetMode("monthly")}
              style={{ marginLeft: "6px" }}
            >
              Monthly
            </button>
          </div>

          {/* Budget Input */}
          <input
            type="number"
            value={budgetMode === "weekly" ? weeklyBudget : monthlyBudget}
            onChange={(e) =>
              budgetMode === "weekly"
                ? setWeeklyBudget(Number(e.target.value))
                : setMonthlyBudget(Number(e.target.value))
            }
          />

          {/* Progress Bar */}
          <div
            style={{
              height: "10px",
              background: "#e5e7eb",
              borderRadius: "6px",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                width: `${budgetPercent}%`,
                height: "100%",
                borderRadius: "6px",
                background:
                  budgetPercent >= 90
                    ? "#dc2626"
                    : budgetPercent >= 75
                    ? "#f97316"
                    : "#22c55e",
              }}
            />
          </div>

          <p style={{ marginTop: "8px", fontStyle: "italic" }}>
            {budgetMessage}
          </p>
        </div>
      </div>

      <button
        className="btn btn-danger logout-btn"
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
