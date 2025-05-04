/**
 * @swagger
 * components:
 *   schemas:
 *     Bid:
 *       type: object
 *       required:
 *         - amount
 *         - job
 *         - freelancer
 *       properties:
 *         amount:
 *           type: number
 *           description: The bid amount proposed by the freelancer
 *         job:
 *           type: string
 *           format: objectId
 *           description: Reference to the job being bid on
 *         freelancer:
 *           type: string
 *           format: objectId
 *           description: Reference to the user making the bid
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *           default: pending
 *           description: Current status of the bid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
// Index for job to quickly find all bids for a specific job
bidSchema.index({ job: 1 });
// Index for freelancer to quickly find all bids by a specific freelancer
bidSchema.index({ freelancer: 1 });
// Index for status to quickly filter bids by status
bidSchema.index({ status: 1 });
// Compound index for job and status to find specific status bids for a job
bidSchema.index({ job: 1, status: 1 });
// Compound index for freelancer and status to find specific status bids by a freelancer
bidSchema.index({ freelancer: 1, status: 1 });
// Index for amount for sorting by bid amount
bidSchema.index({ amount: 1 });
// Compound index for job and amount for sorting bids on a job by amount
bidSchema.index({ job: 1, amount: 1 });
// Index for createdAt for sorting bids by date
bidSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Bid", bidSchema);
