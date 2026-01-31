import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/login.css";

function Login({ setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ STORE AUTH DATA
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );
      localStorage.removeItem("guest");

      setAuth({
        isAuthenticated: true,
        isGuest: false,
        token: data.token,
        user: data,
      });

      // ✅ FIXED ROLE-BASED REDIRECT
      if (data.role === "admin" || data.role === "super_admin") {
        window.location.replace("/admin");
      } else {
        window.location.replace("/dashboard");
      }
    } catch {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem("guest", "true");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth({
      isAuthenticated: false,
      isGuest: true,
      token: null,
      user: null,
    });

    window.location.replace("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-brand">
        <h1>Smart Financial Manager</h1>
        <p>
          Manage your income, expenses, and budgets with clarity and control.
        </p>
      </div>

      <div className="login-form-wrapper">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <p className="subtitle">Access your financial dashboard</p>

          {error && <div className="error">{error}</div>}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={handleGuestLogin}
          >
            Continue as Guest
          </button>

          <div className="login-links">
            <Link to="/forgot-password" className="link">
              Forgot password?
            </Link>

            <Link to="/register" className="link">
              Create new account
            </Link>

            {(() => {
  const auth = localStorage.getItem("user");
  if (!auth) return null;

  const user = JSON.parse(auth);

  if (user.role === "admin" || user.role === "super_admin") {
    return (
      <Link to="/admin" className="link">
        Admin dashboard
      </Link>
    );
  }

  return null;
})()}

          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
