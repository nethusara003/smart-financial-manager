import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setAuth }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= NORMAL LOGIN ================= */

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
        setLoading(false);
        return;
      }

      // ✅ Persist authenticated user ONLY
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Update global auth state
      setAuth({
        isAuthenticated: true,
        isGuest: false,
        token: data.token,
        initialized: true,
      });

      navigate("/dashboard", { replace: true });
    } catch {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GUEST LOGIN ================= */

  const handleGuestLogin = () => {
    // ❌ DO NOT persist guest in localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // ✅ Session-only guest mode
    setAuth({
      isAuthenticated: false,
      isGuest: true,
      token: null,
      initialized: true,
    });

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="card" style={{ maxWidth: "420px", margin: "0 auto" }}>
      <h2>Login</h2>

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
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

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <hr className="section-divider" />

      <button
        className="btn btn-edit"
        onClick={handleGuestLogin}
        style={{ width: "100%" }}
      >
        Continue as Guest
      </button>
    </div>
  );
}

export default Login;
