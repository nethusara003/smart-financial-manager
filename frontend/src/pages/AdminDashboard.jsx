import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

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

      if (!res.ok) throw new Error();

      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================
     PROMOTE / DEMOTE
  ========================= */
  const promoteUser = async (userId) => {
    if (!window.confirm("Promote this user to admin?")) return;

    try {
      await fetch(
        `http://localhost:5000/api/admin/promote/${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch {
      alert("Failed to promote user");
    }
  };

  const demoteUser = async (userId) => {
    if (!window.confirm("Demote this admin to user?")) return;

    try {
      await fetch(
        `http://localhost:5000/api/admin/demote/${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch {
      alert("Failed to demote user");
    }
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

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

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1>Admin Dashboard</h1>
          <p>System overview & user management</p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "#111827",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <StatBox label="Total Users" value={totalUsers} />
        <StatBox label="Admins" value={admins} />
        <StatBox label="Regular Users" value={regularUsers} />
      </div>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
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
  <span style={{ color: "#6b7280" }}>You</span>
) : u.role === "super_admin" ? (
  <span style={{ color: "#6b7280" }}>Super Admin</span>
) : (
  <>
    {u.role === "user" &&
  (currentUser.role === "admin" ||
    currentUser.role === "super_admin") && (
    <button
      style={promoteBtn}
      onClick={() => promoteUser(u._id)}
    >
      Promote to Admin
    </button>
)}



    {u.role === "admin" &&
      currentUser.role === "super_admin" && (
        <button
          style={demoteBtn}
          onClick={() => demoteUser(u._id)}
        >
          Demote to User
        </button>
      )}

    <button
      style={{ ...actionBtn, marginLeft: "8px" }}
      onClick={() => fetchUserTransactions(u)}
    >
      View Transactions
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
          <h2>
            Transactions — {selectedUser.name} ({selectedUser.email})
          </h2>

          {txLoading && <p>Loading transactions...</p>}

          {!txLoading && transactions.length === 0 && (
            <p>No transactions found.</p>
          )}

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
   SMALL COMPONENTS
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
  fontWeight: "500",
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
