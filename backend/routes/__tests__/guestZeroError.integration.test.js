import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

const mockCalculateFinancialHealthScore = jest.fn();
const mockGetFinancialHealthHistory = jest.fn();
const mockGenerateExpenseForecast = jest.fn();
const mockGetCategoryForecast = jest.fn();
const mockListRetirementPlans = jest.fn();

await jest.unstable_mockModule("../../Services/financialHealthService.js", () => ({
  calculateFinancialHealthScore: mockCalculateFinancialHealthScore,
  getFinancialHealthHistory: mockGetFinancialHealthHistory,
}));

await jest.unstable_mockModule("../../Services/forecastingService.js", () => ({
  generateExpenseForecast: mockGenerateExpenseForecast,
  getCategoryForecast: mockGetCategoryForecast,
}));

await jest.unstable_mockModule("../../modules/retirement/retirement.service.js", () => ({
  listRetirementPlans: mockListRetirementPlans,
  calculateRetirementPlan: jest.fn(),
  simulateRetirementPlan: jest.fn(),
  adviseRetirementPlan: jest.fn(),
  saveRetirementPlan: jest.fn(),
  refreshRetirementPlan: jest.fn(),
  RetirementInputError: class RetirementInputError extends Error {},
}));

const { createApp } = await import("../../app.js");

const createTestApp = () => createApp({ enableTestRoutes: false });

const signAuthToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || "test-secret-key");

const authHeaderForUser = (userId = "user-123") => ({
  Authorization: `Bearer ${signAuthToken({ id: userId, role: "user" })}`,
});

const guestHeader = (sessionId = "guest-123") => ({
  Authorization: `Bearer ${signAuthToken({ sessionId, role: "guest" })}`,
});

const resetMocks = () => {
  mockCalculateFinancialHealthScore.mockReset();
  mockGetFinancialHealthHistory.mockReset();
  mockGenerateExpenseForecast.mockReset();
  mockGetCategoryForecast.mockReset();
  mockListRetirementPlans.mockReset();

  mockCalculateFinancialHealthScore.mockResolvedValue({
    success: true,
    score: 84,
    grade: "B+",
    summary: "Healthy",
  });

  mockGetFinancialHealthHistory.mockResolvedValue([
    { month: "2026-04", score: 80 },
    { month: "2026-05", score: 84 },
  ]);

  mockGenerateExpenseForecast.mockResolvedValue({
    success: true,
    forecast: {
      totalProjectedExpenses: 120000,
      currency: "LKR",
    },
  });

  mockGetCategoryForecast.mockResolvedValue({
    success: true,
    forecast: {
      category: "Food",
      projectedExpense: 25000,
    },
  });

  mockListRetirementPlans.mockResolvedValue([
    {
      id: "plan-1",
      name: "Retirement Plan",
      projectedFund: 5000000,
      probability: 0.72,
    },
  ]);
};

describe("Zero-error guest session integration", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-key";
    resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/financial-health/score", () => {
    it("returns the happy-path score for an authenticated user", async () => {
      const app = createTestApp();

      const response = await request(app)
        .get("/api/financial-health/score?months=3")
        .set(authHeaderForUser());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        score: 84,
        grade: "B+",
        summary: "Healthy",
      });
      expect(mockCalculateFinancialHealthScore).toHaveBeenCalledWith("user-123", 3);
    });

    it("returns a defensive 200 response for a guest user", async () => {
      const app = createTestApp();

      const response = await request(app)
        .get("/api/financial-health/score?months=3")
        .set(guestHeader());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: false,
        message: "Guest sessions do not have persisted financial health data",
      });
      expect(mockCalculateFinancialHealthScore).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/forecasting/expenses", () => {
    it("returns the happy-path forecast for an authenticated user", async () => {
      const app = createTestApp();

      const response = await request(app)
        .get("/api/forecasting/expenses?months=6")
        .set(authHeaderForUser());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        forecast: {
          totalProjectedExpenses: 120000,
          currency: "LKR",
        },
      });
      expect(mockGenerateExpenseForecast).toHaveBeenCalledWith("user-123", 6);
    });

    it("returns a defensive 200 response for a guest user", async () => {
      const app = createTestApp();

      const response = await request(app)
        .get("/api/forecasting/expenses?months=6")
        .set(guestHeader());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: false,
        message: "Guest sessions do not have persisted forecasting data",
        forecast: null,
      });
      expect(mockGenerateExpenseForecast).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/retirement/plans", () => {
    it("returns saved plans for an authenticated user", async () => {
      const app = createTestApp();

      const response = await request(app)
        .get("/api/retirement/plans")
        .set(authHeaderForUser());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        plans: [
          {
            id: "plan-1",
            name: "Retirement Plan",
            projectedFund: 5000000,
            probability: 0.72,
          },
        ],
      });
      expect(mockListRetirementPlans).toHaveBeenCalledWith({ userId: "user-123" });
    });

    it("returns a defensive 200 response for a guest user", async () => {
      const app = createTestApp();

      const response = await request(app)
        .get("/api/retirement/plans")
        .set(guestHeader());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: false,
        message: "Guest sessions do not have persisted retirement plans",
        plans: [],
      });
      expect(mockListRetirementPlans).not.toHaveBeenCalled();
    });
  });

  describe("Negative auth handling", () => {
    it("returns 401 without a token and does not leak a stack trace", async () => {
      const app = createTestApp();

      const response = await request(app).get("/api/financial-health/score");

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: "No token provided",
        requestId: expect.any(String),
      });
      expect(response.body.stack).toBeUndefined();
      expect(response.body.error).toBeUndefined();
    });
  });
});