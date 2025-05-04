const express = require("express");
const router = express.Router();
const {
  placeBid,
  getBidsForJob,
  acceptBid,
  getRecentBids,
  getBidDetails,
  getBidById,
  getBidsByUserId,
  deleteBid,
} = require("../controllers/bidController");
const { authenticateJWT } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /bid/{jobId}:
 *   get:
 *     summary: Get all bids for a job
 *     tags: [Bids]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bids for the job
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bid'
 */
// Public routes (no authentication required)
// Get all bids for a job
router.get("/:jobId", getBidsForJob);

// All routes below this middleware require authentication
router.use(authenticateJWT);

/**
 * @swagger
 * /bid/place:
 *   post:
 *     summary: Place a new bid on a job
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - jobId
 *             properties:
 *               amount:
 *                 type: number
 *               jobId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bid placed successfully
 */
// Protected routes
// Place a bid on a job
router.post("/place", placeBid);

/**
 * @swagger
 * /bid/accept/{bidId}:
 *   put:
 *     summary: Accept a bid
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bid accepted successfully
 */
// Accept a bid (employer)
router.put("/accept/:bidId", acceptBid);

/**
 * @swagger
 * /bid/recent/bid:
 *   get:
 *     summary: Get recent bids
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent bids
 */
// Get recent bids
router.get("/recent/bid", getRecentBids);

/**
 * @swagger
 * /bid/{bidId}:
 *   get:
 *     summary: Get a specific bid
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bid details
 */
// Get a specific bid by ID
router.get("/bid/:bidId", getBidById);

/**
 * @swagger
 * /bid/user/{userId}:
 *   get:
 *     summary: Get all bids by a user
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's bids
 */
// Get all bids by user ID
router.get("/user/:userId", getBidsByUserId);

/**
 * @swagger
 * /bid/{bidId}/details:
 *   get:
 *     summary: Get detailed bid information
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed bid information
 */
// Route to get details of a specific bid (including all bids for the job)
router.get("/:bidId/details", getBidDetails);

/**
 * @swagger
 * /bid/{bidId}:
 *   delete:
 *     summary: Delete a bid
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bid deleted successfully
 */
// Delete a bid
router.delete("/:bidId", deleteBid);

module.exports = router;
