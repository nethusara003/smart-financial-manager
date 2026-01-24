import { Navigate } from "react-router-dom";

function ProtectedRoute({ auth, children }) {
  // ⏳ Wait until auth is initialized
  if (!auth.initialized) {
    return null;
  }

  // ❌ Not logged in and not guest
  if (!auth.isAuthenticated && !auth.isGuest) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allowed
  return children;
}

export default ProtectedRoute;
