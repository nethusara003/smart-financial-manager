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

  /* ================= STATE ================= */

  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("monthly");

  const [weeklyBudget, setWeeklyBudget] = useState(3000);
  const [monthlyBudget, setMonthlyBudget] = useState(5000);

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= AUTH CHECK (ON LOAD) ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchTransactions();
  }, []);

  /* ================= FETCH TRANSACTIONS ================= */

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // Token invalid or expired
        localStorage.clear();
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();

      // Defensive check
      if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchTransactions();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  /* ================= FILTERING ================= */

  const now = new Date();

  const filteredByView = Array.isArray(transactions)
    ? transactions.filter((t) => {
        const txDate = new Date(t.date);

        if (viewMode === "daily") {
          return txDate.toDateString() === now.toDateString();
        }

        if (viewMode === "weekly") {
          return isBetween(
            txDate,
            getStartOfISOWeek(now),
            getEndOfISOWeek(now)
          );
        }

        return (
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear()
        );
      })
    : [];

  const filteredTransactions =
    typeFilter === "all"
      ? filteredByView
      : filteredByView.filter((t) => t.type === typeFilter);

  /* ================= SUMMARY ================= */

  const incomeTotal = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expenseTotal = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = incomeTotal - expenseTotal;

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  /* ================= UI ================= */

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading dashboard...</p>;
  }

  return (
    <div className="dashboard">
      <h1>Smart Financial Tracker</h1>
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
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>

            &nbsp;&nbsp;

            <label>
              Type:&nbsp;
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
          </div>

          <ul className="transaction-list">
            {filteredTransactions.length === 0 ? (
              <p>No transactions found.</p>
            ) : (
              filteredTransactions.map((t) => (
                <TransactionItem
                  key={t._id}
                  transaction={t}
                  onDelete={handleDelete}
                  onEdit={(tx) => setEditingTransaction(tx)}
                />
              ))
            )}
          </ul>
        </div>

        {/* RIGHT */}
        <div className="card">
          <h3>Quick Summary</h3>
          <p>Income: {incomeTotal}</p>
          <p>Expense: {expenseTotal}</p>
          <p>Balance: {balance}</p>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/summary")}
          >
            View Full Summary →
          </button>

          <hr className="section-divider" />

          <h4>{viewMode === "weekly" ? "Weekly Budget" : "Monthly Budget"}</h4>

          <input
            type="number"
            min="0"
            value={viewMode === "weekly" ? weeklyBudget : monthlyBudget}
            onChange={(e) =>
              viewMode === "weekly"
                ? setWeeklyBudget(Number(e.target.value))
                : setMonthlyBudget(Number(e.target.value))
            }
          />
        </div>
      </div>

      <button className="btn btn-danger logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
