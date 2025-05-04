// routes/walletRoutes.js
const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { authenticateJWT } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current wallet balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   description: Current balance in wallet
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get("/balance", authenticateJWT, walletController.getWalletBalance);

module.exports = router;
