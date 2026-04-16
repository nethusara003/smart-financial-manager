import { describe, it, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

import budgetRoutes from "../../routes/budgetRoutes.js";
import User from "../../models/User.js";
import Transaction from "../../models/Transaction.js";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/budgets", budgetRoutes);
  return app;
};

const createUser = async (overrides = {}) => {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return User.create({
    name: "Budget User",
    email: `budget-${unique}@example.com`,
    password: "hashed-password",
    currency: "LKR",
    monthlySalary: 400000,
    savingsPercentage: 25,
    ...overrides,
  });
};

const authHeaderForUser = (user) => {
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role || "user" },
    process.env.JWT_SECRET
  );

  return { Authorization: `Bearer ${token}` };
};

describe("budgetRoutes adaptive integration", () => {
  it("returns 401 on status endpoint when token is missing", async () => {
    const app = createTestApp();

    const response = await request(app).get("/api/budgets/status");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });

  it("returns 400 when salary configuration is missing", async () => {
    const app = createTestApp();
    const user = await createUser({ monthlySalary: null });

    const response = await request(app)
      .get("/api/budgets/status")
      .set(authHeaderForUser(user));

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Monthly salary/i);
  });

  it("returns SAFE status with projected limits when no expenses exist", async () => {
    const app = createTestApp();
    const user = await createUser({ monthlySalary: 400000, savingsPercentage: 25 });

    const response = await request(app)
      .get("/api/budgets/status")
      .set(authHeaderForUser(user));

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("SAFE");
    expect(response.body.savings).toBe(100000);
    expect(response.body.usableBudget).toBe(300000);
    expect(response.body.remaining).toBe(300000);
  });

  it("ignores earlier expenses when expense start mode is start_from_now", async () => {
    const app = createTestApp();
    const startFromNow = new Date();
    const user = await createUser({
      monthlySalary: 400000,
      savingsPercentage: 25,
      expenseStartMode: "start_from_now",
      expenseStartDate: startFromNow,
    });

    await Transaction.create({
      user: user._id,
      type: "expense",
      category: "food",
      amount: 50000,
      date: new Date(startFromNow.getTime() - 2 * 60 * 60 * 1000),
    });

    const response = await request(app)
      .get("/api/budgets/status")
      .set(authHeaderForUser(user));

    expect(response.status).toBe(200);
    expect(response.body.expenseStartMode).toBe("start_from_now");
    expect(response.body.spent).toBe(0);
    expect(response.body.status).toBe("SAFE");
  });

  it("respects budget period days when calculating spend", async () => {
    const app = createTestApp();
    const now = new Date();
    const user = await createUser({
      monthlySalary: 400000,
      savingsPercentage: 25,
      budgetPeriodDays: 5,
      budgetPeriodStartDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });

    await Transaction.insertMany([
      {
        user: user._id,
        type: "expense",
        category: "food",
        amount: 50000,
        date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        user: user._id,
        type: "expense",
        category: "food",
        amount: 20000,
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);

    const response = await request(app)
      .get("/api/budgets/status")
      .set(authHeaderForUser(user));

    expect(response.status).toBe(200);
    expect(response.body.periodDays).toBe(5);
    expect(response.body.spent).toBe(20000);
  });

  it("returns CRISIS when usable budget is exhausted", async () => {
    const app = createTestApp();
    const user = await createUser({ monthlySalary: 400000, savingsPercentage: 25 });

    await Transaction.create({
      user: user._id,
      type: "expense",
      category: "entertainment",
      amount: 310000,
      date: new Date(),
    });

    const response = await request(app)
      .get("/api/budgets/status")
      .set(authHeaderForUser(user));

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("CRISIS");
    expect(response.body.dailyLimit).toBe(0);
    expect(response.body.blockedCategories).toContain("all");
  });

  it("returns analysis with category and history insights", async () => {
    const app = createTestApp();
    const user = await createUser({ monthlySalary: 400000, savingsPercentage: 20 });

    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 10);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 10);

    await Transaction.insertMany([
      {
        user: user._id,
        type: "expense",
        category: "food",
        amount: 20000,
        date: now,
      },
      {
        user: user._id,
        type: "expense",
        category: "entertainment",
        amount: 35000,
        date: oneMonthAgo,
      },
      {
        user: user._id,
        type: "expense",
        category: "shopping",
        amount: 18000,
        date: twoMonthsAgo,
      },
    ]);

    const response = await request(app)
      .get("/api/budgets/analysis")
      .set(authHeaderForUser(user));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status");
    expect(response.body).toHaveProperty("categoryBreakdown");
    expect(response.body).toHaveProperty("historyInsights");
    expect(response.body.historyInsights.topSpendingCategories.length).toBeGreaterThan(0);
  });
});
