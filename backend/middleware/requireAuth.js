import jwt from "jsonwebtoken";

/**
 * @typedef {Object} JWTPayload
 * @property {string} id - User ID
 * @property {string} role - User role
 */

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Type assertion for JWT payload
    if (typeof decoded === 'string') {
      return res.status(401).json({ message: "Invalid token format" });
    }

    req.user = {
      id: decoded.id,
      _id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export default requireAuth;
