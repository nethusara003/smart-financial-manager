import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  /* =========================
     FETCH USERS
  ========================= */
  const fetchUsers = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FETCH ANALYTICS
  ========================= */
  const fetchAnalytics = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/analytics/overview",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, []);

  /* =========================
     PROMOTE / DEMOTE
  ========================= */
  const promoteUser = async (userId) => {
    if (!window.confirm("Promote this user to admin?")) return;

    await fetch(
      `http://localhost:5000/api/admin/promote/${userId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchUsers();
  };

  const demoteUser = async (userId) => {
    if (!window.confirm("Demote this admin to user?")) return;

    await fetch(
      `http://localhost:5000/api/admin/demote/${userId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchUsers();
  };

  /* =========================
     USER TRANSACTIONS
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

      if (!res.ok) throw new Error();
      setTransactions(await res.json());
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const totalUsers = users.length;
  const admins = users.filter((u) => u.role === "admin").length;
  const regularUsers = users.filter((u) => u.role === "user").length;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>
      <h1>Admin Dashboard</h1>
      <p>System overview & user management</p>

      {/* ANALYTICS */}
      <h2 style={{ marginTop: "30px" }}>System Analytics</h2>

      {analyticsLoading && <p>Loading analytics...</p>}

      {analytics && (
        <>
          <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
            <StatBox label="Total Income" value={analytics.totalIncome} />
            <StatBox label="Total Expense" value={analytics.totalExpense} />
            <StatBox label="Net Balance" value={analytics.netBalance} />
          </div>

          <div style={{ display: "flex", gap: "40px", marginTop: "30px" }}>
            <div>
              <h3>Top Categories</h3>
              <ul>
                {analytics.topCategories.map((c) => (
                  <li key={c._id}>
                    {c._id}: {c.totalAmount}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3>Top Spenders</h3>
              <ul>
                {analytics.topSpenders.map((u) => (
                  <li key={u.userId}>
                    {u.name} ({u.email}) – {u.totalSpent}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* USER STATS */}
      <h2 style={{ marginTop: "40px" }}>Users</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        <StatBox label="Total Users" value={totalUsers} />
        <StatBox label="Admins" value={admins} />
        <StatBox label="Regular Users" value={regularUsers} />
      </div>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && (
        <table style={{ width: "100%", marginTop: "30px" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><strong>{u.role}</strong></td>
                <td>
                  {u._id === currentUser.id ? (
                    "You"
                  ) : (
                    <>
                      {u.role === "user" ? (
                        <button style={promoteBtn} onClick={() => promoteUser(u._id)}>
                          Promote
                        </button>
                      ) : (
                        <button style={demoteBtn} onClick={() => demoteUser(u._id)}>
                          Demote
                        </button>
                      )}
                      <button
                        style={{ ...actionBtn, marginLeft: "8px" }}
                        onClick={() => fetchUserTransactions(u)}
                      >
                        Transactions
                      </button>
                    </>
                  )}
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* TRANSACTIONS */}
      {selectedUser && (
        <div style={{ marginTop: "40px" }}>
          <h2>Transactions – {selectedUser.email}</h2>

          {txLoading && <p>Loading transactions...</p>}

          {!txLoading && transactions.length === 0 && <p>No transactions</p>}

          {!txLoading && transactions.length > 0 && (
            <table style={{ width: "100%", marginTop: "15px" }}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>{t.type}</td>
                    <td>{t.category}</td>
                    <td>{t.amount}</td>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

/* =========================
   UI HELPERS
========================= */
const StatBox = ({ label, value }) => (
  <div
    style={{
      flex: 1,
      padding: "20px",
      borderRadius: "10px",
      background: "#f9fafb",
      textAlign: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    }}
  >
    <h2>{value}</h2>
    <p>{label}</p>
  </div>
);

const actionBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
};

const promoteBtn = {
  ...actionBtn,
  backgroundColor: "#2563eb",
  color: "white",
};

const demoteBtn = {
  ...actionBtn,
  backgroundColor: "#dc2626",
  color: "white",
};

export default AdminDashboard;
