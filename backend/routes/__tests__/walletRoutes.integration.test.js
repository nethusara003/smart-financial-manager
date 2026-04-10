import { describe, it, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

import walletRoutes from "../../routes/walletRoutes.js";
import User from "../../models/User.js";
import Wallet from "../../models/Wallet.js";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/wallet", walletRoutes);
  return app;
};

const createUser = async (overrides = {}) => {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return User.create({
    name: "Wallet User",
    email: `wallet-${unique}@example.com`,
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

describe("walletRoutes integration", () => {
  it("returns 401 when no token is provided", async () => {
    const app = createTestApp();

    const response = await request(app).get("/api/wallet/balance");

    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "No token provided",
      })
    );
  });

  it("creates wallet on first balance request", async () => {
    const app = createTestApp();
    const user = await createUser();

    const response = await request(app)
      .get("/api/wallet/balance")
      .set(authHeaderForUser(user));

    const wallet = await Wallet.findOne({ user: user._id });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.wallet.balance).toBe(0);
    expect(wallet).not.toBeNull();
  });

  it("returns existing wallet on initialize when wallet already exists", async () => {
    const app = createTestApp();
    const user = await createUser();

    await Wallet.create({
      user: user._id,
      balance: 700,
      currency: "USD",
      status: "active",
    });

    const response = await request(app)
      .post("/api/wallet/initialize")
      .set(authHeaderForUser(user));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Wallet already exists");
    expect(response.body.wallet.balance).toBe(700);
  });
});
