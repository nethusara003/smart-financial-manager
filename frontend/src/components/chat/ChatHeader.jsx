import { FolderOpen, Maximize2, Minimize2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useChat } from "../../hooks/useChat";

const formatCount = (value) =>
  new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.max(0, Number(value) || 0));

const ChatHeader = ({ minimized = false, onToggleHistory }) => {
  const {
    assistantName,
    activeConversation,
    usageTotals,
    lastResponseUsage,
    conversations,
    isTyping,
    minimizeChat,
    closeChat,
    restoreChat,
    clearMessages,
    startNewConversation,
  } = useChat();

  const totalTokens = usageTotals?.totalTokens || 0;
  const lastTokens = lastResponseUsage?.totalTokens || 0;

  return (
    <header className="relative overflow-hidden border-b border-cyan-300/20 bg-gradient-to-r from-[#0f172a] via-[#0b1f3f] to-[#082f49]">
      <div className="pointer-events-none absolute -left-12 -top-10 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />

      <div className="relative px-3 py-3 md:px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
            {!minimized && onToggleHistory && (
              <button
                type="button"
                onClick={onToggleHistory}
                className="rounded-xl border border-cyan-300/25 bg-white/5 p-2 text-cyan-100 transition hover:bg-white/10 md:hidden"
                aria-label="Open chat history"
                title="History"
              >
                <FolderOpen size={16} />
              </button>
            )}

            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-300/30 to-blue-500/20 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.25)] md:h-10 md:w-10">
              <Sparkles size={16} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold tracking-wide text-slate-100 md:text-base">
                {assistantName || "Tracksy"}
              </h3>
              <div className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-cyan-100/90">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
                <span className="whitespace-nowrap">{isTyping ? "Thinking..." : "Online"}</span>
                {!minimized && (
                  <span className="truncate text-cyan-100/70">
                    {activeConversation?.title || "New Chat"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {!minimized && (
              <>
                <button
                  type="button"
                  onClick={startNewConversation}
                  className="rounded-lg border border-cyan-300/30 bg-cyan-400/10 p-2 text-cyan-100 transition hover:bg-cyan-300/20"
                  aria-label="Start new chat"
                  title="New chat"
                >
                  <Plus size={15} />
                </button>

                <button
                  type="button"
                  onClick={clearMessages}
                  className="rounded-lg border border-white/20 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
                  aria-label="Clear active chat"
                  title="Clear active chat"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={minimized ? restoreChat : minimizeChat}
              className="rounded-lg border border-white/20 bg-white/5 p-2 text-slate-100 transition hover:bg-white/10"
              aria-label={minimized ? "Restore chat" : "Minimize chat"}
              title={minimized ? "Restore" : "Minimize"}
            >
              {minimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
            </button>

            <button
              type="button"
              onClick={closeChat}
              className="rounded-lg border border-white/20 bg-white/5 p-2 text-slate-100 transition hover:bg-white/10"
              aria-label="Close chat"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {!minimized && (
          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <div className="flex shrink-0 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-50">
              Last: <span className="ml-1 font-semibold">{formatCount(lastTokens)} tok</span>
            </div>
            <div className="flex shrink-0 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-50">
              Total: <span className="ml-1 font-semibold">{formatCount(totalTokens)} tok</span>
            </div>
            <div className="flex shrink-0 rounded-xl border border-white/20 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200/90">
              Chats: <span className="ml-1 font-semibold">{conversations.length}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;