import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ChatWindow from "../chat/ChatWindow";
import ChatToggleButton from "../chat/ChatToggleButton";

const AppLayout = ({ auth }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-primary transition-colors">
      {/* Sidebar */}
      <Sidebar auth={auth} />

      {/* Main area */}
      <div className="flex flex-col flex-1">
        <Topbar auth={auth} />

        {/* Scrollable content - No box wrapper, content flows naturally */}
        <main id="main-content" className="flex-1 overflow-y-auto px-3 py-4 md:px-4 md:py-5 custom-scrollbar transition-all duration-300 ease-out">
          <Outlet />
        </main>
      </div>

      <ChatWindow />
      <ChatToggleButton />
    </div>
  );
};

export default AppLayout;
