import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ auth, adminOnly = false, children }) => {
  // Not authenticated & not guest
  if (!auth?.isAuthenticated && !auth?.isGuest) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route
  if (adminOnly) {
    const user = auth?.user;

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin" && user.role !== "super_admin") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // ✅ SUPPORT BOTH PATTERNS
  // 1. Layout routes -> <Outlet />
  // 2. Direct wrapped components -> children
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
