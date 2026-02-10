/**
 * Middleware to restrict guest users from accessing certain endpoints
 */

/**
 * Block guest users from accessing this endpoint
 */
export function blockGuests(req, res, next) {
  if (req.user?.isGuest) {
    return res.status(403).json({
      message: "This feature is not available for guest users. Please register to access this feature.",
      guestRestriction: true
    });
  }
  next();
}

/**
 * Require authenticated user (no guests allowed)
 */
export function requireAuthenticated(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (req.user.isGuest) {
    return res.status(403).json({
      message: "Please create an account to access this feature.",
      guestRestriction: true
    });
  }
  
  next();
}

/**
 * Allow both authenticated users and guests
 * (This is just a pass-through for documentation purposes)
 */
export function allowGuests(req, res, next) {
  next();
}

export default {
  blockGuests,
  requireAuthenticated,
  allowGuests
};
