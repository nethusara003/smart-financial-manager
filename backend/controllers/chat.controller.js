import jwt from "jsonwebtoken";
import { generateGroqReply } from "../Services/groq.service.js";
import { getFullUserContext } from "../Services/context.service.js";
import { buildPrompt } from "../Services/promptBuilder.js";

const MAX_HISTORY_MESSAGES = 5;
const sessionHistoryStore = new Map();
const FALLBACK_LIMIT_REPLY =
  "I could not process that full request because it exceeded the AI model limits. Please ask a shorter question or start a new chat, and I will help step by step.";

const INTENT_KEYWORDS = {
  summary: ["summary", "summery", "all time", "all-time", "overview", "report"],
  expenses: ["expense", "expenses", "spending", "overspending"],
  loans: ["loan", "loans", "emi", "interest", "outstanding"],
  budgets: ["budget", "budgets", "limit", "category budget"],
  goals: ["goal", "goals", "target", "progress", "deadline"],
};

const LIGHT_GREETING_MESSAGES = new Set([
  "hi",
  "hii",
  "hiii",
  "hello",
  "hey",
  "hey there",
  "hello there",
  "hi there",
  "good morning",
  "good afternoon",
  "good evening",
]);

const LIGHT_ACK_MESSAGES = new Set([
  "thanks",
  "thank you",
  "ok",
  "okay",
  "cool",
  "great",
  "nice",
]);

const normalizeUserId = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getRequestUserId = (req, payloadUserId) => {
  const bodyUserId = normalizeUserId(payloadUserId);
  if (bodyUserId) {
    return bodyUserId;
  }

  const reqUserId = req?.user?._id || req?.user?.id;
  if (reqUserId) {
    return String(reqUserId);
  }

  const authHeader = req?.headers?.authorization;
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const payload = decoded && typeof decoded === "object" ? decoded : null;
    const tokenUserId = payload?.id || payload?._id;

    return tokenUserId ? String(tokenUserId) : null;
  } catch {
    return null;
  }
};

const detectIntent = (message) => {
  const normalized = String(message || "").toLowerCase();

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return intent;
    }
  }

  return "general";
};

const normalizeLightMessage = (message) => {
  return String(message || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getLightweightReply = (message) => {
  const normalized = normalizeLightMessage(message);

  if (!normalized || normalized.length > 40) {
    return null;
  }

  if (LIGHT_GREETING_MESSAGES.has(normalized)) {
    return {
      intent: "greeting",
      reply: "Hi! How can I help with your finances today?",
    };
  }

  if (LIGHT_ACK_MESSAGES.has(normalized)) {
    return {
      intent: "general",
      reply: "Anytime. Tell me what you want to check next.",
    };
  }

  return null;
};

const normalizeHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((entry) => {
      if (!entry || typeof entry !== "object") {
        return false;
      }

      if (!("role" in entry) || !("content" in entry)) {
        return false;
      }

      return (
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.content === "string" &&
        entry.content.trim().length > 0
      );
    })
    .map((entry) => ({
      role: entry.role,
      content: entry.content.trim(),
    }));
};

const getBaseHistory = ({ sessionId, history }) => {
  if (sessionId && sessionHistoryStore.has(sessionId)) {
    return sessionHistoryStore.get(sessionId).slice(-MAX_HISTORY_MESSAGES);
  }

  return normalizeHistory(history).slice(-MAX_HISTORY_MESSAGES);
};

const appendAndStoreHistory = ({ sessionId, baseHistory, userMessage, assistantReply }) => {
  const updatedHistory = [
    ...baseHistory,
    { role: "user", content: userMessage },
    { role: "assistant", content: assistantReply },
  ].slice(-MAX_HISTORY_MESSAGES);

  if (sessionId) {
    sessionHistoryStore.set(sessionId, updatedHistory);
  }

  return updatedHistory;
};

const isPromptLimitError = (error) => {
  const status = Number(error?.statusCode || 0);
  const message = String(error?.message || "").toLowerCase();

  if (status === 413 || status === 429) {
    return true;
  }

  return (
    message.includes("request too large") ||
    message.includes("tokens per minute") ||
    message.includes("model limits") ||
    message.includes("rate limit")
  );
};

export const handleChat = async (req, res) => {
  try {
    const { message, history = [], sessionId, conversationId, userId } = req.body || {};

    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        error: "message is required and must be a non-empty string",
      });
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({
        error: "history must be an array when provided",
      });
    }

    if (
      sessionId !== undefined &&
      (typeof sessionId !== "string" || sessionId.trim().length === 0)
    ) {
      return res.status(400).json({
        error: "sessionId must be a non-empty string when provided",
      });
    }

    const fallbackConversationId =
      typeof conversationId === "string" ? conversationId.trim() : null;
    const normalizedSessionId =
      typeof sessionId === "string" && sessionId.trim().length > 0
        ? sessionId.trim()
        : fallbackConversationId;

    const userMessage = message.trim();
    const baseHistory = getBaseHistory({
      sessionId: normalizedSessionId,
      history,
    });

    const resolvedUserId = getRequestUserId(req, userId);
    if (!resolvedUserId) {
      const reply = "Please sign in to access your personalized financial assistant.";
      const updatedHistory = appendAndStoreHistory({
        sessionId: normalizedSessionId,
        baseHistory,
        userMessage,
        assistantReply: reply,
      });

      return res.status(401).json({
        reply,
        updatedHistory,
        sessionId: normalizedSessionId,
        conversationId: normalizedSessionId,
      });
    }

    const lightweight = getLightweightReply(userMessage);
    if (lightweight) {
      const updatedHistory = appendAndStoreHistory({
        sessionId: normalizedSessionId,
        baseHistory,
        userMessage,
        assistantReply: lightweight.reply,
      });

      return res.status(200).json({
        reply: lightweight.reply,
        intent: lightweight.intent,
        updatedHistory,
        sessionId: normalizedSessionId,
        conversationId: normalizedSessionId,
      });
    }

    const intent = detectIntent(userMessage);

    const context = await getFullUserContext(resolvedUserId);
    const prompt = buildPrompt(context, userMessage, intent);

    let reply;
    try {
      reply = await generateGroqReply(prompt);
    } catch (error) {
      if (isPromptLimitError(error)) {
        reply = FALLBACK_LIMIT_REPLY;
      } else {
        throw error;
      }
    }

    const updatedHistory = appendAndStoreHistory({
      sessionId: normalizedSessionId,
      baseHistory,
      userMessage,
      assistantReply: reply,
    });

    return res.status(200).json({
      reply,
      intent,
      updatedHistory,
      sessionId: normalizedSessionId,
      conversationId: normalizedSessionId,
      contextMeta: {
        userName: context?.user?.name || "User",
        transactionCount: context?.transactions?.count || 0,
        activeLoanCount: context?.loans?.count || 0,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || "Failed to process chat request",
    });
  }
};

export default handleChat;
