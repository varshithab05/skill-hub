/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - budget
 *         - employer
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the job
 *         description:
 *           type: string
 *           description: Detailed description of the job
 *         budget:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *               description: Minimum budget for the job
 *             max:
 *               type: number
 *               description: Maximum budget for the job
 *         employer:
 *           type: string
 *           format: objectId
 *           description: Reference to the employer user
 *         status:
 *           type: string
 *           enum: [open, in-progress, completed, closed]
 *           default: open
 *         freelancer:
 *           type: string
 *           format: objectId
 *           description: Reference to the assigned freelancer
 *         bidAccepted:
 *           type: boolean
 *           default: false
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *         skillsRequired:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const mongoose = require("mongoose");
const solrService = require('../services/solrService');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "closed"],
      default: "open",
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bidAccepted: {
      type: Boolean,
      default: false,
    },
    categories: [{ type: String }], // Categories for jobs
    skillsRequired: [{ type: String }], // Skills required for the job
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
// Index for job status for faster filtering
jobSchema.index({ status: 1 });
// Index for employer for faster lookup of jobs by employer
jobSchema.index({ employer: 1 });
// Index for freelancer for faster lookup of jobs assigned to a freelancer
jobSchema.index({ freelancer: 1 });
// Compound index for status and createdAt for sorting open jobs by date
jobSchema.index({ status: 1, createdAt: -1 });
// Index for categories for faster filtering by job category
jobSchema.index({ categories: 1 });
// Index for skillsRequired for faster matching of jobs with freelancer skills
jobSchema.index({ skillsRequired: 1 });
// Index for budget range for faster filtering by budget
jobSchema.index({ "budget.min": 1, "budget.max": 1 });
// Index for bidAccepted for faster filtering of jobs with accepted bids
jobSchema.index({ bidAccepted: 1 });

jobSchema.post('save', async function(doc) {
  try {
    await solrService.indexJob(doc);
  } catch (error) {
    console.error('Error indexing job to Solr:', error);
  }
});

jobSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    try {
      await solrService.indexJob(doc);
    } catch (error) {
      console.error('Error indexing updated job to Solr:', error);
    }
  }
});

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
module.exports = Job;
