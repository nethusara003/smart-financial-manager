import { MessageSquareText, Sparkles } from "lucide-react";
import { useChat } from "../../hooks/useChat";

const ChatToggleButton = () => {
  const { assistantName, isOpen, openChat } = useChat();

  return (
    <button
      type="button"
      onClick={openChat}
      aria-label="Open Tracksy assistant"
      className={`group fixed bottom-6 right-6 z-[85] inline-flex items-center gap-2 rounded-full border border-cyan-200/35 bg-gradient-to-r from-[#0ea5e9] via-[#2563eb] to-[#0284c7] px-4 py-3 text-white shadow-[0_16px_45px_rgba(14,165,233,0.35)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 ${
        isOpen ? "pointer-events-none translate-y-3 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/20">
        <MessageSquareText size={18} />
        <Sparkles size={11} className="absolute -right-1 -top-1 text-cyan-100" />
      </div>
      <div className="text-left leading-tight">
        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-50/80">AI Assistant</p>
        <p className="text-sm font-semibold">{assistantName || "Tracksy"}</p>
      </div>
    </button>
  );
};

export default ChatToggleButton;