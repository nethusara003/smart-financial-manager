import { MessageSquareText } from "lucide-react";
import { useChat } from "../../hooks/useChat";

const ChatToggleButton = () => {
  const { isOpen, openChat } = useChat();

  return (
    <button
      type="button"
      onClick={openChat}
      aria-label="Open financial assistant"
      className={`fixed bottom-6 right-6 z-[85] inline-flex h-14 w-14 items-center justify-center rounded-full border border-blue-300/40 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:brightness-110 ${
        isOpen ? "pointer-events-none translate-y-3 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <MessageSquareText size={22} />
    </button>
  );
};

export default ChatToggleButton;