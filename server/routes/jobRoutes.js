const express = require("express");
const router = express.Router();
const {
  createJob,
  getMarketplaceJobs,
  getJobById,
  updateJob,
  getFilteredJobs,
  getJobByIdAuthCheck,
  createBid,
  getJobsByUserId,
} = require("../controllers/jobController");
const { authenticateJWT } = require("../middlewares/authMiddleware");
const { routeCache } = require("../middleware/cacheMiddleware");
const { invalidateResourceCache } = require("../utils/cacheUtils");

// Create a job (employer)
/**
 * @swagger
 * /job/create:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       201:
 *         description: Job created successfully
 */
router.post("/create", authenticateJWT, async (req, res, next) => {
  try {
    await createJob(req, res, next);
    // Only invalidate cache if the response hasn't been sent yet (e.g., by an error)
    if (!res.headersSent) {
      try {
        await invalidateResourceCache("job", "");
      } catch (cacheError) {
        console.error("Cache invalidation error:", cacheError);
        // Don't pass this error to next() as the main operation succeeded
      }
    }
  } catch (error) {
    next(error);
  }
});

// Get all jobs for marketplace
/**
 * @swagger
 * /job/marketplace:
 *   get:
 *     summary: Get all jobs for marketplace
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of all available jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 */
router.get("/marketplace", routeCache.standard, getMarketplaceJobs);

// Get a specific job by ID
/**
 * @swagger
 * /job/{id}:
 *   get:
 *     summary: Get a specific job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *   put:
 *     summary: Update job status
 *     tags: [Jobs]
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
 *               status:
 *                 type: string
 *                 enum: [open, in-progress, completed, closed]
 *     responses:
 *       200:
 *         description: Job updated successfully
 */
router.get("/:id", routeCache.standard, getJobById);

// Update job status (e.g., when the job is completed)
router.put("/:id", async (req, res, next) => {
  try {
    await updateJob(req, res, next);
    // Only invalidate cache if the response hasn't been sent yet
    if (!res.headersSent) {
      try {
        await invalidateResourceCache("job", req.params.id);
      } catch (cacheError) {
        console.error("Cache invalidation error:", cacheError);
        // Don't pass this error to next() as the main operation succeeded
      }
    }
  } catch (error) {
    next(error);
  }
});

// Route to get filtered jobs
/**
 * @swagger
 * /job/jobs/filtered:
 *   get:
 *     summary: Get filtered jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Filtered list of jobs
 */
router.get(
  "/jobs/filtered",
  authenticateJWT,
  routeCache.shortTerm,
  getFilteredJobs
);

// Get all jobs by user ID
/**
 * @swagger
 * /job/user/{userId}:
 *   get:
 *     summary: Get all jobs by user
 *     tags: [Jobs]
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
 *         description: List of user's jobs
 */
router.get(
  "/user/:userId",
  authenticateJWT,
  routeCache.standard,
  getJobsByUserId
);

// Route to get a specific job by ID
/**
 * @swagger
 * /job/user/{id}:
 *   get:
 *     summary: Get a specific job with auth check
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the job to retrieve
 *     responses:
 *       200:
 *         description: Job details with authentication check
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Job not found
 */
router.get(
  "/user/:id",
  authenticateJWT,
  routeCache.standard,
  getJobByIdAuthCheck
);

// Route to place a bid on a job
/**
 * @swagger
 * /job/{jobId}/bid:
 *   post:
 *     summary: Place a bid on a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
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
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Bid placed successfully
 */
router.post("/:jobId/bid", authenticateJWT, async (req, res, next) => {
  try {
    await createBid(req, res, next);
    // Only invalidate cache if the response hasn't been sent yet
    if (!res.headersSent) {
      try {
        await invalidateResourceCache("job", req.params.jobId);
        await invalidateResourceCache("bid", "");
      } catch (cacheError) {
        console.error("Cache invalidation error:", cacheError);
        // Don't pass this error to next() as the main operation succeeded
      }
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
