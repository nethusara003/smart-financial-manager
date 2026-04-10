import { Resizable } from "re-resizable";
import { useChat } from "../../hooks/useChat";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

const ChatWindow = () => {
  const { isOpen, isMinimized, width, closeChat, setPanelWidth } = useChat();

  const onResizeStop = (event, direction, ref) => {
    const nextPercent = (ref.offsetWidth / window.innerWidth) * 100;
    setPanelWidth(nextPercent);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/40 backdrop-blur-[12px] transition-opacity duration-300 ${
          isOpen && !isMinimized ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeChat}
      />

      <div
        className={`fixed inset-y-0 right-0 z-[80] transition-transform duration-300 ${
          isOpen && !isMinimized ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <Resizable
          size={{
            width: `${width}vw`,
            height: "100vh",
          }}
          minWidth={300}
          maxWidth="60vw"
          enable={{
            top: false,
            right: false,
            bottom: false,
            left: true,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          onResizeStop={onResizeStop}
          handleStyles={{
            left: {
              width: "8px",
              left: "-4px",
              cursor: "col-resize",
            },
          }}
          className="h-screen"
        >
          <section className="flex h-full flex-col border-l border-white/15 bg-[#020617]/90 shadow-[0_10px_60px_rgba(2,6,23,0.65)] backdrop-blur-xl">
            <ChatHeader />
            <ChatMessages />
            <ChatInput />
          </section>
        </Resizable>
      </div>

      <div
        className={`fixed bottom-6 right-6 z-[80] w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-300 ${
          isOpen && isMinimized
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <section className="overflow-hidden rounded-2xl border border-white/15 bg-[#020617]/90 shadow-2xl backdrop-blur-xl">
          <ChatHeader minimized />
        </section>
      </div>
    </>
  );
};

export default ChatWindow;