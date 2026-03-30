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

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
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
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = verifyAccessToken(token);

    // Type assertion for JWT payload
    if (typeof decoded === 'string') {
      return res.status(401).json({ message: "Invalid token format" });
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
    return res.status(401).json({ message: "Invalid token" });
  }
}

export default requireAuth;
