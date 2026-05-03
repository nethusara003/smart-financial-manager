import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ChatWindow from "../chat/ChatWindow";
import DraggableAssistant from "../chatbot/DraggableAssistant";

const AppLayout = ({ auth }) => {
  return (
    <div className="w-screen h-screen overflow-hidden m-0 p-0 bg-light-bg-base dark:bg-[#05070A] transition-colors">
      <Sidebar auth={auth} />
      <Topbar auth={auth} />

      <main
        id="main-content"
        className="mt-[80px] ml-0 md:ml-64 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar"
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
