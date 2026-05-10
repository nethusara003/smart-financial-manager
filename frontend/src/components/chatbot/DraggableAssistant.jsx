import { useState, useRef, useEffect } from "react";
import { MessageSquareText, Sparkles } from "lucide-react";
import { useChat } from "../../hooks/useChat";

const DraggableAssistant = () => {
  const { assistantName, isOpen, openChat } = useChat();
  const assistantLabel = assistantName || "Tracksy";

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const dragInfo = useRef({ startX: 0, startY: 0, moved: false });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      if (Math.abs(e.clientX - dragInfo.current.startX) > 3 || Math.abs(e.clientY - dragInfo.current.startY) > 3) {
        dragInfo.current.moved = true;
      }
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    dragInfo.current = { startX: e.clientX, startY: e.clientY, moved: false };
    setIsDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseUpLocal = (e) => {
    if (!dragInfo.current.moved) {
      openChat();
    }
  };

  if (isOpen) {
    return null;
  }

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUpLocal}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        background: 'linear-gradient(180deg, #172554 0%, #0c1a3a 35%, #08111f 65%, #02050b 100%)',
      }}
      className="group fixed bottom-6 right-6 z-[95] flex h-14 w-14 md:h-auto md:w-auto cursor-grab active:cursor-grabbing items-center justify-center md:justify-start gap-0 md:gap-3 rounded-full md:rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] p-1 md:px-4 md:py-3 text-left transition-[box-shadow,border-color] duration-200 hover:border-[rgba(59,130,246,0.5)] shadow-2xl"
    >
      <span className="relative flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 text-white shadow-[0_0_28px_rgba(59,130,246,0.28)] pointer-events-none">
        <MessageSquareText size={20} strokeWidth={1.5} />
        <Sparkles size={11} className="absolute -right-1 -top-1 text-blue-100 hidden md:block" />
      </span>

      <span className="min-w-0 pointer-events-none select-none hidden md:block">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-400">
          AI Assistant
        </span>
        <span className="mt-0.5 block truncate text-sm font-semibold text-white">
          {assistantLabel}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-[rgba(255,255,255,0.6)]">
          Ask about budgets, spending, and savings
        </span>
      </span>
    </div>
  );
};

export default DraggableAssistant;
