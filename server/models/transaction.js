const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - user
 *         - job
 *         - amount
 *         - transactionType
 *         - commission
 *       properties:
 *         user:
 *           type: string
 *           format: objectId
 *           description: Reference to the user involved in the transaction
 *         job:
 *           type: string
 *           format: objectId
 *           description: Reference to the related job
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         transactionType:
 *           type: string
 *           enum: [debit, credit]
 *           description: Type of transaction
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *           default: pending
 *           description: Current status of the transaction
 *         commission:
 *           type: number
 *           description: Commission amount for the platform
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    commission: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
