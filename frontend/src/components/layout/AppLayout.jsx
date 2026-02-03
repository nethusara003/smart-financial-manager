import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = ({ auth }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1">
        <Topbar auth={auth} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Content canvas */}
          <div className="min-h-full rounded-3xl bg-slate-50 shadow-xl p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
