/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - sender
 *         - content
 *       properties:
 *         sender:
 *           type: string
 *           format: objectId
 *           description: ID of the user sending the message
 *         content:
 *           type: string
 *           description: Content of the message
 *         read:
 *           type: boolean
 *           default: false
 *           description: Whether the message has been read
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Chat:
 *       type: object
 *       required:
 *         - participants
 *       properties:
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: Array of user IDs participating in the chat
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *         lastMessage:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the last message
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [messageSchema],
    lastMessage: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create a compound index on participants to efficiently find chats
chatSchema.index({ participants: 1 });

module.exports = mongoose.model("Chat", chatSchema);
