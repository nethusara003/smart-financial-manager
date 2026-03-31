import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAcceptAdminInvite } from "../hooks/useAdminDashboard";

const AdminAcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutateAsync: acceptAdminInvite } = useAcceptAdminInvite();
  const hasAttemptedRef = useRef(false);
  const token = searchParams.get("token");
  const [message, setMessage] = useState(
    token ? "Accepting invitation..." : "Invalid invitation link"
  );

  useEffect(() => {
    if (hasAttemptedRef.current) {
      return;
    }
    hasAttemptedRef.current = true;
    let timeoutId;

    if (!token) {
      return;
    }

    acceptAdminInvite({ token })
      .then(() => {
        setMessage("Admin role granted. Please login again.");
        timeoutId = setTimeout(() => {
          navigate("/login");
        }, 2000);
      })
      .catch((error) => {
        setMessage(error?.message || "Failed to accept invitation");
      });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [acceptAdminInvite, navigate, token]);

  return (
    <div style={{ margin: "100px auto", textAlign: "center" }}>
      <h2>{message}</h2>
    </div>
  );
};

export default AdminAcceptInvite;
