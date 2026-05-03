import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockGenerateGroqReply = jest.fn();
const mockGetFullUserContext = jest.fn();
const mockBuildPrompt = jest.fn();
let sessionCounter = 0;

await jest.unstable_mockModule('../../services/groq.service.js', () => ({
  generateGroqReply: mockGenerateGroqReply,
}));

await jest.unstable_mockModule('../../Services/context.service.js', () => ({
  getFullUserContext: mockGetFullUserContext,
}));

await jest.unstable_mockModule('../../Services/promptBuilder.js', () => ({
  buildPrompt: mockBuildPrompt,
}));

const { handleChat } = await import('../../controllers/chat.controller.js');

describe('chat.controller token-limit behavior', () => {
  let req;
  let res;

  beforeEach(() => {
    sessionCounter += 1;

    req = {
      body: {
        message: 'How much did I spend this month?',
        history: [],
        sessionId: `session-test-${sessionCounter}`,
      },
      user: { _id: 'user-1' },
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockGenerateGroqReply.mockReset();
    mockGetFullUserContext.mockReset();
    mockBuildPrompt.mockReset();

    mockGetFullUserContext.mockResolvedValue({
      user: { name: 'Test User' },
      summary: { income: 1000, expenses: 500, savings: 500 },
      monthlySummary: { income: 1000, expenses: 500, savings: 500 },
      transactions: { count: 3, topSpendingCategories: [{ category: 'Food', amount: 300 }] },
      budgets: { items: [] },
      goals: { items: [] },
      loans: { count: 0, outstandingBalance: 0 },
      preferences: { currency: 'USD' },
    });

    mockBuildPrompt.mockReturnValue('prompt');
  });

  it('returns limit-fallback reply for model limit errors', async () => {
    const limitError = new Error('Request too large for model limits');
    limitError.statusCode = 429;
    mockGenerateGroqReply.mockRejectedValue(limitError);

    await handleChat(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'limit-fallback',
        reply: expect.stringContaining('exceeded the AI model limits'),
        retryAfterMs: expect.any(Number),
      })
    );
  });

  it('returns limit-cooldown reply without calling model during active cooldown', async () => {
    const limitError = new Error('Rate limit reached, retry in 3s');
    limitError.statusCode = 429;
    mockGenerateGroqReply.mockRejectedValue(limitError);

    await handleChat(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenLastCalledWith(
      expect.objectContaining({
        model: 'limit-fallback',
        retryAfterMs: expect.any(Number),
      })
    );

    res.status.mockClear();
    res.json.mockClear();

    await handleChat(req, res);

    expect(mockGenerateGroqReply).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'limit-cooldown',
        reply: expect.stringContaining('exceeded the AI model limits'),
        retryAfterMs: expect.any(Number),
      })
    );
  });

  it('truncates oversized message before building prompt', async () => {
    req.body.message = 'x'.repeat(1200);
    mockGenerateGroqReply.mockResolvedValue({
      reply: 'ok',
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      model: 'gemini-test',
    });

    await handleChat(req, res);

    expect(mockBuildPrompt).toHaveBeenCalledTimes(1);
    const truncatedMessage = mockBuildPrompt.mock.calls[0][1];
    expect(truncatedMessage.length).toBeLessThanOrEqual(503);
    expect(truncatedMessage.endsWith('...')).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('answers worst spending habit via deterministic path without model call', async () => {
    req.body.message = 'what is my worst spending habbit';

    await handleChat(req, res);

    expect(mockGenerateGroqReply).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'deterministic-path',
        reply: expect.stringContaining('worst spending habit'),
      })
    );
  });
});
