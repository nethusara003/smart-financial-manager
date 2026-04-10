import { describe, it, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import loanRoutes from "../../routes/loanRoutes.js";
import Loan from "../../models/Loan.js";
import AmortizationSchedule from "../../models/AmortizationSchedule.js";
import User from "../../models/User.js";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/loans", loanRoutes);
  return app;
};

const createUser = async (overrides = {}) => {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return User.create({
    name: "Loan User",
    email: `loan-${unique}@example.com`,
    password: "hashed-password",
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

describe("loanRoutes integration", () => {
  it("returns 401 when token is missing", async () => {
    const app = createTestApp();

    const response = await request(app).post("/api/loans/compare").send({ offers: [] });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });

  it("returns 400 when EMI payload is incomplete", async () => {
    const app = createTestApp();
    const user = await createUser();

    const response = await request(app)
      .post("/api/loans/calculate-emi")
      .set(authHeaderForUser(user))
      .send({ principal: 100000 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Principal, interest rate, and tenure are required");
  });

  it("returns 400 when compare request has no offers", async () => {
    const app = createTestApp();
    const user = await createUser();

    const response = await request(app)
      .post("/api/loans/compare")
      .set(authHeaderForUser(user))
      .send({ offers: [] });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Please provide an array of loan offers");
  });

  it("creates a loan and persists amortization schedule", async () => {
    const app = createTestApp();
    const user = await createUser();

    const payload = {
      loanName: "Laptop Upgrade Loan",
      loanType: "personal",
      principalAmount: 120000,
      interestRate: 12,
      tenure: 24,
      startDate: "2025-01-01T00:00:00.000Z",
      paymentDay: 5,
    };

    const response = await request(app)
      .post("/api/loans")
      .set(authHeaderForUser(user))
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.loan.loanName).toBe(payload.loanName);

    const createdLoan = await Loan.findById(response.body.loan._id);
    const schedule = await AmortizationSchedule.findOne({ loanId: response.body.loan._id });

    expect(createdLoan).not.toBeNull();
    expect(createdLoan.userId.toString()).toBe(user._id.toString());
    expect(schedule).not.toBeNull();
    expect(schedule.schedule.length).toBe(payload.tenure);
  });

  it("compares offers and returns the lowest total-cost option first", async () => {
    const app = createTestApp();
    const user = await createUser();

    const response = await request(app)
      .post("/api/loans/compare")
      .set(authHeaderForUser(user))
      .send({
        offers: [
          { lender: "Bank A", principal: 50000, interestRate: 14, tenure: 24, processingFee: 4000 },
          { lender: "Bank B", principal: 50000, interestRate: 10, tenure: 24, processingFee: 1000 },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.comparisons).toHaveLength(2);
    expect(response.body.bestOffer.lender).toBe("Bank B");
    expect(response.body.comparisons[0].totalCost).toBeLessThanOrEqual(
      response.body.comparisons[1].totalCost
    );
  });

  it("returns 404 when recording payment for a non-existent loan", async () => {
    const app = createTestApp();
    const user = await createUser();
    const unknownLoanId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .post(`/api/loans/${unknownLoanId}/payments`)
      .set(authHeaderForUser(user))
      .send({ paymentAmount: 2500, createTransaction: false });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Loan not found");
  });

  it("records payment successfully for an active loan", async () => {
    const app = createTestApp();
    const user = await createUser();

    const createLoanResponse = await request(app)
      .post("/api/loans")
      .set(authHeaderForUser(user))
      .send({
        loanName: "Car Loan",
        loanType: "car",
        principalAmount: 500000,
        interestRate: 10,
        tenure: 60,
        startDate: "2025-01-01T00:00:00.000Z",
      });

    expect(createLoanResponse.status).toBe(201);
    const loanId = createLoanResponse.body.loan._id;

    const paymentResponse = await request(app)
      .post(`/api/loans/${loanId}/payments`)
      .set(authHeaderForUser(user))
      .send({
        paymentAmount: 10624,
        paymentType: "regular",
        createTransaction: false,
      });

    expect(paymentResponse.status).toBe(200);
    expect(paymentResponse.body.success).toBe(true);
    expect(paymentResponse.body.message).toBe("Payment recorded successfully");
    expect(paymentResponse.body.payment.loanId).toBe(loanId);
  });
});
