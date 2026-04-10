import { Minimize2, X, Maximize2, Trash2 } from "lucide-react";
import { useChat } from "../../hooks/useChat";

const ChatHeader = ({ minimized = false }) => {
  const { minimizeChat, closeChat, restoreChat, clearMessages, isTyping } = useChat();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-blue-500/25 to-cyan-500/10 backdrop-blur-sm">
      <div>
        <h3 className="text-sm font-semibold text-white">Financial Assistant</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-blue-100">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          <span>{isTyping ? "AI is typing..." : "Online"}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!minimized && (
          <button
            type="button"
            onClick={clearMessages}
            className="rounded-md p-2 text-slate-200 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <Trash2 size={16} />
          </button>
        )}

        <button
          type="button"
          onClick={minimized ? restoreChat : minimizeChat}
          className="rounded-md p-2 text-slate-200 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          aria-label={minimized ? "Restore chat" : "Minimize chat"}
          title={minimized ? "Restore" : "Minimize"}
        >
          {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>

        <button
          type="button"
          onClick={closeChat}
          className="rounded-md p-2 text-slate-200 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          aria-label="Close chat"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;