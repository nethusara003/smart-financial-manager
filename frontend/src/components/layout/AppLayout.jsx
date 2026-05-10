import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ChatWindow from "../chat/ChatWindow";
import DraggableAssistant from "../chatbot/DraggableAssistant";

const AppLayout = ({ auth }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="w-screen h-screen overflow-hidden m-0 p-0 bg-light-bg-base dark:bg-[#05070A] transition-colors"
      style={{ "--sidebar-width": "clamp(15rem, 22vw, 18rem)" }}
    >
      <Sidebar
        auth={auth}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <Topbar
        auth={auth}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={toggleMobileSidebar}
      />

      <main
        id="main-content"
        className="mt-[80px] ml-0 md:ml-[var(--sidebar-width)] h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar"
      >
        <div className="p-4 md:p-6 w-full">
          <Outlet />
        </div>
      </main>

      <ChatWindow />
      <DraggableAssistant />
    </div>
  );
};

export default AppLayout;
