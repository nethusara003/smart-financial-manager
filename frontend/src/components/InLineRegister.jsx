import { useState } from "react";

function InlineRegister({ onSuccess, onCancel }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      // Save auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("guest");

      onSuccess();
    } catch {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        maxWidth: "420px",
      }}
    >
      <h3>Create an account to continue</h3>
      <p style={{ fontSize: "0.9rem", color: "#475569" }}>
        Save your data, track budgets, and view full financial summaries.
      </p>

      {error && (
        <p style={{ color: "#dc2626", fontSize: "0.85rem" }}>{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "8px" }}
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "8px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "8px" }}
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "12px" }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <button
            type="button"
            className="btn btn-edit"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default InlineRegister;
