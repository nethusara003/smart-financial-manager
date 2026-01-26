import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const checks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
  };

  const isStrongPassword =
    checks.length && checks.uppercase && checks.number;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid or missing reset token");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!isStrongPassword) {
      setMessage(
        "Password does not meet the required strength"
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        "http://localhost:5000/api/users/reset-password",
        { token, newPassword }
      );

      setMessage(res.data.message + " Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "80px auto" }}>
      <h2>Reset Password</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        {/* 🔐 LIVE PASSWORD RULES */}
        <ul style={{ fontSize: "12px", marginTop: "8px" }}>
          <li style={{ color: checks.length ? "green" : "red" }}>
            At least 8 characters
          </li>
          <li style={{ color: checks.uppercase ? "green" : "red" }}>
            One uppercase letter
          </li>
          <li style={{ color: checks.number ? "green" : "red" }}>
            One number
          </li>
        </ul>

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
