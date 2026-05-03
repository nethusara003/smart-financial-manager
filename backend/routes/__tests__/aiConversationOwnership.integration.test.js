import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

const mockHandleChat = jest.fn();
const mockGetConversationHistory = jest.fn();
const mockGetUserConversations = jest.fn();
const mockStartNewConversation = jest.fn();
const mockLoadContext = jest.fn();
const mockGetContextualInfo = jest.fn();
const mockGetContextualSuggestions = jest.fn();
const mockConversationFindOneAndDelete = jest.fn();
const mockConversationFindOne = jest.fn();

await jest.unstable_mockModule("../../controllers/chat.controller.js", () => ({
  handleChat: mockHandleChat,
}));

await jest.unstable_mockModule("../../utils/contextManager.js", () => ({
  loadContext: mockLoadContext,
  getContextualInfo: mockGetContextualInfo,
  startNewConversation: mockStartNewConversation,
  getConversationHistory: mockGetConversationHistory,
  getUserConversations: mockGetUserConversations,
  getContextualSuggestions: mockGetContextualSuggestions,
}));

await jest.unstable_mockModule("../../models/Conversation.js", () => ({
  default: {
    findOneAndDelete: mockConversationFindOneAndDelete,
    findOne: mockConversationFindOne,
  },
}));

const { createApp } = await import("../../app.js");

const createTestApp = () => createApp({ enableTestRoutes: false });

const signAuthToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || "test-secret-key");

const authHeaderForUser = (userId = "user-123") => ({
  Authorization: `Bearer ${signAuthToken({ id: userId, role: "user" })}`,
});

const guestHeader = (sessionId = "guest-123") => ({
  Authorization: `Bearer ${signAuthToken({ sessionId, role: "guest" })}`,
});

const resetMocks = () => {
  mockHandleChat.mockReset();
  mockGetConversationHistory.mockReset();
  mockGetUserConversations.mockReset();
  mockStartNewConversation.mockReset();
  mockLoadContext.mockReset();
  mockGetContextualInfo.mockReset();
  mockGetContextualSuggestions.mockReset();
  mockConversationFindOneAndDelete.mockReset();
  mockConversationFindOne.mockReset();

  mockGetConversationHistory.mockResolvedValue({
    messages: [
      {
        id: "message-1",
        role: "user",
        content: "Hello",
        timestamp: new Date().toISOString(),
      },
    ],
    hasMore: false,
    total: 1,
    page: 2,
    limit: 25,
  });
};

describe("AI conversation ownership", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-key";
    resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("uses the authenticated JWT user id when fetching conversation history", async () => {
    const app = createTestApp();

    const response = await request(app)
      .get("/api/ai/conversations/conv-123?page=2&limit=25")
      .set(authHeaderForUser("user-123"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      messages: [
        {
          id: "message-1",
          role: "user",
          content: "Hello",
          timestamp: expect.any(String),
        },
      ],
      hasMore: false,
      total: 1,
      page: 2,
      limit: 25,
    });
    expect(mockGetConversationHistory).toHaveBeenCalledWith("conv-123", "user-123", 2, 25);
  });

  it("rejects a manually supplied userId override", async () => {
    const app = createTestApp();

    const response = await request(app)
      .get("/api/ai/conversations/conv-123?userId=someone-else")
      .set(authHeaderForUser("user-123"));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      error: "User ID override is not allowed",
    });
    expect(mockGetConversationHistory).not.toHaveBeenCalled();
  });

  it("returns an empty guest history response instead of hitting the database", async () => {
    const app = createTestApp();

    const response = await request(app)
      .get("/api/ai/conversations/conv-guest")
      .set(guestHeader());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: false,
      message: "Guest sessions do not have saved chat history",
      conversationId: "conv-guest",
      messages: [],
      hasMore: false,
      total: 0,
    });
    expect(mockGetConversationHistory).not.toHaveBeenCalled();
  });
});
