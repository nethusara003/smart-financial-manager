export const adminMiddleware = (req, res, next) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "super_admin"
  ) {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};
