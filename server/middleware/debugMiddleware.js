/**
 * Debug middleware to log authentication and permission information
 */
const debugAuth = (req, res, next) => {
  console.log("=== DEBUG AUTH ===");
  console.log("Request URL:", req.originalUrl);
  console.log("Request Method:", req.method);

  // Log headers
  console.log("Authorization Header:", req.header("Authorization"));

  // Log admin info if available
  if (req.admin) {
    console.log("Admin ID:", req.admin._id);
    console.log("Admin Role:", req.admin.role);
    console.log("Admin Permissions:", req.admin.permissions);
  } else {
    console.log("No admin data in request");
  }

  console.log("==================");
  next();
};

module.exports = { debugAuth };
