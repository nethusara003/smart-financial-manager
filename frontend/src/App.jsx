import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

/* PUBLIC PAGES */
import Login from "./pages/Login";
import Register from "./pages/Register";

/* USER PAGES */
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import Recurring from "./pages/Recurring";
import Reports from "./pages/Reports";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import ComponentShowcase from "./pages/ComponentShowcase";

/* NEW STAGE 4 FEATURES */
import BudgetRecommendations from "./pages/BudgetRecommendations";
import FinancialHealth from "./pages/FinancialHealth";
import ExpenseForecast from "./pages/ExpenseForecast";
import Feedback from "./pages/Feedback";

/* P2P TRANSFER FEATURE */
import TransferHub from "./pages/TransferHub";
import TransferDetails from "./pages/TransferDetails";

/* LOAN & EMI CALCULATOR FEATURE (STAGE 5) */
import Loans from "./pages/Loans";
import LoanDetails from "./pages/LoanDetails";
import LoanComparison from "./pages/LoanComparison";
import RefinancingPage from "./pages/RefinancingPage";
import DebtPayoffPage from "./pages/DebtPayoffPage";
import EMICalculator from "./components/loans/EMICalculator";

/* ADMIN PAGES */
import AdminDashboard from "./pages/AdminDashboard";
import AdminAcceptInvite from "./pages/AdminAcceptInvite";

/* ROUTES & LAYOUT */
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

function App() {
  const [auth, setAuth] = useState(() => {
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

  if (!auth.initialized) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/register" element={<Register />} />
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
          <Route path="/analytics" element={<Analytics auth={auth} />} />
          <Route path="/budgets" element={<Budgets auth={auth} />} />
          <Route path="/recurring" element={<Recurring auth={auth} />} />
          <Route path="/reports" element={<Reports auth={auth} />} />
          <Route path="/goals" element={<Goals auth={auth} />} />
          <Route path="/settings" element={<Settings auth={auth} />} />
          <Route path="/help" element={<Help />} />
          <Route path="/components" element={<ComponentShowcase />} />

          {/* STAGE 4 INTELLIGENT FEATURES */}
          <Route path="/recommendations" element={<BudgetRecommendations />} />
          <Route path="/financial-health" element={<FinancialHealth />} />
          <Route path="/forecast" element={<ExpenseForecast />} />
          <Route path="/feedback" element={<Feedback />} />

          {/* P2P TRANSFER FEATURE */}
          <Route path="/transfers" element={<TransferHub auth={auth} />} />
          <Route path="/transfer/:transferId" element={<TransferDetails auth={auth} />} />

          {/* LOAN & EMI CALCULATOR FEATURE (STAGE 5) */}
          <Route path="/loans" element={<Loans />} />
          <Route path="/loans/:id" element={<LoanDetails />} />
          <Route path="/loan-comparison" element={<LoanComparison />} />
          <Route path="/refinancing-calculator" element={<RefinancingPage />} />
          <Route path="/debt-payoff-wizard" element={<DebtPayoffPage />} />
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
