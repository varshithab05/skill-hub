const Chat = require("../models/chat");
const User = require("../models/user");
const mongoose = require("mongoose");
const { getAsync, setAsync } = require("../config/redis"); // Corrected import

const CACHE_EXPIRATION = 30; // Shorter expiration for potentially dynamic chat data

// Get all chats for the current user with Caching
exports.getUserChats = async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `user_chats:${userId}`;

  try {
    const cachedChats = await getAsync(cacheKey);
    if (cachedChats) {
      console.log(`Cache hit for ${cacheKey}`);
      const formattedChats = JSON.parse(cachedChats);
      return res.status(200).json({ success: true, chats: formattedChats });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const chats = await Chat.find({ participants: userId })
      .populate({
        path: "participants",
        select: "username name info.profilePic",
      })
      .populate({ path: "messages.sender", select: "username name" })
      .sort({ lastMessage: -1 });

    const formattedChats = chats.map((chat) => {
      const otherParticipant = chat.participants.find(
        (p) => p._id.toString() !== userId
      );
      return {
        _id: chat._id,
        otherUser: otherParticipant,
        lastMessage:
          chat.messages.length > 0
            ? chat.messages[chat.messages.length - 1]
            : null,
        unreadCount: chat.messages.filter(
          (msg) => !msg.read && msg.sender._id.toString() !== userId
        ).length,
        updatedAt: chat.updatedAt,
      };
    });

    try {
      await setAsync(
        cacheKey,
        JSON.stringify(formattedChats),
        "EX",
        CACHE_EXPIRATION
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ success: true, chats: formattedChats });
  } catch (error) {
    console.error("Error getting user chats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving chats",
      error: error.message,
    });
  }
};

// Get a specific chat by ID with Caching
exports.getChatById = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id; // Needed to ensure user is participant
  const cacheKey = `chat:${chatId}`; // Key doesn't include userId, but DB query ensures access control

  try {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chat ID" });
    }

    const cachedChatData = await getAsync(cacheKey);
    if (cachedChatData) {
      console.log(`Cache hit for ${cacheKey}`);
      const chatData = JSON.parse(cachedChatData);
      // Still need to verify if current user is participant from cached data if we stored it
      // For simplicity now, we rely on the DB check on miss. If caching full chat obj, add check here.
      if (chatData === null) {
        return res
          .status(404)
          .json({ success: false, message: "Chat not found" });
      }
      // Need to format the cached data similar to DB response
      const otherParticipant = chatData.participants.find(
        (p) => p._id.toString() !== userId
      );
      if (!otherParticipant) {
        // This means user wasn't a participant in the cached chat
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      return res.status(200).json({
        success: true,
        chat: {
          _id: chatData._id,
          otherUser: otherParticipant,
          messages: chatData.messages,
          createdAt: chatData.createdAt,
          updatedAt: chatData.updatedAt,
        },
      });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const chat = await Chat.findOne({ _id: chatId, participants: userId })
      .populate({
        path: "participants",
        select: "username name info.profilePic",
      })
      .populate({ path: "messages.sender", select: "username name" });

    if (!chat) {
      try {
        await setAsync(cacheKey, JSON.stringify(null), "EX", CACHE_EXPIRATION);
        console.log(`Stored null for ${cacheKey} in cache`);
      } catch (redisSetError) {
        console.error("Redis set error:", redisSetError);
      }
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    // Cache the full chat object
    try {
      await setAsync(cacheKey, JSON.stringify(chat), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    const otherParticipant = chat.participants.find(
      (p) => p._id.toString() !== userId
    );

    res.status(200).json({
      success: true,
      chat: {
        _id: chat._id,
        otherUser: otherParticipant,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting chat by ID:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving chat",
      error: error.message,
    });
  }
};

// Create a new chat with another user
exports.createChat = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.id;

    // Validate recipient ID
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid recipient ID" });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res
        .status(404)
        .json({ success: false, message: "Recipient not found" });
    }

    // Check if a chat already exists between these users
    const existingChat = await Chat.findOne({
      participants: { $all: [userId, recipientId] },
    });

    if (existingChat) {
      return res
        .status(200)
        .json({ success: true, chatId: existingChat._id, existing: true });
    }

    // Create a new chat
    const newChat = new Chat({
      participants: [userId, recipientId],
      messages: [],
      lastMessage: new Date(),
    });

    await newChat.save();

    res
      .status(201)
      .json({ success: true, chatId: newChat._id, existing: false });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({
      success: false,
      message: "Error creating chat",
      error: error.message,
    });
  }
};

// Send a message in a chat
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate chat ID
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chat ID" });
    }

    // Find the chat and ensure the user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    // Add the new message
    const newMessage = {
      sender: userId,
      content,
      read: false,
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();

    await chat.save();

    // Get the message ID from the saved chat
    const messageId = chat.messages[chat.messages.length - 1]._id;

    // Populate the sender info for the response
    const populatedChat = await Chat.findById(chatId).populate({
      path: "messages.sender",
      select: "username name",
    });

    // Find the specific message by ID
    const sentMessage = populatedChat.messages.find(
      (msg) => msg._id.toString() === messageId.toString()
    );

    if (!sentMessage) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving sent message",
      });
    }

    // Get the other participant's ID for socket notification
    const otherParticipantId = chat.participants.find(
      (p) => p.toString() !== userId
    );

    // Broadcast to the other user via socket if available
    if (req.app.get("io") && otherParticipantId) {
      const io = req.app.get("io");
      const connectedUsers = req.app.get("connectedUsers") || {};

      if (connectedUsers[otherParticipantId]) {
        io.to(connectedUsers[otherParticipantId]).emit("receive_message", {
          chatId,
          message: sentMessage,
        });
      }
    }

    res.status(201).json({ success: true, message: sentMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Validate chat ID
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chat ID" });
    }

    // Find the chat and ensure the user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    // Get the other participant's ID
    const otherParticipantId = chat.participants.find(
      (p) => p.toString() !== userId
    );

    // Mark all unread messages from the other participant as read
    let updated = false;
    chat.messages.forEach((message) => {
      if (
        !message.read &&
        message.sender.toString() === otherParticipantId.toString()
      ) {
        message.read = true;
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking messages as read",
      error: error.message,
    });
  }
};

// Search users to start chat with Caching
exports.searchUsers = async (req, res) => {
  const { query } = req.query;
  const currentUserId = req.user.id;
  // Simple cache key for search query - consider normalization/rate limiting
  const cacheKey = `user_search:${query.toLowerCase()}`;

  try {
    const cachedUsers = await getAsync(cacheKey);
    if (cachedUsers) {
      console.log(`Cache hit for ${cacheKey}`);
      let users = JSON.parse(cachedUsers);
      // Filter out current user from cached results
      users = users.filter((user) => user._id.toString() !== currentUserId);
      return res.status(200).json({ success: true, users });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Query parameter is required" });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude the current user
        {
          $or: [
            { username: { $regex: query, $options: "i" } }, // Case-insensitive search
            { name: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }).select("username name info.profilePic _id"); // Select necessary fields

    try {
      // Cache the results including the current user (filter on retrieval)
      const allMatchedUsers = await User.find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
        ],
      }).select("username name info.profilePic _id");
      await setAsync(
        cacheKey,
        JSON.stringify(allMatchedUsers),
        "EX",
        CACHE_EXPIRATION * 2
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message,
    });
  }
};
