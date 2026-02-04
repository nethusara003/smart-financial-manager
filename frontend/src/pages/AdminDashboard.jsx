import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  const [adminAnalytics, setAdminAnalytics] = useState(null);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  /* =========================
     FETCH USERS
  ========================= */
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FETCH ADMIN ANALYTICS
  ========================= */
  const fetchAdminAnalytics = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/analytics/overview",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();
      const data = await res.json();
      setAdminAnalytics(data);
    } catch {
      console.error("Failed to load admin analytics");
      setAdminAnalytics(null);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAdminAnalytics();
  }, []);

  /* =========================
     ROLE ACTIONS
  ========================= */
  const promoteUser = async (id) => {
    if (!window.confirm("Promote this user to admin?")) return;
    await fetch(`http://localhost:5000/api/admin/promote/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  const demoteUser = async (id) => {
    if (!window.confirm("Demote this admin to user?")) return;
    await fetch(`http://localhost:5000/api/admin/demote/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  /* =========================
     FETCH USER TRANSACTIONS
  ========================= */
  const fetchUserTransactions = async (user) => {
    setSelectedUser(user);
    setTxLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/users/${user._id}/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setTransactions(data);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  /* =========================
     STATS
  ========================= */
  const totalUsers = users.length;
  const admins = users.filter((u) => u.role === "admin").length;
  const regularUsers = users.filter((u) => u.role === "user").length;

  /* =========================
     PER-USER SUMMARY
  ========================= */
  const summary = transactions.reduce(
    (acc, tx) => {
      if (tx.type === "income") acc.income += tx.amount;
      if (tx.type === "expense") acc.expense += tx.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const netBalance = summary.income - summary.expense;

  /* =========================
     SAFE DESTRUCTURING
  ========================= */
  const systemUsers = adminAnalytics?.users;
  const systemTx = adminAnalytics?.transactions;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Admin Dashboard</h1>
      <p className="text-slate-500 mb-8">
        System overview & user management
      </p>

      {/* USER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Total Users" value={totalUsers} />
        <StatCard label="Admins" value={admins} />
        <StatCard label="Regular Users" value={regularUsers} />
      </div>

      {/* SYSTEM-WIDE ANALYTICS */}
      {systemUsers && systemTx && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard
            label="Total Transactions"
            value={systemTx.total}
          />
          <StatCard
            label="System Volume"
            value={`Rs. ${systemTx.totalVolume.toLocaleString()}`}
          />
          <StatCard
            label="Active Users (30d)"
            value={systemUsers.activeLast30Days}
          />
          <StatCard
            label="High-Risk Users"
            value={systemUsers.highRisk}
          />
        </div>
      )}

      <hr className="my-8 border-slate-200" />

      {/* USERS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Users</h2>

        {loading && <p>Loading users…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <table className="w-full text-sm">
            <thead className="text-slate-500 border-b">
              <tr>
                <th className="text-left py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b last:border-0 hover:bg-slate-50"
                >
                  <td className="py-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td className="font-medium">{u.role}</td>
                  <td className="flex gap-2 py-2">
                    {u._id === currentUser.id ? (
                      <span className="text-slate-400">You</span>
                    ) : (
                      <>
                        {u.role === "user" && (
                          <button
                            className="btn-primary"
                            onClick={() => promoteUser(u._id)}
                          >
                            Promote
                          </button>
                        )}
                        {u.role === "admin" &&
                          currentUser.role === "super_admin" && (
                            <button
                              className="btn-danger"
                              onClick={() => demoteUser(u._id)}
                            >
                              Demote
                            </button>
                          )}
                        <button
                          className="btn-secondary"
                          onClick={() => fetchUserTransactions(u)}
                        >
                          Transactions
                        </button>
                      </>
                    )}
                  </td>
                  <td>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* TRANSACTIONS */}
      {selectedUser && (
        <div className="mt-10 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-2">
            Transactions — {selectedUser.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              label="Income"
              value={`Rs. ${summary.income.toLocaleString()}`}
              color="text-emerald-600"
            />
            <SummaryCard
              label="Expense"
              value={`Rs. ${summary.expense.toLocaleString()}`}
              color="text-red-600"
            />
            <SummaryCard
              label="Net Balance"
              value={`Rs. ${netBalance.toLocaleString()}`}
              color={
                netBalance >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }
            />
            <SummaryCard
              label="Transactions"
              value={transactions.length}
              color="text-slate-700"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

/* =========================
   SMALL COMPONENTS
========================= */

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
    <p className="text-3xl font-semibold">{value}</p>
    <p className="text-sm text-slate-500 mt-1">{label}</p>
  </div>
);

const SummaryCard = ({ label, value, color }) => (
  <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className={`mt-1 text-lg font-semibold ${color}`}>
      {value}
    </p>
  </div>
);
