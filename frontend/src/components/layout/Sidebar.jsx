import { NavLink } from "react-router-dom";

const Sidebar = ({ auth }) => {
  const userRole = auth?.user?.role;

  const link =
    "block px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition";

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      {/* Branding */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-semibold text-emerald-400">
          Smart Finance
        </h1>
        <p className="text-xs text-slate-400">
          Personal Financial Manager
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {/* CORE */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Core</p>
          <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
          <NavLink to="/transactions" className={link}>Transactions</NavLink>
          <NavLink to="/analytics" className={link}>Analytics</NavLink>
        </div>

        {/* PLANNING */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Planning</p>
          <NavLink to="/budgets" className={link}>Budgets</NavLink>
          <NavLink to="/recurring" className={link}>Recurring</NavLink>
          <NavLink to="/goals" className={link}>Goals</NavLink>
        </div>

        {/* REPORTS */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Reports</p>
          <NavLink to="/reports" className={link}>Reports</NavLink>
        </div>

        {/* ADMIN */}
        {(userRole === "admin" || userRole === "super_admin") && (
          <div>
            <p className="text-xs text-slate-500 mb-2">Administration</p>
            <NavLink to="/admin" className={link}>
              Admin Dashboard
            </NavLink>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <NavLink to="/settings" className={link}>Settings</NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
