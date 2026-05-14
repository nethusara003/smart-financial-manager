#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const DEFAULT_FRONTEND_URL = "https://smart-financial-tracker-v1.vercel.app";
const DEFAULT_BACKEND_URL = "https://smart-financial-tracker.onrender.com";
const DEFAULT_TIMEOUT_MS = 15000;

function parseArgs(argv) {
  const options = {
    frontendUrl: process.env.SMOKE_FRONTEND_URL || DEFAULT_FRONTEND_URL,
    backendUrl: process.env.SMOKE_BACKEND_URL || DEFAULT_BACKEND_URL,
    timeoutMs: Number.parseInt(process.env.SMOKE_TIMEOUT_MS || String(DEFAULT_TIMEOUT_MS), 10),
  };

  for (const arg of argv) {
    if (arg.startsWith("--frontend-url=")) {
      options.frontendUrl = arg.slice("--frontend-url=".length);
    } else if (arg.startsWith("--backend-url=")) {
      options.backendUrl = arg.slice("--backend-url=".length);
    } else if (arg.startsWith("--timeout-ms=")) {
      options.timeoutMs = Number.parseInt(arg.slice("--timeout-ms=".length), 10);
    }
  }

  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    options.timeoutMs = DEFAULT_TIMEOUT_MS;
  }

  options.frontendUrl = options.frontendUrl.replace(/\/+$/, "");
  options.backendUrl = options.backendUrl.replace(/\/+$/, "");

  return options;
}

function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeout));
}

async function checkFrontendRoute(baseUrl, routePath, timeoutMs) {
  const url = `${baseUrl}${routePath}`;
  const response = await fetchWithTimeout(url, { method: "GET" }, timeoutMs);
  const body = await response.text();
  const hasRoot = body.includes('<div id="root">');

  return {
    ok: response.status === 200 && hasRoot,
    details: `status=${response.status}, appShell=${hasRoot}`,
  };
}

async function checkBackendHealth(baseUrl, timeoutMs) {
  const response = await fetchWithTimeout(`${baseUrl}/health`, { method: "GET" }, timeoutMs);
  const payload = await response.json().catch(() => null);
  const ok = response.status === 200 && payload?.status === "healthy";

  return {
    ok,
    details: `status=${response.status}, body.status=${payload?.status || "n/a"}`,
  };
}

async function checkCorsPreflight(frontendUrl, backendUrl, timeoutMs) {
  const response = await fetchWithTimeout(`${backendUrl}/api/users/login`, {
    method: "OPTIONS",
    headers: {
      Origin: frontendUrl,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  }, timeoutMs);

  const allowedOrigin = response.headers.get("access-control-allow-origin");
  const ok = (response.status === 200 || response.status === 204) && allowedOrigin === frontendUrl;

  return {
    ok,
    details: `status=${response.status}, allow-origin=${allowedOrigin || "missing"}`,
  };
}

function runBackendSmoke(backendUrl, timeoutMs) {
  const smokeScriptPath = path.join(process.cwd(), "backend", "test", "smoke-api.js");
  const result = spawnSync(process.execPath, [smokeScriptPath], {
    env: {
      ...process.env,
      SMOKE_BASE_URL: backendUrl,
      SMOKE_TIMEOUT_MS: String(timeoutMs),
      SMOKE_REQUIRE_AUTH_CHECK: "false",
    },
    encoding: "utf8",
    timeout: Math.max(timeoutMs * 3, 30000),
  });

  const output = [result.stdout || "", result.stderr || ""].join("\n").trim();

  if (result.error) {
    return {
      ok: false,
      details: `failed to run backend smoke script: ${result.error.message}`,
      output,
    };
  }

  return {
    ok: result.status === 0,
    details: `exitCode=${result.status}`,
    output,
  };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const checks = [];

  console.log("[deploy-smoke] Starting deployment smoke checks");
  console.log(`[deploy-smoke] Frontend URL: ${options.frontendUrl}`);
  console.log(`[deploy-smoke] Backend URL: ${options.backendUrl}`);

  try {
    const frontendLogin = await checkFrontendRoute(options.frontendUrl, "/login", options.timeoutMs);
    checks.push({ name: "frontend /login serves app shell", ...frontendLogin });
  } catch (error) {
    checks.push({
      name: "frontend /login serves app shell",
      ok: false,
      details: error.message,
    });
  }

  try {
    const frontendDashboard = await checkFrontendRoute(options.frontendUrl, "/dashboard", options.timeoutMs);
    checks.push({ name: "frontend /dashboard resolves via SPA rewrite", ...frontendDashboard });
  } catch (error) {
    checks.push({
      name: "frontend /dashboard resolves via SPA rewrite",
      ok: false,
      details: error.message,
    });
  }

  try {
    const backendHealth = await checkBackendHealth(options.backendUrl, options.timeoutMs);
    checks.push({ name: "backend /health is healthy", ...backendHealth });
  } catch (error) {
    checks.push({
      name: "backend /health is healthy",
      ok: false,
      details: error.message,
    });
  }

  try {
    const corsCheck = await checkCorsPreflight(options.frontendUrl, options.backendUrl, options.timeoutMs);
    checks.push({ name: "backend CORS allows frontend origin", ...corsCheck });
  } catch (error) {
    checks.push({
      name: "backend CORS allows frontend origin",
      ok: false,
      details: error.message,
    });
  }

  const backendSmoke = runBackendSmoke(options.backendUrl, options.timeoutMs);
  checks.push({
    name: "backend API smoke suite",
    ok: backendSmoke.ok,
    details: backendSmoke.details,
    output: backendSmoke.output,
  });

  const failures = [];

  for (const check of checks) {
    if (check.ok) {
      console.log(`[PASS] ${check.name} (${check.details})`);
      continue;
    }

    failures.push(check);
    console.error(`[FAIL] ${check.name} (${check.details})`);
    if (check.output) {
      console.error(check.output);
    }
  }

  if (failures.length > 0) {
    console.error(`[deploy-smoke] Failed: ${failures.length} check(s)`);
    process.exit(1);
  }

  console.log("[deploy-smoke] All checks passed");
}

run().catch((error) => {
  console.error(`[deploy-smoke] Unexpected error: ${error.message}`);
  process.exit(1);
});
