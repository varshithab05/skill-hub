const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - recipient
 *         - type
 *         - title
 *         - message
 *         - relatedId
 *         - onModel
 *       properties:
 *         recipient:
 *           type: string
 *           format: objectId
 *           description: User ID of the notification recipient
 *         type:
 *           type: string
 *           enum: [bid, job_award, review, transaction, message]
 *           description: Type of notification
 *         title:
 *           type: string
 *           description: Title of the notification
 *         message:
 *           type: string
 *           description: Notification message content
 *         relatedId:
 *           type: string
 *           format: objectId
 *           description: ID of the related document
 *         onModel:
 *           type: string
 *           enum: [Job, Bid, Review, Transaction]
 *           description: Related model type
 *         isRead:
 *           type: boolean
 *           default: false
 *           description: Whether the notification has been read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was created
 */

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["bid", "job_award", "review", "transaction", "message"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "onModel",
    required: true,
  },
  onModel: {
    type: String,
    required: true,
    enum: ["Job", "Bid", "Review", "Transaction"],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
