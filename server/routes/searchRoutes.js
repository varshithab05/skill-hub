const express = require('express');
const router = express.Router();
const { searchUsersSolr } = require('../controllers/userController');
const { searchJobsSolr } = require('../controllers/jobController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /search/users:
 *   get:
 *     summary: Search users using Solr
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by user role
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Filter by skills (comma-separated)
 *     responses:
 *       200:
 *         description: List of users matching the search criteria
 */
router.get('/users', authenticateJWT, searchUsersSolr);

/**
 * @swagger
 * /search/jobs:
 *   get:
 *     summary: Search jobs using Solr
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by job status
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Filter by categories (comma-separated)
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Filter by required skills (comma-separated)
 *       - in: query
 *         name: minBudget
 *         schema:
 *           type: number
 *         description: Minimum budget
 *       - in: query
 *         name: maxBudget
 *         schema:
 *           type: number
 *         description: Maximum budget
 *     responses:
 *       200:
 *         description: List of jobs matching the search criteria
 */
router.get('/jobs',authenticateJWT,searchJobsSolr);

module.exports = router;