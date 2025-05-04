// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { authenticateJWT } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /transaction/all-transactions:
 *   get:
 *     summary: Get all transactions of logged-in user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 */
router.get(
  "/all-transactions",
  authenticateJWT,
  transactionController.getAllTransactions
);

/**
 * @swagger
 * /transaction/recent-transactions:
 *   get:
 *     summary: Get recent transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent transactions
 */
router.get(
  "/recent-transactions",
  authenticateJWT,
  transactionController.getRecentTransactions
);

/**
 * @swagger
 * /transaction/{transactionId}:
 *   get:
 *     summary: Get transaction details
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 */
router.get(
  "/:transactionId",
  authenticateJWT,
  transactionController.getTransactionDetails
);

/**
 * @swagger
 * /transaction:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job
 *               - amount
 *               - transactionType
 *             properties:
 *               job:
 *                 type: string
 *                 description: Job ID
 *               amount:
 *                 type: number
 *               transactionType:
 *                 type: string
 *                 enum: [debit, credit]
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
router.post("/", authenticateJWT, transactionController.createTransaction);

/**
 * @swagger
 * /transaction/{transactionId}/status:
 *   patch:
 *     summary: Update transaction status
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
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
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed]
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
 */
router.patch(
  "/:transactionId/status",
  authenticateJWT,
  transactionController.updateTransactionStatus
);

/**
 * @swagger
 * /transaction/earnings-summary:
 *   get:
 *     summary: Get earnings summary
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary of earnings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                 recentTransactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 */
router.get(
  "/earnings-summary",
  authenticateJWT,
  transactionController.getEarningsSummary
);

module.exports = router;
