import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { useChat } from "../../hooks/useChat";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const { sendChatMessage, isTyping } = useChat();

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
    <div className="border-t border-white/10 bg-[#020617]/85 p-4 backdrop-blur-md">
      <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-2">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={2000}
          placeholder="Ask your financial question..."
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none"
          disabled={isTyping}
        />

        <button
          type="button"
          onClick={submit}
          disabled={isTyping || value.trim().length === 0}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
          title="Send"
        >
          <SendHorizontal size={18} />
        </button>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        Press Enter to send. Press Shift + Enter for a new line.
      </p>
    </div>
  );
};

export default ChatInput;