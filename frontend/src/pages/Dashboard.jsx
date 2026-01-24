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

function Dashboard({ auth }) {
  const navigate = useNavigate();

  /* ================= STATE ================= */

  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("monthly");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= DEMO DATA (GUEST) ================= */

  const demoTransactions = [
    {
      _id: "demo1",
      type: "income",
      amount: 50000,
      date: new Date(),
      category: "Demo",
      note: "Demo Salary",
    },
    {
      _id: "demo2",
      type: "expense",
      amount: 15000,
      date: new Date(),
      category: "Demo",
      note: "Demo Rent",
    },
  ];

  /* ================= AUTH GUARD (FIXED) ================= */

  useEffect(() => {
    if (!auth || !auth.initialized) return;

    // 🚫 No auth → login
    if (!auth.isAuthenticated && !auth.isGuest) {
      navigate("/login", { replace: true });
      return;
    }

    // 👤 Guest
    if (auth.isGuest) {
      setTransactions(demoTransactions);
      setLoading(false);
      return;
    }

    // ✅ Authenticated
    fetchTransactions();
    // eslint-disable-next-line
  }, [auth]);

  /* ================= FETCH TRANSACTIONS ================= */

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (auth.isGuest) return;

    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      fetchTransactions();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  /* ================= FILTERING ================= */

  const now = new Date();

  const filteredByView = transactions.filter((t) => {
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
  });

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

  /* ================= LOGOUT (FIXED) ================= */

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

      {auth.isGuest && (
        <div className="guest-warning">
          You are using a demo account. Some features are disabled.
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card">
          {!auth.isGuest && (
            <TransactionForm
              onAdded={fetchTransactions}
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
              auth={auth}
            />
          )}

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
                  disabled={auth.isGuest}
                />
              ))
            )}
          </ul>
        </div>

        <div className="card">
          <h3>Quick Summary</h3>
          <p>Income: {incomeTotal}</p>
          <p>Expense: {expenseTotal}</p>
          <p>Balance: {balance}</p>

          <button
            className="btn btn-primary"
            onClick={() => {
              if (auth.isGuest) {
                alert("Please sign in to access full summary features.");
                return;
              }
              navigate("/summary");
            }}
          >
            View Full Summary →
          </button>
        </div>
      </div>

      <button className="btn btn-danger logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
