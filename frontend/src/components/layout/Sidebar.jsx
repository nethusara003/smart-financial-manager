import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  const linkClass =
    "block px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition";

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-semibold text-emerald-400">
          Smart Finance
        </h1>
        <p className="text-xs text-slate-400">Financial Assistant</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/transactions" className={linkClass}>
          Transactions
        </NavLink>
        <NavLink to="/analytics" className={linkClass}>
          Analytics
        </NavLink>
        <NavLink to="/goals" className={linkClass}>
          Goals
        </NavLink>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
