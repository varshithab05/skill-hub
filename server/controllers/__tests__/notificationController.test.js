// Mock dependencies first
const mockNotificationSave = jest.fn();
const mockNotificationFind = jest.fn();
const mockNotificationFindByIdAndUpdate = jest.fn();
const mockNotificationUpdateMany = jest.fn();
const mockNotificationFindOneAndDelete = jest.fn();
const mockNotificationCountDocuments = jest.fn();

const mockGetAsync = jest.fn();
const mockSetAsync = jest.fn();

jest.mock("../../models/notification", () => {
  const MockNotification = jest.fn().mockImplementation((data) => ({
    ...data,
    save: mockNotificationSave,
  }));
  MockNotification.find = mockNotificationFind;
  MockNotification.findByIdAndUpdate = mockNotificationFindByIdAndUpdate;
  MockNotification.updateMany = mockNotificationUpdateMany;
  MockNotification.findOneAndDelete = mockNotificationFindOneAndDelete;
  MockNotification.countDocuments = mockNotificationCountDocuments;
  return MockNotification;
});

jest.mock("../../config/redis", () => ({
  getAsync: mockGetAsync,
  setAsync: mockSetAsync,
}));

// Import controller functions after mocks
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../notificationController");

// Import models/mocks for direct use if needed
const Notification = require("../../models/notification");
const { getAsync, setAsync } = require("../../config/redis");

describe("Notification Controller", () => {
  let req, res, next;
  const testUserId = "testUserId123";

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      user: { id: testUserId }, // Mock authenticated user
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn(); // Although not used in this controller
  });

  // --- Tests for createNotification ---
  describe("createNotification", () => {
    it("should create a notification successfully", async () => {
      const notificationData = {
        recipient: testUserId,
        message: "Test message",
      };
      req.body = notificationData;
      const savedNotification = { ...notificationData, _id: "notif1" };
      mockNotificationSave.mockResolvedValue(savedNotification);

      await createNotification(req, res);

      expect(Notification).toHaveBeenCalledWith(notificationData);
      expect(mockNotificationSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          notification: expect.objectContaining({
            recipient: testUserId,
            message: "Test message",
          }),
        })
      );
    });

    it("should return 400 if save fails", async () => {
      const notificationData = {
        recipient: testUserId,
        message: "Test message",
      };
      req.body = notificationData;
      const saveError = new Error("Save failed");
      mockNotificationSave.mockRejectedValue(saveError);

      await createNotification(req, res);

      expect(Notification).toHaveBeenCalledWith(notificationData);
      expect(mockNotificationSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: saveError.message,
      });
    });
  });

  // --- Tests for getUserNotifications ---
  describe("getUserNotifications", () => {
    const cacheKey = `user_notifications:${testUserId}`;
    const mockNotifications = [
      { _id: "notif1", message: "Msg 1", recipient: testUserId },
      { _id: "notif2", message: "Msg 2", recipient: testUserId },
    ];

    it("should return notifications from cache if available", async () => {
      mockGetAsync.mockResolvedValue(JSON.stringify(mockNotifications));

      await getUserNotifications(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationFind).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        notifications: mockNotifications,
      });
    });

    it("should fetch notifications from DB if not in cache and store in cache", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockSort = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue(mockNotifications);
      mockNotificationFind.mockImplementation(() => ({
        sort: mockSort,
        limit: mockLimit,
      }));
      mockSetAsync.mockResolvedValue("OK");

      await getUserNotifications(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationFind).toHaveBeenCalledWith({
        recipient: testUserId,
      });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockLimit).toHaveBeenCalledWith(50);
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(mockNotifications),
        "EX",
        60 // CACHE_EXPIRATION
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        notifications: mockNotifications,
      });
    });

    it("should return empty array if no notifications found and cache it", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockSort = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([]); // No notifications found
      mockNotificationFind.mockImplementation(() => ({
        sort: mockSort,
        limit: mockLimit,
      }));
      mockSetAsync.mockResolvedValue("OK");

      await getUserNotifications(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationFind).toHaveBeenCalledWith({
        recipient: testUserId,
      });
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify([]),
        "EX",
        60
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        notifications: [],
      });
    });

    it("should return 500 if DB fetch fails", async () => {
      mockGetAsync.mockResolvedValue(null);
      const dbError = new Error("DB find failed");
      const mockSort = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockRejectedValue(dbError);
      mockNotificationFind.mockImplementation(() => ({
        sort: mockSort,
        limit: mockLimit,
      }));

      await getUserNotifications(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationFind).toHaveBeenCalledWith({
        recipient: testUserId,
      });
      expect(mockSetAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: dbError.message,
      });
    });

    it("should return 500 if Redis get fails", async () => {
      const redisError = new Error("Redis GET Failed");
      mockGetAsync.mockRejectedValue(redisError);

      await getUserNotifications(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationFind).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: redisError.message,
      });
    });

    it("should still return data if Redis set fails", async () => {
      mockGetAsync.mockResolvedValue(null);
      const mockSort = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue(mockNotifications);
      mockNotificationFind.mockImplementation(() => ({
        sort: mockSort,
        limit: mockLimit,
      }));
      const redisSetError = new Error("Redis SET failed");
      mockSetAsync.mockRejectedValue(redisSetError);
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getUserNotifications(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationFind).toHaveBeenCalledWith({
        recipient: testUserId,
      });
      expect(mockSetAsync).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Redis set error:",
        redisSetError
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        notifications: mockNotifications,
      });
      expect(res.status).not.toHaveBeenCalled(); // Should not set error status

      consoleErrorSpy.mockRestore();
    });
  });

  // --- Tests for markAsRead ---
  describe("markAsRead", () => {
    const notificationId = "notifToRead";

    beforeEach(() => {
      req.params.id = notificationId;
    });

    it("should mark a notification as read successfully", async () => {
      const updatedNotification = { _id: notificationId, isRead: true };
      mockNotificationFindByIdAndUpdate.mockResolvedValue(updatedNotification);

      await markAsRead(req, res);

      expect(mockNotificationFindByIdAndUpdate).toHaveBeenCalledWith(
        notificationId,
        { isRead: true },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        notification: updatedNotification,
      });
    });

    it("should return 404 if notification not found", async () => {
      mockNotificationFindByIdAndUpdate.mockResolvedValue(null);

      await markAsRead(req, res);

      expect(mockNotificationFindByIdAndUpdate).toHaveBeenCalledWith(
        notificationId,
        { isRead: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Notification not found",
      });
    });

    it("should return 500 if update fails", async () => {
      const updateError = new Error("Update failed");
      mockNotificationFindByIdAndUpdate.mockRejectedValue(updateError);

      await markAsRead(req, res);

      expect(mockNotificationFindByIdAndUpdate).toHaveBeenCalledWith(
        notificationId,
        { isRead: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: updateError.message,
      });
    });
  });

  // --- Tests for markAllAsRead ---
  describe("markAllAsRead", () => {
    it("should mark all unread notifications for the user as read", async () => {
      mockNotificationUpdateMany.mockResolvedValue({ nModified: 5 }); // Simulate 5 updates

      await markAllAsRead(req, res);

      expect(mockNotificationUpdateMany).toHaveBeenCalledWith(
        { recipient: testUserId, isRead: false },
        { isRead: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "All notifications marked as read",
      });
    });

    it("should return 500 if updateMany fails", async () => {
      const updateError = new Error("UpdateMany failed");
      mockNotificationUpdateMany.mockRejectedValue(updateError);

      await markAllAsRead(req, res);

      expect(mockNotificationUpdateMany).toHaveBeenCalledWith(
        { recipient: testUserId, isRead: false },
        { isRead: true }
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: updateError.message,
      });
    });
  });

  // --- Tests for deleteNotification ---
  describe("deleteNotification", () => {
    const notificationId = "notifToDelete";

    beforeEach(() => {
      req.params.id = notificationId;
    });

    it("should delete the specified notification for the user", async () => {
      mockNotificationFindOneAndDelete.mockResolvedValue({
        _id: notificationId,
      }); // Simulate successful delete

      await deleteNotification(req, res);

      expect(mockNotificationFindOneAndDelete).toHaveBeenCalledWith({
        _id: notificationId,
        recipient: testUserId,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Notification deleted",
      });
    });

    it("should return 404 if notification not found or not owned by user", async () => {
      mockNotificationFindOneAndDelete.mockResolvedValue(null);

      await deleteNotification(req, res);

      expect(mockNotificationFindOneAndDelete).toHaveBeenCalledWith({
        _id: notificationId,
        recipient: testUserId,
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Notification not found",
      });
    });

    it("should return 500 if findOneAndDelete fails", async () => {
      const deleteError = new Error("Delete failed");
      mockNotificationFindOneAndDelete.mockRejectedValue(deleteError);

      await deleteNotification(req, res);

      expect(mockNotificationFindOneAndDelete).toHaveBeenCalledWith({
        _id: notificationId,
        recipient: testUserId,
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: deleteError.message,
      });
    });
  });

  // --- Tests for getUnreadCount ---
  describe("getUnreadCount", () => {
    const cacheKey = `unread_notifications_count:${testUserId}`;
    const mockCount = 5;

    it("should return count from cache if available", async () => {
      mockGetAsync.mockResolvedValue(mockCount.toString()); // Cache stores string

      await getUnreadCount(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationCountDocuments).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockCount,
      });
    });

    it("should return count 0 from cache if available", async () => {
      mockGetAsync.mockResolvedValue("0"); // Cache stores string '0'

      await getUnreadCount(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationCountDocuments).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 0 });
    });

    it("should fetch count from DB if not in cache and store in cache", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      mockNotificationCountDocuments.mockResolvedValue(mockCount);
      mockSetAsync.mockResolvedValue("OK");

      await getUnreadCount(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationCountDocuments).toHaveBeenCalledWith({
        recipient: testUserId,
        isRead: false,
      });
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        mockCount.toString(),
        "EX",
        60 // CACHE_EXPIRATION
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockCount,
      });
    });

    it("should fetch count 0 from DB if not in cache and store in cache", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      mockNotificationCountDocuments.mockResolvedValue(0);
      mockSetAsync.mockResolvedValue("OK");

      await getUnreadCount(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationCountDocuments).toHaveBeenCalledWith({
        recipient: testUserId,
        isRead: false,
      });
      expect(mockSetAsync).toHaveBeenCalledWith(cacheKey, "0", "EX", 60);
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 0 });
    });

    it("should return 500 if DB count fails", async () => {
      mockGetAsync.mockResolvedValue(null);
      const dbError = new Error("DB count failed");
      mockNotificationCountDocuments.mockRejectedValue(dbError);

      await getUnreadCount(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationCountDocuments).toHaveBeenCalledWith({
        recipient: testUserId,
        isRead: false,
      });
      expect(mockSetAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: dbError.message,
      });
    });

    it("should return 500 if Redis get fails", async () => {
      const redisError = new Error("Redis GET Failed");
      mockGetAsync.mockRejectedValue(redisError);

      await getUnreadCount(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationCountDocuments).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: redisError.message,
      });
    });

    it("should still return data if Redis set fails", async () => {
      mockGetAsync.mockResolvedValue(null);
      mockNotificationCountDocuments.mockResolvedValue(mockCount);
      const redisSetError = new Error("Redis SET failed");
      mockSetAsync.mockRejectedValue(redisSetError);
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getUnreadCount(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockNotificationCountDocuments).toHaveBeenCalled();
      expect(mockSetAsync).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Redis set error:",
        redisSetError
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockCount,
      });
      expect(res.status).not.toHaveBeenCalled(); // Should not set error status

      consoleErrorSpy.mockRestore();
    });
  });
});
