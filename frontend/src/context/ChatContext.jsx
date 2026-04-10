import { useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../services/apiClient";
import ChatContext from "./chatContextValue";

const CHAT_STORAGE_KEY = "sft.chat.messages.v1";
const CHAT_WIDTH_STORAGE_KEY = "sft.chat.width.v1";
const DEFAULT_CHAT_WIDTH = 33;
const MIN_CHAT_WIDTH = 20;
const MAX_CHAT_WIDTH = 60;

const clampWidth = (value) => Math.min(MAX_CHAT_WIDTH, Math.max(MIN_CHAT_WIDTH, value));

const normalizeStoredMessages = (storedValue) => {
  if (!Array.isArray(storedValue)) {
    return [];
  }

  return storedValue
    .filter((entry) => {
      if (!entry || typeof entry !== "object") {
        return false;
      }

      if (!(entry.role === "user" || entry.role === "assistant")) {
        return false;
      }

      return typeof entry.content === "string" && entry.content.trim().length > 0;
    })
    .map((entry) => ({
      id:
        typeof entry.id === "string" && entry.id.trim().length > 0
          ? entry.id
          : `${entry.role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      role: entry.role,
      content: entry.content,
      timestamp:
        typeof entry.timestamp === "string" && entry.timestamp.trim().length > 0
          ? entry.timestamp
          : new Date().toISOString(),
    }));
};

const loadStoredMessages = () => {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return normalizeStoredMessages(JSON.parse(raw));
  } catch {
    return [];
  }
};

const loadStoredWidth = () => {
  try {
    const raw = localStorage.getItem(CHAT_WIDTH_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_CHAT_WIDTH;
    }

    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      return DEFAULT_CHAT_WIDTH;
    }

    return clampWidth(parsed);
  } catch {
    return DEFAULT_CHAT_WIDTH;
  }
};

const createMessage = (role, content, timestamp = new Date().toISOString()) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  role,
  content,
  timestamp,
});

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState(loadStoredMessages);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [width, setWidth] = useState(loadStoredWidth);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(CHAT_WIDTH_STORAGE_KEY, String(width));
  }, [width]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const minimizeChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(true);
  }, []);

  const restoreChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError("");
  }, []);

  const setPanelWidth = useCallback((nextWidth) => {
    if (typeof nextWidth !== "number" || Number.isNaN(nextWidth)) {
      return;
    }

    setWidth(clampWidth(nextWidth));
  }, []);

  const sendChatMessage = useCallback(
    async (rawMessage) => {
      const content = String(rawMessage || "").trim();
      if (!content || isTyping) {
        return;
      }

      const history = messages
        .filter((entry) => entry.role === "user" || entry.role === "assistant")
        .map((entry) => ({
          role: entry.role,
          content: entry.content,
        }));

      setError("");
      setIsTyping(true);
      setMessages((previous) => [...previous, createMessage("user", content)]);

      try {
        const payload = await request("/chat", {
          method: "POST",
          body: {
            message: content,
            history,
          },
          fallbackMessage: "Failed to reach AI service",
        });

        if (Array.isArray(payload?.updatedHistory) && payload.updatedHistory.length > 0) {
          const rebuiltMessages = payload.updatedHistory
            .filter((entry) => entry && (entry.role === "user" || entry.role === "assistant"))
            .map((entry) =>
              createMessage(
                entry.role,
                String(entry.content || ""),
                new Date().toISOString()
              )
            );

          setMessages(rebuiltMessages);
          return;
        }

        const aiReply = typeof payload?.reply === "string" ? payload.reply.trim() : "";
        if (!aiReply) {
          throw new Error("The AI service returned an empty reply.");
        }

        setMessages((previous) => [...previous, createMessage("assistant", aiReply)]);
      } catch (requestError) {
        const nextError =
          requestError?.message || "Something went wrong while contacting the AI service.";
        setError(nextError);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, messages]
  );

  const value = useMemo(
    () => ({
      messages,
      isOpen,
      isMinimized,
      width,
      isTyping,
      error,
      openChat,
      closeChat,
      minimizeChat,
      restoreChat,
      clearMessages,
      setPanelWidth,
      sendChatMessage,
    }),
    [
      messages,
      isOpen,
      isMinimized,
      width,
      isTyping,
      error,
      openChat,
      closeChat,
      minimizeChat,
      restoreChat,
      clearMessages,
      setPanelWidth,
      sendChatMessage,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;