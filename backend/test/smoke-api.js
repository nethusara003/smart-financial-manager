import jwt from "jsonwebtoken";

const baseUrl = (process.env.SMOKE_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");
const timeoutMs = Number.parseInt(process.env.SMOKE_TIMEOUT_MS || "10000", 10);
const requireAuthCheck = process.env.SMOKE_REQUIRE_AUTH_CHECK === "true";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestJson = async (path, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const rawBody = await response.text();
    let body = null;
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      }
    }

    return { status: response.status, body };
  } finally {
    clearTimeout(timeout);
  }
};

const waitForHealth = async () => {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const result = await requestJson("/health");
      if (result.status === 200) {
        return;
      }
    } catch {
      // Retry until timeout.
    }

    await sleep(1000);
  }

  throw new Error("Timed out waiting for /health endpoint");
};

const resolveBearerToken = async () => {
  if (process.env.SMOKE_BEARER_TOKEN) {
    return process.env.SMOKE_BEARER_TOKEN;
  }

  try {
    const guestLogin = await requestJson("/api/users/guest-login", {
      method: "POST",
      body: {},
    });

    if (guestLogin.status === 200 && guestLogin.body?.token) {
      return guestLogin.body.token;
    }
  } catch {
    // Fall through to JWT secret fallback.
  }

  if (process.env.SMOKE_JWT_SECRET) {
    return jwt.sign(
      { id: "507f1f77bcf86cd799439011", role: "user" },
      process.env.SMOKE_JWT_SECRET,
      { expiresIn: "10m" }
    );
  }

  return null;
};

const run = async () => {
  const failures = [];
  const checks = [];

  console.log(`[smoke] Base URL: ${baseUrl}`);

  try {
    await waitForHealth();
  } catch (error) {
    console.error(`[smoke] Service readiness check failed: ${error.message}`);
    process.exit(1);
  }

  try {
    const health = await requestJson("/health");
    const ok = health.status === 200 && health.body && health.body.status === "healthy";
    checks.push({ name: "health endpoint", ok, details: health });
  } catch (error) {
    checks.push({ name: "health endpoint", ok: false, details: error.message });
  }

  try {
    const walletUnauth = await requestJson("/api/wallet/balance");
    checks.push({
      name: "protected wallet endpoint rejects unauthenticated access",
      ok: walletUnauth.status === 401,
      details: walletUnauth,
    });
  } catch (error) {
    checks.push({
      name: "protected wallet endpoint rejects unauthenticated access",
      ok: false,
      details: error.message,
    });
  }

  try {
    const loansUnauth = await requestJson("/api/loans");
    checks.push({
      name: "protected loan endpoint rejects unauthenticated access",
      ok: loansUnauth.status === 401,
      details: loansUnauth,
    });
  } catch (error) {
    checks.push({
      name: "protected loan endpoint rejects unauthenticated access",
      ok: false,
      details: error.message,
    });
  }

  const token = await resolveBearerToken();
  if (token) {
    try {
      const loanCompare = await requestJson("/api/loans/compare", {
        method: "POST",
        token,
        body: { offers: [] },
      });
      const ok = [400, 401, 403].includes(loanCompare.status);
      checks.push({
        name: "authenticated protected endpoint path",
        ok,
        details: loanCompare,
      });
    } catch (error) {
      checks.push({
        name: "authenticated protected endpoint path",
        ok: false,
        details: error.message,
      });
    }
  } else if (requireAuthCheck) {
    checks.push({
      name: "authenticated protected endpoint path",
      ok: false,
      details: "SMOKE_BEARER_TOKEN or SMOKE_JWT_SECRET is required",
    });
  } else {
    console.log("[smoke] Skipping authenticated check (no token or jwt secret provided)");
  }

  checks.forEach((check) => {
    if (!check.ok) {
      failures.push(check);
      console.error(`[smoke][FAIL] ${check.name}`);
      console.error(`[smoke][FAIL] details: ${JSON.stringify(check.details)}`);
      return;
    }

    console.log(`[smoke][PASS] ${check.name}`);
  });

  if (failures.length > 0) {
    console.error(`[smoke] ${failures.length} check(s) failed.`);
    process.exit(1);
  }

  console.log("[smoke] All smoke checks passed.");
};

run().catch((error) => {
  console.error(`[smoke] Unexpected failure: ${error.message}`);
  process.exit(1);
});
