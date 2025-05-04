const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticateJWT } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Get all chats for current user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *   post:
 *     summary: Create a new chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantId
 *             properties:
 *               participantId:
 *                 type: string
 *                 description: ID of the user to chat with
 *     responses:
 *       201:
 *         description: Chat created successfully
 *
 * /chat/{chatId}:
 *   get:
 *     summary: Get a specific chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *
 * /chat/{chatId}/messages:
 *   post:
 *     summary: Send a message in chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *
 * /chat/{chatId}/read:
 *   put:
 *     summary: Mark messages as read
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 *
 * /chat/search/users:
 *   get:
 *     summary: Search users for chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Username to search for
 *     responses:
 *       200:
 *         description: List of matching users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

// All chat routes require authentication
router.use(authenticateJWT);

// Get all chats for the current user
router.get("/", chatController.getUserChats);

// Get a specific chat by ID
router.get("/:chatId", chatController.getChatById);

// Create a new chat with another user
router.post("/", chatController.createChat);

// Send a message in a chat
router.post("/:chatId/messages", chatController.sendMessage);

// Mark messages as read
router.put("/:chatId/read", chatController.markMessagesAsRead);

// Search users by username for chat
router.get("/search/users", chatController.searchUsers);

module.exports = router;
