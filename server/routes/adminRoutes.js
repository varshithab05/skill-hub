const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");
const {
  isSuperuser,
  isAdmin,
  hasPermission,
} = require("../middleware/roleCheck");
const { debugAuth } = require("../middleware/debugMiddleware");

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /admin/current:
 *   get:
 *     summary: Get current admin details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current admin details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *
 * /admin/jobs:
 *   get:
 *     summary: Get all jobs (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all jobs
 *
 * /admin/reports:
 *   get:
 *     summary: Get reports (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports data
 *
 * /admin/create:
 *   post:
 *     summary: Create new admin (Superuser only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       201:
 *         description: Admin created successfully
 *
 * /admin/{id}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin details
 *   patch:
 *     summary: Update admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *   delete:
 *     summary: Delete admin (Superuser only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *
 * /admin/{id}/permissions:
 *   patch:
 *     summary: Update admin permissions (Superuser only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Permissions updated successfully
 */

// Public routes
router.post("/login", adminController.login);

// Debug route to test authentication
router.get("/debug-auth", adminAuth, debugAuth, (req, res) => {
  res.json({
    message: "Authentication successful",
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
      permissions: req.admin.permissions || [],
    },
  });
});

// Protected routes
router.use(adminAuth); // Apply admin authentication middleware to all routes below
router.use(debugAuth); // Add debug middleware to log authentication info

// Get current admin
router.get("/current", adminController.getCurrentAdmin);

// User Management Routes
router.get("/users", hasPermission("manageUsers"), adminController.getAllUsers);
router.put(
  "/users/:id",
  hasPermission("manageUsers"),
  adminController.updateUser
);
router.delete(
  "/users/:id",
  hasPermission("manageUsers"),
  adminController.deleteUser
);

// Job Management Routes
router.get("/jobs", hasPermission("manageJobs"), adminController.getAllJobs);
router.delete(
  "/jobs/:id",
  hasPermission("manageJobs"),
  adminController.deleteJob
);
router.put("/jobs/:id", hasPermission("manageJobs"), adminController.updateJob);

// Reports and Analytics Routes
router.get(
  "/reports",
  hasPermission("viewReports"),
  adminController.getReports
);
router.get(
  "/reports/statistics",
  hasPermission("viewReports"),
  adminController.getStatistics
);
router.get(
  "/reports/activities",
  hasPermission("viewReports"),
  adminController.getRecentActivities
);

// Superuser only routes
router.post("/create", isSuperuser, adminController.createAdmin);
router.get("/all", isSuperuser, adminController.getAllAdmins);
router.delete("/:id", isSuperuser, adminController.deleteAdmin);
router.patch(
  "/:id/permissions",
  isSuperuser,
  adminController.updatePermissions
);

// Admin and Superuser routes
router.get("/:id", isAdmin, adminController.getAdminById);
router.patch("/:id", isAdmin, adminController.updateAdmin);

module.exports = router;
