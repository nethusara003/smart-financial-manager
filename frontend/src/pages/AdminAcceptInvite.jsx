import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../services/apiClient";

const AdminAcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Accepting invitation...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // Invalid token
      setMessage("Invalid invitation link");
      return;
    }

    axios
      .post(apiUrl("/admin/accept-invite"), { token })
      .then(() => {
        setMessage("Admin role granted. Please login again.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      })
      .catch((err) => {
        setMessage(
          err.response?.data?.message || "Failed to accept invitation"
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ margin: "100px auto", textAlign: "center" }}>
      <h2>{message}</h2>
    </div>
  );
};

export default AdminAcceptInvite;
