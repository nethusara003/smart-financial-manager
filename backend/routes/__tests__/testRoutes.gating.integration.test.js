import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../../app.js";

describe("testRoutes production gating", () => {
  it("returns 404 when debug routes are disabled", async () => {
    const app = createApp({ enableTestRoutes: false });

    const response = await request(app).get("/api/test/notification-settings");

    expect(response.status).toBe(404);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          statusCode: 404,
          requestId: expect.any(String),
        }),
      })
    );
    expect(response.body.error.message).toContain("Route not found");
  });

  it("returns 401 when debug routes are enabled without auth", async () => {
    const app = createApp({ enableTestRoutes: true });

    const response = await request(app).get("/api/test/notification-settings");

    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "No token provided",
        requestId: expect.any(String),
      })
    );
  });

  it("returns 403 when debug routes are enabled for non-admin user", async () => {
    const app = createApp({ enableTestRoutes: true });
    const token = jwt.sign({ id: "user-1", role: "user" }, process.env.JWT_SECRET);

    const response = await request(app)
      .get("/api/test/notification-settings")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: "Admin access required" });
  });
});
