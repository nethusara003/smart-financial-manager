import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Summary from "./pages/Summary";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminAcceptInvite from "./pages/AdminAcceptInvite";


function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isGuest: false,
    token: null,
    user: null,
    initialized: false,
  });

  // Initialize auth once
  useEffect(() => {
    const token = localStorage.getItem("token");
    const guest = localStorage.getItem("guest");
    const user = localStorage.getItem("user");

    if (token && user) {
      setAuth({
        isAuthenticated: true,
        isGuest: false,
        token,
        user: JSON.parse(user),
        initialized: true,
      });
      return;
    }

    if (guest === "true") {
      setAuth({
        isAuthenticated: false,
        isGuest: true,
        token: null,
        user: null,
        initialized: true,
      });
      return;
    }

    setAuth((prev) => ({ ...prev, initialized: true }));
  }, []);

  return (
    <BrowserRouter key={auth.initialized ? "ready" : "loading"}>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute auth={auth}>
              <Dashboard auth={auth} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/summary"
          element={
            <ProtectedRoute auth={auth}>
              <Summary auth={auth} />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute auth={auth} adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= DEFAULTS ================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/admin/accept-invite" element={<AdminAcceptInvite />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
