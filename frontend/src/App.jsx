import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* PUBLIC PAGES */
import Login from "./pages/Login";
import Register from "./pages/Register";

/* USER PAGES */
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import Summary from "./pages/Summary";

/* ADMIN PAGES */
import AdminDashboard from "./pages/AdminDashboard";
import AdminAcceptInvite from "./pages/AdminAcceptInvite";

/* ROUTES & LAYOUT */
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isGuest: false,
    token: null,
    user: null,
    initialized: false,
  });

  /* INIT AUTH */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const guest = localStorage.getItem("guest");

    if (token && user) {
      setAuth({
        isAuthenticated: true,
        isGuest: false,
        token,
        user: JSON.parse(user),
        initialized: true,
      });
    } else if (guest === "true") {
      setAuth({
        isAuthenticated: false,
        isGuest: true,
        token: null,
        user: null,
        initialized: true,
      });
    } else {
      setAuth((prev) => ({ ...prev, initialized: true }));
    }
  }, []);

  if (!auth.initialized) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/accept-invite" element={<AdminAcceptInvite />} />

        {/* ================= USER (WITH LAYOUT) ================= */}
        <Route
          element={
            <ProtectedRoute auth={auth}>
              <AppLayout auth={auth} />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard auth={auth} />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/summary" element={<Summary />} />
        </Route>

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute auth={auth} adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= DEFAULT ================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
