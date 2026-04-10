import jwt from "jsonwebtoken";

/**
 * @typedef {Object} JWTPayload
 * @property {string} id - User ID
 * @property {string} role - User role
 */

export function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.split(" ")[1];
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function buildGuestUser(decoded) {
  return {
    id: decoded.sessionId,
    _id: decoded.sessionId,
    role: "guest",
    isGuest: true,
    sessionId: decoded.sessionId,
  };
}

export function requireAuth(req, res, next) {
  const requestId = req.requestId;
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
      requestId,
    });
  }

  try {
    const decoded = verifyAccessToken(token);

    // Type assertion for JWT payload
    if (typeof decoded === 'string') {
      return res.status(401).json({
        message: "Invalid token format",
        requestId,
      });
    }

    // Handle guest users
    if (decoded.role === "guest") {
      req.user = buildGuestUser(decoded);
      return next();
    }

    // Handle authenticated users
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      role: decoded.role,
      isGuest: false,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
      requestId,
    });
  }
}

export default requireAuth;
