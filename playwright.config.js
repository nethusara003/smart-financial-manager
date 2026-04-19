import { defineConfig, devices } from "@playwright/test";

const backendPort = Number(process.env.BACKEND_PORT || 5000);
const frontendPort = Number(process.env.FRONTEND_PORT || 5173);

const backendUrl = `http://127.0.0.1:${backendPort}`;
const frontendUrl = process.env.E2E_BASE_URL || `http://127.0.0.1:${frontendPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: frontendUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run start --prefix backend",
      url: `${backendUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || "test",
        PORT: String(backendPort),
        FRONTEND_URL: process.env.FRONTEND_URL || frontendUrl,
        MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sfm_e2e",
        JWT_SECRET: process.env.JWT_SECRET || "e2e-local-jwt-secret",
      },
    },
    {
      command: `npm run dev --prefix frontend -- --host 127.0.0.1 --port ${frontendPort}`,
      url: `${frontendUrl}/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        VITE_API_URL: process.env.VITE_API_URL || `${backendUrl}/api`,
      },
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
