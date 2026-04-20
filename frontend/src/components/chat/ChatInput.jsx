import { useState } from "react";
import { CornerDownLeft, SendHorizontal } from "lucide-react";
import { useChat } from "../../hooks/useChat";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const { sendChatMessage, isTyping, usageTotals, totalUsage } = useChat();

  const currentTokens = Math.max(0, Number(usageTotals?.totalTokens) || 0);
  const globalTokens = Math.max(0, Number(totalUsage?.totalTokens) || 0);

  const submit = async () => {
    const nextMessage = value.trim();
    if (!nextMessage || isTyping) {
      return;
    }

    setValue("");
    await sendChatMessage(nextMessage);
  };

  const onKeyDown = async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await submit();
    }
  };

  return (
    <div className="border-t border-cyan-300/15 bg-[linear-gradient(180deg,rgba(4,18,38,0.84),rgba(2,8,23,0.92))] p-4 backdrop-blur-md">
      <div className="flex items-end gap-3 rounded-2xl border border-cyan-300/15 bg-slate-950/60 p-2 shadow-[inset_0_1px_0_rgba(148,163,184,0.15)]">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={2000}
          placeholder="Message Tracksy about your finances..."
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none"
          disabled={isTyping}
        />

        <button
          type="button"
          onClick={submit}
          disabled={isTyping || value.trim().length === 0}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/25 bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-[0_8px_24px_rgba(34,211,238,0.35)] transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
          title="Send"
        >
          <SendHorizontal size={18} />
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-2 text-[11px] text-slate-300/85 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-1.5">
          <CornerDownLeft size={12} /> Enter to send, Shift + Enter for new line.
        </p>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <span className="max-w-full rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-cyan-100">
            This chat: {currentTokens} tok
          </span>
          <span className="max-w-full rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-emerald-100">
            All chats: {globalTokens} tok
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;