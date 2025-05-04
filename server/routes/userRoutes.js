const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { upload } = require("../middlewares/uploadMiddleware");
const { authenticateJWT } = require("../middlewares/authMiddleware");
const { validateUserInput } = require("../middlewares/validationMiddleware");
const adminAuth = require("../middleware/adminAuth");

router.use(express.urlencoded({ extended: true }));

// Route for user registration
/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [freelancer, enterprise, hybrid]
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Invalid input or user already exists
 */
router.post("/register", userController.registerUser);

// Route for user login

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usernameOrEmail
 *               - password
 *             properties:
 *               usernameOrEmail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", userController.loginUser);

// Route for getting a user's own profile (JWT protected)
/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user's own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get("/profile", authenticateJWT, userController.getUserDetails);

// Route for updating user's own profile (JWT protected)
/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update user's own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               info:
 *                 type: object
 *                 properties:
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: string
 *                   portfolio:
 *                     type: string
 *                   experience:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.put("/profile", authenticateJWT, userController.updateUserProfile);

// Route for getting a user's profile
/**
 * @swagger
 * /user/{username}:
 *   get:
 *     summary: Get a user's public profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user to retrieve
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get("/:username", userController.getUserProfile);

// Upload profile picture
/**
 * @swagger
 * /user/upload-profile-pic:
 *   post:
 *     summary: Upload user profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Invalid file format or size
 */
router.post(
  "/upload-profile-pic",
  authenticateJWT,
  upload.single("profilePic"),
  userController.uploadProfilePic
);

// Route for getting all users (Admin only)
/**
 * @swagger
 * /user/all:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Not an admin
 */
router.get("/all", adminAuth, userController.getAllUsers);

// Route for deleting a user by admin
/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - Not an admin
 *       404:
 *         description: User not found
 */
router.delete("/:id", adminAuth, userController.deleteUser);

module.exports = router;
