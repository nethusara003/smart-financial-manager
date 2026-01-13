import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Summary from "./pages/Summary";

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isGuest: false,
    token: null,
    initialized: false, // 🔹 important
  });

  // 🔹 Restore ONLY real login (token), NOT guest
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setAuth({
        isAuthenticated: true,
        isGuest: false,
        token,
        initialized: true,
      });
    } else {
      setAuth((prev) => ({
        ...prev,
        initialized: true,
      }));
    }
  }, []);

  // 🔹 Prevent rendering before auth is known
  if (!auth.initialized) {
    return <p style={{ padding: "20px" }}>Initializing app...</p>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* LOGIN (always accessible) */}
        <Route
          path="/login"
          element={<Login setAuth={setAuth} />}
        />

        {/* DASHBOARD (protected) */}
        <Route
          path="/dashboard"
          element={
            auth.isAuthenticated || auth.isGuest ? (
              <Dashboard auth={auth} setAuth={setAuth} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* SUMMARY (protected, guest blocked inside component) */}
        <Route
          path="/summary"
          element={
            auth.isAuthenticated || auth.isGuest ? (
              <Summary auth={auth} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
