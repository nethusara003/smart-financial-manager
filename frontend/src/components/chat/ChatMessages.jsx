import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
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

const ChatMessages = () => {
  const { messages, isTyping, error } = useChat();
  const bottomAnchorRef = useRef(null);

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  return (
    <section className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gradient-to-b from-[#020617]/60 via-[#020617]/40 to-[#020617]/70">
      {messages.length === 0 && (
        <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-slate-200 animate-fade-in">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
            <Bot size={20} className="text-blue-300" />
          </div>
          <p className="text-sm font-medium">Your assistant is ready.</p>
          <p className="mt-1 text-xs text-slate-300">
            Ask about budgeting, savings, debt reduction, or monthly planning.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <article
              key={message.id}
              className={`chat-message-in flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                  isUser
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    : "border border-white/10 bg-slate-800/85 text-slate-100"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`mt-2 text-[11px] ${
                    isUser ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </article>
          );
        })}

        {isTyping && (
          <article className="chat-message-in flex justify-start">
            <div className="rounded-2xl border border-white/10 bg-slate-800/85 px-4 py-3 text-slate-200 shadow-lg">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300" />
              </div>
            </div>
          </article>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-200 animate-fade-in">
          {error}
        </div>
      )}

      <div ref={bottomAnchorRef} />
    </section>
  );
};

export default ChatMessages;