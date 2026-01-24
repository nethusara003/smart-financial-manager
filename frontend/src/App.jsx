import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Summary from "./pages/Summary";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import Register from "./pages/Register";


function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isGuest: false,
    token: null,
    user: null,
    initialized: false,
  });

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
        {/* Login */}
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        {/* Register */}
        <Route path="/register" element={<Register />} />
        {/* Forgot Password (PUBLIC) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Reset Password (PUBLIC) */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard (PROTECTED) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute auth={auth}>
              <Dashboard auth={auth} />
            </ProtectedRoute>
          }
        />

        {/* Summary (PROTECTED) */}
        <Route
          path="/summary"
          element={
            <ProtectedRoute auth={auth}>
              <Summary auth={auth} />
            </ProtectedRoute>
          }
        />

        {/* Root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
