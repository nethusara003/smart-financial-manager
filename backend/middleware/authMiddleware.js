import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Type check for JWT payload
      if (typeof decoded === 'string') {
        return res.status(401).json({ message: "Invalid token format" });
      }

      // Cast to any to avoid TypeScript errors with custom JWT properties
      const payload = decoded;

      // Handle guest users
      if (payload.role === 'guest') {
        req.user = {
          _id: payload.sessionId,
          id: payload.sessionId,
          role: 'guest',
          isGuest: true,
          sessionId: payload.sessionId
        };
        return next();
      }

      // Handle authenticated users
      req.user = await User.findById(payload.id).select("-password");
      
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      req.user.isGuest = false;

      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Not authorized, token failed" });
    }
  }

  return res
    .status(401)
    .json({ message: "Not authorized, no token" });
};
