const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (req.admin.role !== requiredRole) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
  };
};

module.exports = roleMiddleware;