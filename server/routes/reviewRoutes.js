const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { authenticateJWT } = require("../middlewares/authMiddleware");
const { validateReviewInput } = require("../middlewares/validationMiddleware");

/**
 * @swagger
 * /review:
 *   post:
 *     summary: Add a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reviewedUser
 *               - rating
 *             properties:
 *               reviewedUser:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post(
  "/",
  authenticateJWT,
  validateReviewInput,
  reviewController.addReview
);

/**
 * @swagger
 * /review/user/{userId}:
 *   get:
 *     summary: Get all reviews for a user
 *     tags: [Reviews]
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
 *         description: List of reviews for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get(
  "/user/:userId",
  authenticateJWT,
  reviewController.getAllReviewsForUser
);

/**
 * @swagger
 * /review/by/{userId}:
 *   get:
 *     summary: Get all reviews written by a user
 *     tags: [Reviews]
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
 *         description: List of reviews written by the user
 */
router.get(
  "/by/:userId",
  authenticateJWT,
  reviewController.getAllReviewsByUser
);

/**
 * @swagger
 * /review/review/{reviewId}:
 *   get:
 *     summary: Get a specific review by ID
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
router.get(
  "/review/:reviewId",
  authenticateJWT,
  reviewController.getReviewById
);

/**
 * @swagger
 * /review/{reviewId}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
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
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 */
router.put("/:reviewId", authenticateJWT, reviewController.updateReview);
router.delete("/:reviewId", authenticateJWT, reviewController.deleteReview);

module.exports = router;
