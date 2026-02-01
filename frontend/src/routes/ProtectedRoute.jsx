import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ auth, adminOnly = false, children }) {
  if (!auth.initialized) return null;

  if (!auth.isAuthenticated && !auth.isGuest) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 BLOCK ADMINS FROM USER AREA
  if (!adminOnly && auth.user?.role?.includes("admin")) {
    return <Navigate to="/admin" replace />;
  }

  // 🔥 ADMIN-ONLY ROUTES
  if (adminOnly && !auth.user?.role?.includes("admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
