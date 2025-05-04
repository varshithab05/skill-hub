const Notification = require("../models/notification");
const { getAsync, setAsync } = require("../config/redis"); // Corrected import

const CACHE_EXPIRATION = 60; // Cache duration in seconds

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all notifications for a user with Redis Caching
exports.getUserNotifications = async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `user_notifications:${userId}`;

  try {
    // 1. Try to get data from Redis cache
    const cachedNotifications = await getAsync(cacheKey);

    if (cachedNotifications) {
      console.log(`Cache hit for ${cacheKey}`);
      const notifications = JSON.parse(cachedNotifications);
      return res.json({ success: true, notifications });
    }

    // 2. If not in cache, fetch from MongoDB
    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // 3. Store the result in Redis with expiration
    try {
      await setAsync(
        cacheKey,
        JSON.stringify(notifications),
        "EX",
        CACHE_EXPIRATION
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
      // Don't fail the request if Redis write fails
    }

    // 4. Return the result from MongoDB
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    });
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread notifications count with Caching
exports.getUnreadCount = async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `unread_notifications_count:${userId}`;

  try {
    // 1. Try to get data from Redis cache
    const cachedCount = await getAsync(cacheKey);
    if (cachedCount !== null) {
      // Check for null explicitly, as count can be 0
      console.log(`Cache hit for ${cacheKey}`);
      const count = parseInt(cachedCount, 10);
      return res.json({ success: true, count });
    }

    // 2. If not in cache, fetch from MongoDB
    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    // 3. Store the result in Redis with expiration
    try {
      await setAsync(cacheKey, count.toString(), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    // 4. Return the result from MongoDB
    res.json({ success: true, count });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
