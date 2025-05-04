const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middlewares/authMiddleware");
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notificationController");

/**
 * @swagger
 * /notification:
 *   get:
 *     summary: Get all notifications for logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient
 *               - type
 *               - title
 *               - message
 *               - relatedId
 *               - onModel
 *             properties:
 *               recipient:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [bid, job_award, review, transaction, message]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               relatedId:
 *                 type: string
 *               onModel:
 *                 type: string
 *                 enum: [Job, Bid, Review, Transaction]
 *     responses:
 *       201:
 *         description: Notification created successfully
 *
 * /notification/unread-count:
 *   get:
 *     summary: Get number of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notifications count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *
 * /notification/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 *
 * /notification/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *
 * /notification/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
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
 *         description: Notification deleted successfully
 */

// All routes require authentication
router.use(authenticateJWT);

// Get all notifications for the logged-in user
router.get("/", getUserNotifications);

// Get unread notifications count
router.get("/unread-count", getUnreadCount);

// Create a new notification (typically used internally)
router.post("/", createNotification);

// Mark a specific notification as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", markAllAsRead);

// Delete a specific notification
router.delete("/:id", deleteNotification);

module.exports = router;
