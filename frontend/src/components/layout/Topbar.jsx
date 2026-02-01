import React from "react";

const Topbar = ({ auth }) => {
  return (
    <div className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-800">
      {/* Left: Welcome */}
      <div className="text-sm text-slate-300">
        Welcome back{" "}
        <span className="font-medium text-white">
          {auth?.user?.name || "User"}
        </span>
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">
            {auth?.user?.name}
          </p>
          <p className="text-xs text-slate-400">
            {auth?.user?.email}
          </p>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-semibold">
          {auth?.user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
