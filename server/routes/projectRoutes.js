const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { authenticateJWT } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /project/recent-projects:
 *   get:
 *     summary: Get recent projects for logged-in freelancer
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   status:
 *                     type: string
 *                   completedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get(
  "/recent-projects",
  authenticateJWT,
  projectController.getRecentProjects
);

module.exports = router;
