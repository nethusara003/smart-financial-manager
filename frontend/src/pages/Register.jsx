import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        password,
      });

      setMessage("Account created successfully. You can now log in.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-brand">
        <h1>Smart Financial Manager</h1>
        <p>Create your account to start tracking finances.</p>
      </div>

      <div className="login-form-wrapper">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Create Account</h2>

          {error && <div className="error">{error}</div>}
          {message && <div style={{ color: "green" }}>{message}</div>}

          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button className="primary-btn" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>

          <div className="login-links">
            <Link to="/login">← Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
