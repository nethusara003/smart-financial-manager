import { useEffect, useRef } from "react";
import { Bot, Sparkles } from "lucide-react";
import { useChat } from "../../hooks/useChat";

const formatTime = (timestamp) => {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const formatTokenUsage = (usage) => {
  if (!usage || typeof usage !== "object") {
    return null;
  }

  const prompt = Math.max(0, Number(usage.promptTokens) || 0);
  const completion = Math.max(0, Number(usage.completionTokens) || 0);
  const total = Math.max(0, Number(usage.totalTokens) || prompt + completion);

  if (prompt === 0 && completion === 0 && total === 0) {
    return "Tokens 0 (optimized fast reply)";
  }

  return `Tokens ${total} (in ${prompt}, out ${completion})`;
};

const ChatMessages = () => {
  const { messages, isTyping, error, assistantName, isGuestSession } = useChat();
  const bottomAnchorRef = useRef(null);

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  return (
    <section className="relative flex-1 overflow-y-auto p-4 custom-scrollbar md:p-5 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.14),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(45,212,191,0.08),transparent_40%),linear-gradient(180deg,#020617_0%,#041126_50%,#020617_100%)]">
      {messages.length === 0 && (
        <div className={`mx-auto mt-10 max-w-md rounded-3xl px-5 py-6 text-center shadow-[0_16px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl animate-fade-in ${
          isGuestSession
            ? 'border border-amber-500/30 bg-amber-500/10 text-amber-100'
            : 'border border-cyan-300/20 bg-slate-900/60 text-slate-100'
        }`}>
          <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${
            isGuestSession
              ? 'border border-amber-500/30 bg-amber-500/20 text-amber-200'
              : 'border border-cyan-300/30 bg-cyan-400/10 text-cyan-100'
          }`}>
            <Sparkles size={18} />
          </div>
          <p className="text-sm font-semibold tracking-wide">
            {isGuestSession ? "AI Assistant Not Available" : `${assistantName || "Tracksy"} is ready.`}
          </p>
          <p className="mt-1 text-xs">
            {isGuestSession
              ? "Guest sessions do not have access to the AI assistant. Sign in or create a free account to unlock personalized financial insights and advice."
              : "Ask about budgets, savings plans, debt payoff strategy, or monthly spending control."}
          </p>
          {isGuestSession && (
            <div className="mt-4 flex gap-2">
              <a href="/login" className="flex-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors">
                Sign In
              </a>
              <a href="/register" className="flex-1 rounded-lg border border-amber-500/50 bg-transparent px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/10 transition-colors">
                Create Account
              </a>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 md:space-y-5">
        {messages.map((message) => {
          const isUser = message.role === "user";
          const usageLabel = formatTokenUsage(message.usage);

          return (
            <article
              key={message.id}
              className={`chat-message-in flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[88%] items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                {!isUser && (
                  <div className="mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-100">
                    <Bot size={14} />
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 shadow-lg md:px-5 ${
                    isUser
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-blue-700/20"
                      : "border border-cyan-300/15 bg-slate-900/80 text-slate-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                    <span className={isUser ? "text-blue-100/90" : "text-slate-400"}>
                      {formatTime(message.timestamp)}
                    </span>
                    {!isUser && usageLabel && (
                      <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2 py-0.5 text-cyan-100/90">
                        {usageLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {isTyping && (
          <article className="chat-message-in flex justify-start">
            <div className="flex items-end gap-2">
              <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-100">
                <Bot size={14} />
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/85 px-4 py-3 text-slate-200 shadow-lg">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-200 [animation-delay:-0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-200 [animation-delay:-0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-200" />
                </div>
              </div>
            </div>
          </article>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/35 bg-red-500/10 px-3 py-2 text-xs text-red-200 animate-fade-in">
          {error}
        </div>
      )}

      <div ref={bottomAnchorRef} />
    </section>
  );
};

export default ChatMessages;