import { randomUUID } from "crypto";
import { logError, logInfo } from "../utils/logger.js";

const resolveActorType = (req) => {
  const role = req.user?.role;
  if (role === "guest") return "guest";
  if (role) return role;
  if (req.headers.authorization?.startsWith("Bearer ")) return "authenticated";
  return "anonymous";
};

export function requestContext(req, res, next) {
  const requestId = req.headers["x-request-id"] || randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}

export function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const elapsedNs = process.hrtime.bigint() - startedAt;
    const latencyMs = Number(elapsedNs) / 1e6;

    logInfo("request.completed", {
      requestId: req.requestId,
      method: req.method,
      route: req.originalUrl,
      statusCode: res.statusCode,
      latencyMs: Number(latencyMs.toFixed(2)),
      actorType: resolveActorType(req),
    });
  });

  next();
}

export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const isProduction = process.env.NODE_ENV === "production";

  logError("request.failed", {
    requestId: req.requestId,
    method: req.method,
    route: req.originalUrl,
    statusCode,
    actorType: resolveActorType(req),
    errorMessage: err.message || "Internal Server Error",
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      statusCode,
      requestId: req.requestId,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
}
