// Middleware to check if admin is a superuser
const isSuperuser = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.admin.role !== "superuser") {
    return res.status(403).json({ message: "Superuser access required" });
  }

  next();
};

// Middleware to check if admin has admin or superuser role
const isAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!["admin", "superuser"].includes(req.admin.role)) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

// Middleware to check specific permissions
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Superuser has all permissions
    if (req.admin.role === "superuser") {
      return next();
    }

    // Check if permissions array exists and includes the required permission
    if (!req.admin.permissions || !req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        message: "Permission denied",
        required: permission,
        role: req.admin.role,
        permissions: req.admin.permissions || [],
      });
    }

    next();
  };
};

module.exports = {
  isSuperuser,
  isAdmin,
  hasPermission,
};
