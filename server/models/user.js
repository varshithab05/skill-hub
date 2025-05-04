const mongoose = require("mongoose");
const fs = require("fs");
const solrService = require('../services/solrService');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - username
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *         username:
 *           type: string
 *           description: Unique username
 *         email:
 *           type: string
 *           format: email
 *           description: User's unique email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's hashed password
 *         role:
 *           type: string
 *           enum: [freelancer, enterprise, hybrid]
 *           default: freelancer
 *           description: User's role in the system
 *         wallet:
 *           type: number
 *           default: 0
 *           description: User's wallet balance
 *         commissionRate:
 *           type: number
 *           description: Commission rate based on user role
 *         bio:
 *           type: string
 *           maxLength: 500
 *           description: User's biography
 *         info:
 *           type: object
 *           properties:
 *             skills:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of user's skills
 *             portfolio:
 *               type: string
 *               description: Link to user's portfolio
 *             experience:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of user's experiences
 *             profilePic:
 *               type: string
 *               description: URL to user's profile picture
 *         previousWorks:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the work
 *               description:
 *                 type: string
 *                 description: Description of the work
 *               link:
 *                 type: string
 *                 description: Link to the work
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of user creation
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last update
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["freelancer", "enterprise", "hybrid"],
      default: "freelancer",
    },
    wallet: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    info: {
      skills: [{ type: String }],
      portfolio: { type: String },
      experience: [{ type: String }],
      profilePic: { type: String },
    },
    previousWorks: [
      {
        title: { type: String, required: true },
        description: { type: String },
        link: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Create compound index for username and email for faster lookups
// userSchema.index({ username: 1 }); // Removed - handled by unique: true
// userSchema.index({ email: 1 }); // Removed - handled by unique: true
// Create index for role for faster filtering by role
userSchema.index({ role: 1 });
// Create index for skills for faster searching of freelancers by skills
userSchema.index({ "info.skills": 1 });
// Create index for wallet for faster financial operations
userSchema.index({ wallet: 1 });
// Create index for createdAt for sorting users by join date
userSchema.index({ createdAt: -1 });

// Middleware to set commission rate based on role
userSchema.pre("save", function (next) {
  if (this.isNew) {
    switch (this.role) {
      case "freelancer":
        this.commissionRate = 0.5;
        break;
      case "enterprise":
        this.commissionRate = 1;
        break;
      case "hybrid":
        this.commissionRate = 1.5;
        break;
      default:
        this.commissionRate = 1;
    }
  }
  next();
});

userSchema.post('save', async function(doc) {
  try {
    await solrService.indexUser(doc);
  } catch (error) {
    console.error('Error indexing user to Solr:', error);
  }
});

userSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    try {
      await solrService.indexUser(doc);
    } catch (error) {
      console.error('Error indexing updated user to Solr:', error);
    }
  }
});

module.exports = mongoose.model("User", userSchema);
