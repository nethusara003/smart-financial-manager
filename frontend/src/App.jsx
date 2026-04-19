import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* PUBLIC PAGES */
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* USER PAGES */
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import AnalyticsHub from "./pages/AnalyticsHub";
import Budgets from "./pages/Budgets";
import Recurring from "./pages/Recurring";
import Reports from "./pages/Reports";
import Goals from "./pages/Goals";
import BillsReminders from "./pages/BillsReminders";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import ComponentShowcase from "./pages/ComponentShowcase";

/* NEW STAGE 4 FEATURES */
import FinancialHealth from "./pages/FinancialHealth";
import ExpenseForecast from "./pages/ExpenseForecast";
import Feedback from "./pages/Feedback";

/* P2P TRANSFER FEATURE */
import TransferHub from "./pages/TransferHub";
import TransferDetails from "./pages/TransferDetails";
import Wallet from "./pages/Wallet";

/* LOAN & EMI CALCULATOR FEATURE (STAGE 5) */
import LoansHub from "./pages/LoansHub";
import LoanDetails from "./pages/LoanDetails";
import EMICalculator from "./components/loans/EMICalculator";

/* ADMIN PAGES */
import AdminDashboard from "./pages/AdminDashboard";
import AdminAcceptInvite from "./pages/AdminAcceptInvite";

/* ROUTES & LAYOUT */
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import { fetchCurrentUserProfile } from "./hooks/useAuth";
import { API_BASE_URL } from "./services/apiClient";

const AUTH_STORAGE_SCOPE_KEY = "auth_storage_scope";
const AUTH_STORAGE_SCOPE_VERSION = `v3:${API_BASE_URL}:safe-clone-2026-04-19`;

function resetStaleAuthScope() {
  const existingScope = localStorage.getItem(AUTH_STORAGE_SCOPE_KEY);

  if (existingScope === AUTH_STORAGE_SCOPE_VERSION) {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("guest");
  localStorage.setItem(AUTH_STORAGE_SCOPE_KEY, AUTH_STORAGE_SCOPE_VERSION);
}

function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("guest");
}

function App() {
  const [auth, setAuth] = useState(() => {
    resetStaleAuthScope();

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const guest = localStorage.getItem("guest");

    if (token && user) {
      return {
        isAuthenticated: true,
        isGuest: false,
        token,
        user: JSON.parse(user),
        initialized: true,
      };
    } else if (guest === "true") {
      return {
        isAuthenticated: false,
        isGuest: true,
        token: null,
        user: null,
        initialized: true,
      };
    }
    
    return {
      isAuthenticated: false,
      isGuest: false,
      token: null,
      user: null,
      initialized: true,
    };
  });

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) {
      return;
    }

    let cancelled = false;

    const syncAuthFromServer = async () => {
      try {
        const profile = await fetchCurrentUserProfile();
        if (cancelled) {
          return;
        }

        if (!profile) {
          clearAuthStorage();
          setAuth({
            isAuthenticated: false,
            isGuest: false,
            token: null,
            user: null,
            initialized: true,
          });
          return;
        }

        const normalizedUser = {
          id: profile._id || profile.id,
          name: profile.name || auth.user?.name || "",
          email: profile.email || auth.user?.email || "",
          role: profile.role || auth.user?.role || "user",
        };

        localStorage.setItem("user", JSON.stringify(normalizedUser));

        setAuth((previous) => {
          if (
            previous.user?.id === normalizedUser.id &&
            previous.user?.email === normalizedUser.email &&
            previous.user?.role === normalizedUser.role
          ) {
            return previous;
          }

          return {
            ...previous,
            user: normalizedUser,
          };
        });
      } catch {
        if (cancelled) {
          return;
        }

        clearAuthStorage();
        setAuth({
          isAuthenticated: false,
          isGuest: false,
          token: null,
          user: null,
          initialized: true,
        });
      }
    };

    void syncAuthFromServer();

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.token, auth.user?.email, auth.user?.id, auth.user?.name, auth.user?.role]);

  if (!auth.initialized) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/accept-invite" element={<AdminAcceptInvite />} />

        {/* PROTECTED APP (USER + ADMIN SHARE SAME LAYOUT) */}
        <Route
          element={
            <ProtectedRoute auth={auth}>
              <AppLayout auth={auth} />
            </ProtectedRoute>
          }
        >
          {/* USER ROUTES */}
          <Route path="/dashboard" element={<Dashboard auth={auth} />} />
          <Route path="/transactions" element={<Transactions auth={auth} />} />
          <Route path="/analytics" element={<AnalyticsHub auth={auth} />} />
          <Route path="/budgets" element={<Budgets auth={auth} />} />
          <Route path="/budgets/:planId" element={<Budgets auth={auth} />} />
          <Route path="/recurring" element={<Recurring auth={auth} />} />
          <Route path="/reports" element={<Reports auth={auth} />} />
          <Route path="/goals" element={<Goals auth={auth} />} />
          <Route path="/bills-reminders" element={<BillsReminders auth={auth} />} />
          <Route path="/bills" element={<BillsReminders auth={auth} />} />
          <Route path="/reminders" element={<BillsReminders auth={auth} />} />
          <Route path="/settings" element={<Settings auth={auth} />} />
          <Route path="/help" element={<Help />} />
          <Route path="/components" element={<ComponentShowcase />} />

          {/* STAGE 4 INTELLIGENT FEATURES */}
          <Route path="/recommendations" element={<Navigate to="/financial-health" replace />} />
          <Route path="/financial-health" element={<FinancialHealth />} />
          <Route path="/forecast" element={<ExpenseForecast />} />
          <Route path="/feedback" element={<Feedback />} />

          {/* P2P TRANSFER FEATURE */}
          <Route path="/transfers" element={<TransferHub auth={auth} />} />
          <Route path="/transfer/:transferId" element={<TransferDetails auth={auth} />} />
          <Route path="/wallet" element={<Wallet auth={auth} />} />

          {/* LOAN & EMI CALCULATOR FEATURE (STAGE 5) */}
          <Route path="/loans" element={<LoansHub />} />
          <Route path="/loans/:id" element={<LoanDetails />} />
          <Route path="/loan-comparison" element={<Navigate to="/loans?tab=compare" replace />} />
          <Route path="/refinancing-calculator" element={<Navigate to="/loans?tab=refinancing" replace />} />
          <Route path="/debt-payoff-wizard" element={<Navigate to="/loans?tab=payoff-wizard" replace />} />
          <Route path="/emi-calculator" element={<EMICalculator />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute auth={auth} adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* FALLBACK */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
