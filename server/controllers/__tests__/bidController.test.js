// Define mock functions first
const mockBidSave = jest.fn();
const mockBidFindById = jest.fn();
const mockBidFind = jest.fn();
const mockBidUpdateMany = jest.fn();
const mockBidDeleteOne = jest.fn();

const mockJobFindById = jest.fn();
const mockJobSave = jest.fn(); // Added for acceptBid

const mockNotificationSave = jest.fn();

const mockGetAsync = jest.fn();
const mockSetAsync = jest.fn();

// Mock dependencies *before* importing the controller
jest.mock("../../models/bid", () => {
  const MockBid = jest.fn().mockImplementation(() => ({
    save: mockBidSave,
    deleteOne: mockBidDeleteOne, // Mock deleteOne instance method
  }));
  MockBid.findById = mockBidFindById;
  MockBid.find = mockBidFind;
  MockBid.updateMany = mockBidUpdateMany;
  return MockBid;
});

jest.mock("../../models/job", () => {
  const MockJob = jest.fn().mockImplementation(() => ({
    save: mockJobSave,
  }));
  MockJob.findById = mockJobFindById;
  return MockJob;
});

jest.mock("../../models/notification", () => {
  const MockNotification = jest.fn().mockImplementation(() => ({
    save: mockNotificationSave,
  }));
  return MockNotification;
});

jest.mock("../../config/redis", () => ({
  getAsync: mockGetAsync,
  setAsync: mockSetAsync,
}));

// Mock mongoose separately if needed for ObjectId validation
jest.mock("mongoose", () => {
  const originalMongoose = jest.requireActual("mongoose");
  return {
    ...originalMongoose,
    Types: {
      ...originalMongoose.Types,
      ObjectId: jest.fn((id) => new originalMongoose.Types.ObjectId(id)), // Use real ObjectId for checks
    },
  };
});

// Now import the controller functions
const {
  placeBid,
  getBidsForJob,
  acceptBid,
  getRecentBids,
  getBidDetails,
  getBidById,
  getBidsByUserId,
  deleteBid,
} = require("../bidController");

// Import mocked models for direct use if needed
const Bid = require("../../models/bid");
const Job = require("../../models/job");
const Notification = require("../../models/notification");
const { getAsync, setAsync } = require("../../config/redis");
const mongoose = require("mongoose");

describe("Bid Controller", () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockBidSave.mockClear();
    mockBidFindById.mockClear();
    mockBidFind.mockClear();
    mockBidUpdateMany.mockClear();
    mockBidDeleteOne.mockClear();
    mockJobFindById.mockClear();
    mockJobSave.mockClear();
    mockNotificationSave.mockClear();
    mockGetAsync.mockClear();
    mockSetAsync.mockClear();

    // Mock request object
    req = {
      body: {},
      user: { id: "testUserId" }, // Assume user is authenticated
      params: {},
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock next function (though not used in these controllers)
    next = jest.fn();

    // Ensure mongoose.Types.ObjectId is mock cleared if used directly
    if (mongoose.Types.ObjectId.mockClear) {
      mongoose.Types.ObjectId.mockClear();
    }
    // Mock the static isValid method needed for deleteBid
    mongoose.Types.ObjectId.isValid = jest.fn((id) => {
      // Basic validation mimic or use requireActual if complex logic needed
      return /^[0-9a-fA-F]{24}$/.test(id);
    });
  });

  // --- Tests for placeBid ---
  describe("placeBid", () => {
    it("should place a new bid successfully and create a notification", async () => {
      req.body = { amount: 100, jobId: "testJobId" };
      req.user = { id: "freelancerId" };

      const mockNewBid = {
        _id: "newBidId",
        amount: 100,
        job: "testJobId",
        freelancer: "freelancerId",
      };
      Bid.mockImplementation(() => ({
        save: mockBidSave.mockResolvedValue(mockNewBid),
        ...mockNewBid, // Include properties if accessed directly
      }));

      const mockJob = { _id: "testJobId", employer: "employerId" };
      mockJobFindById.mockResolvedValue(mockJob);

      Notification.mockImplementation(() => ({
        save: mockNotificationSave.mockResolvedValue({}),
      }));

      await placeBid(req, res);

      expect(Bid).toHaveBeenCalledWith({
        amount: 100,
        job: "testJobId",
        freelancer: "freelancerId",
      });
      expect(mockBidSave).toHaveBeenCalled();
      expect(mockJobFindById).toHaveBeenCalledWith("testJobId");
      expect(Notification).toHaveBeenCalledWith({
        recipient: "employerId",
        type: "bid",
        title: "New Bid Received",
        message: "A new bid of $100 has been placed on your job",
        relatedId: "newBidId",
        onModel: "Bid",
      });
      expect(mockNotificationSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "newBidId",
          amount: 100,
          job: "testJobId",
          freelancer: "freelancerId",
        })
      );
    });

    it("should handle job not found when creating notification", async () => {
      req.body = { amount: 100, jobId: "testJobId" };
      req.user = { id: "freelancerId" };

      const mockNewBid = {
        _id: "newBidId",
        amount: 100,
        job: "testJobId",
        freelancer: "freelancerId",
      };
      Bid.mockImplementation(() => ({
        save: mockBidSave.mockResolvedValue(mockNewBid),
        ...mockNewBid,
      }));

      mockJobFindById.mockResolvedValue(null); // Job not found

      await placeBid(req, res);

      expect(Bid).toHaveBeenCalled();
      expect(mockBidSave).toHaveBeenCalled();
      expect(mockJobFindById).toHaveBeenCalledWith("testJobId");
      expect(Notification).not.toHaveBeenCalled(); // Notification should not be created
      expect(mockNotificationSave).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201); // Still returns 201 as bid was saved
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "newBidId",
          amount: 100,
          job: "testJobId",
          freelancer: "freelancerId",
        })
      );
    });

    it("should return 500 if saving bid fails", async () => {
      req.body = { amount: 100, jobId: "testJobId" };
      req.user = { id: "freelancerId" };
      const saveError = new Error("Database save failed");
      Bid.mockImplementation(() => ({
        save: mockBidSave.mockRejectedValue(saveError),
      }));

      await placeBid(req, res);

      expect(Bid).toHaveBeenCalled();
      expect(mockBidSave).toHaveBeenCalled();
      expect(mockJobFindById).not.toHaveBeenCalled();
      expect(mockNotificationSave).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error placing bid" });
    });

    it("should return 500 if saving notification fails", async () => {
      req.body = { amount: 100, jobId: "testJobId" };
      req.user = { id: "freelancerId" };
      const mockNewBid = {
        _id: "newBidId",
        amount: 100,
        job: "testJobId",
        freelancer: "freelancerId",
      };
      Bid.mockImplementation(() => ({
        save: mockBidSave.mockResolvedValue(mockNewBid),
        ...mockNewBid,
      }));
      const mockJob = { _id: "testJobId", employer: "employerId" };
      mockJobFindById.mockResolvedValue(mockJob);
      const notificationError = new Error("Notification save failed");
      Notification.mockImplementation(() => ({
        save: mockNotificationSave.mockRejectedValue(notificationError),
      }));

      // The controller catches this specific error internally but proceeds
      // So we expect the outer catch block to trigger if notification save fails
      // Let's refine the test based on the actual code's try/catch structure

      await placeBid(req, res);

      // Even if notification fails, the current code structure might still succeed
      // Let's assume the main try-catch handles the notification save failure.
      // Re-checking the controller code: The notification save is awaited *within* the main try block.
      // If it fails, the main catch block *should* execute.

      expect(Bid).toHaveBeenCalled();
      expect(mockBidSave).toHaveBeenCalled();
      expect(mockJobFindById).toHaveBeenCalledWith("testJobId");
      expect(Notification).toHaveBeenCalled();
      expect(mockNotificationSave).toHaveBeenCalled();
      // Because notification save fails, the outer catch block is executed.
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error placing bid" });
    });
  });

  // --- Tests for getBidsForJob ---
  describe("getBidsForJob", () => {
    const jobId = "testJobId";
    const cacheKey = `job_bids:${jobId}`;
    const mockBids = [
      { _id: "bid1", amount: 50 },
      { _id: "bid2", amount: 75 },
    ];

    beforeEach(() => {
      req.params.jobId = jobId;
    });

    it("should return bids from cache if available", async () => {
      mockGetAsync.mockResolvedValue(JSON.stringify(mockBids));

      await getBidsForJob(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).not.toHaveBeenCalled();
      expect(mockSetAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockBids);
    });

    it("should fetch bids from DB if not in cache and store in cache", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockPopulate = jest.fn().mockResolvedValue(mockBids);
      mockBidFind.mockImplementation(() => ({
        populate: mockPopulate,
      }));
      mockSetAsync.mockResolvedValue("OK");

      await getBidsForJob(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).toHaveBeenCalledWith({ job: jobId });
      expect(mockPopulate).toHaveBeenCalledWith("freelancer");
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(mockBids),
        "EX",
        60 // CACHE_EXPIRATION
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockBids);
    });

    it("should return 500 if DB fetch fails", async () => {
      mockGetAsync.mockResolvedValue(null);
      const dbError = new Error("DB Find Failed");
      mockBidFind.mockImplementation(() => ({
        populate: jest.fn().mockRejectedValue(dbError),
      }));

      await getBidsForJob(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).toHaveBeenCalledWith({ job: jobId });
      expect(mockSetAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error fetching bids" });
    });

    it("should return 500 if Redis get fails", async () => {
      const redisError = new Error("Redis GET Failed");
      mockGetAsync.mockRejectedValue(redisError);

      await getBidsForJob(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).not.toHaveBeenCalled(); // Should fail before DB query
      expect(mockSetAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error fetching bids" });
    });

    it("should still return data if Redis set fails after DB fetch", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockPopulate = jest.fn().mockResolvedValue(mockBids);
      mockBidFind.mockImplementation(() => ({
        populate: mockPopulate,
      }));
      const redisSetError = new Error("Redis SET Failed");
      mockSetAsync.mockRejectedValue(redisSetError); // Simulate failure during cache set

      // Mock console.error to check if it's called
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getBidsForJob(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).toHaveBeenCalledWith({ job: jobId });
      expect(mockPopulate).toHaveBeenCalledWith("freelancer");
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(mockBids),
        "EX",
        60
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Redis set error:",
        redisSetError
      );
      expect(res.status).toHaveBeenCalledWith(200); // Should still return 200 OK
      expect(res.json).toHaveBeenCalledWith(mockBids); // Should return the fetched data

      consoleErrorSpy.mockRestore();
    });
  });

  // --- Tests for acceptBid ---
  describe("acceptBid", () => {
    const bidId = "testBidId";
    const jobId = "testJobId";
    const freelancerId = "freelancerId";
    const employerId = "employerId";

    let mockBid;
    let mockJob;

    beforeEach(() => {
      req.params.bidId = bidId;
      req.user = { id: employerId }; // User is the employer

      mockBid = {
        _id: bidId,
        job: jobId,
        freelancer: freelancerId,
        status: "pending",
        save: mockBidSave.mockResolvedValue({
          // Mock save on the instance
          _id: bidId,
          job: jobId,
          freelancer: freelancerId,
          status: "accepted", // Reflect change after save
        }),
      };

      mockJob = {
        _id: jobId,
        employer: employerId,
        status: "open",
        bidAccepted: false,
        title: "Test Job Title",
        freelancer: null,
        save: mockJobSave.mockResolvedValue({
          // Mock save on the instance
          _id: jobId,
          employer: employerId,
          status: "in-progress", // Reflect changes after save
          bidAccepted: true,
          title: "Test Job Title",
          freelancer: freelancerId,
        }),
      };

      mockBidFindById.mockResolvedValue(mockBid);
      mockJobFindById.mockResolvedValue(mockJob);
      mockBidUpdateMany.mockResolvedValue({ nModified: 5 }); // Simulate rejecting 5 other bids
      Notification.mockImplementation(() => ({
        save: mockNotificationSave.mockResolvedValue({}),
      }));
    });

    it("should accept a bid successfully, update job, reject others, and notify", async () => {
      await acceptBid(req, res);

      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockBid.save).toHaveBeenCalled(); // Check if instance save was called
      expect(mockBidUpdateMany).toHaveBeenCalledWith(
        { job: jobId, _id: { $ne: bidId } },
        { status: "rejected" }
      );
      expect(mockJob.save).toHaveBeenCalled(); // Check if instance save was called
      expect(Notification).toHaveBeenCalledWith({
        recipient: freelancerId,
        type: "job_award",
        title: "Bid Accepted",
        message: "Your bid has been accepted for the job: Test Job Title",
        relatedId: jobId,
        onModel: "Job",
      });
      expect(mockNotificationSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Bid accepted",
          job: expect.objectContaining({
            // Check the job state AFTER save
            status: "in-progress",
            bidAccepted: true,
            freelancer: freelancerId,
          }),
        })
      );

      // Verify bid status changed before sending response (via mock save)
      expect(mockBid.status).toBe("accepted"); // Check the status on the object after save mock
      // Verify job status changed before sending response (via mock save)
      expect(mockJob.status).toBe("in-progress");
      expect(mockJob.bidAccepted).toBe(true);
      expect(mockJob.freelancer).toBe(freelancerId);
    });

    it("should return 404 if bid not found", async () => {
      mockBidFindById.mockResolvedValue(null);
      await acceptBid(req, res);
      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockJobFindById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Bid not found" });
    });

    it("should return 404 if job not found", async () => {
      mockJobFindById.mockResolvedValue(null);
      await acceptBid(req, res);
      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should return 403 if user is not the job employer", async () => {
      req.user.id = "anotherUserId"; // Different user
      await acceptBid(req, res);
      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "You are not authorized to accept this bid.",
      });
    });

    it("should return 500 if bid save fails", async () => {
      const saveError = new Error("Bid save failed");
      mockBid.save = mockBidSave.mockRejectedValue(saveError); // Mock failure on instance save
      mockBidFindById.mockResolvedValue(mockBid); // Ensure findById still returns the mock object

      await acceptBid(req, res);

      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockBid.save).toHaveBeenCalled();
      expect(mockBidUpdateMany).not.toHaveBeenCalled(); // Should fail before this
      expect(mockJob.save).not.toHaveBeenCalled();
      expect(mockNotificationSave).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error accepting bid" });
    });

    it("should return 500 if job save fails", async () => {
      const saveError = new Error("Job save failed");
      // Reset instance mocks potentially set in beforeEach
      mockBidSave.mockResolvedValue(mockBid); // Ensure bid save succeeds first
      mockJobSave.mockRejectedValue(saveError); // Make job save fail

      // Mock the findById calls to return objects that use these specific mocks
      mockBidFindById.mockResolvedValue({ ...mockBid, save: mockBidSave });
      mockJobFindById.mockResolvedValue({ ...mockJob, save: mockJobSave });

      await acceptBid(req, res);

      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockBidSave).toHaveBeenCalled(); // Bid save should be called
      expect(mockBidUpdateMany).toHaveBeenCalled(); // Update many should be called
      expect(mockJobSave).toHaveBeenCalled(); // Job save should be called (and reject)
      expect(mockNotificationSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error accepting bid" });
    });

    it("should return 500 if notification save fails", async () => {
      const notificationError = new Error("Notification save failed");
      // Reset instance mocks potentially set in beforeEach and ensure success
      mockBidSave.mockResolvedValue(mockBid); // Bid save succeeds
      mockJobSave.mockResolvedValue(mockJob); // Job save succeeds
      mockNotificationSave.mockRejectedValue(notificationError); // Notification save fails

      // Mock the findById calls to return objects that use these specific mocks
      mockBidFindById.mockResolvedValue({ ...mockBid, save: mockBidSave });
      mockJobFindById.mockResolvedValue({ ...mockJob, save: mockJobSave });
      // Mock Notification constructor to return an instance with the failing save
      Notification.mockImplementation(() => ({
        save: mockNotificationSave,
      }));

      await acceptBid(req, res);

      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockBidSave).toHaveBeenCalled(); // Called and succeeded
      expect(mockBidUpdateMany).toHaveBeenCalled(); // Called and succeeded
      // Correction: job.save happens *after* notification.save, so it shouldn't be called if notification fails
      expect(mockJobSave).not.toHaveBeenCalled();
      expect(Notification).toHaveBeenCalled(); // Notification constructor called
      expect(mockNotificationSave).toHaveBeenCalled(); // Notification save called (and rejected)
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error accepting bid" });
    });
  });

  // --- Tests for getRecentBids ---
  describe("getRecentBids", () => {
    const freelancerId = "testFreelancerId";
    const cacheKey = `recent_bids:${freelancerId}`;
    const mockRecentBids = [
      { _id: "bid3", job: { title: "Job 3" }, createdAt: new Date() },
      {
        _id: "bid1",
        job: { title: "Job 1" },
        createdAt: new Date(Date.now() - 10000),
      },
    ];

    beforeEach(() => {
      req.user = { id: freelancerId };
      // Mock ObjectId constructor used inside the function
      mongoose.Types.ObjectId.mockImplementation((id) => id); // Simple mock
    });

    it("should return recent bids from cache if available", async () => {
      // Adjust expected data to match JSON stringified dates
      const expectedBids = mockRecentBids.map((bid) => ({
        ...bid,
        createdAt: bid.createdAt.toISOString(), // Convert Date to ISO string
      }));
      mockGetAsync.mockResolvedValue(JSON.stringify(expectedBids));
      await getRecentBids(req, res);
      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ recentBids: expectedBids });
    });

    it("should fetch recent bids from DB if not in cache and store in cache", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockPopulate = jest.fn().mockReturnThis(); // Chainable populate
      const mockSort = jest.fn().mockResolvedValue(mockRecentBids); // Sort resolves
      mockBidFind.mockImplementation(() => ({
        populate: mockPopulate,
        sort: mockSort,
      }));
      mockSetAsync.mockResolvedValue("OK");
      // Mock ObjectId to return a specific mock instance for comparison
      const mockObjectIdInstance = {
        toString: () => freelancerId,
        equals: (other) =>
          other === freelancerId || other.toString() === freelancerId,
      };
      mongoose.Types.ObjectId.mockImplementation((id) => {
        if (id === freelancerId) return mockObjectIdInstance;
        return id; // return raw id otherwise, or handle other cases
      });

      await getRecentBids(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(freelancerId); // Verify ObjectId constructor call
      expect(mockBidFind).toHaveBeenCalledWith({
        freelancer: mockObjectIdInstance,
      }); // Use the mock instance in expectation
      expect(mockPopulate).toHaveBeenCalledWith("job");
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(mockRecentBids),
        "EX",
        60
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ recentBids: mockRecentBids });
    });

    it("should return empty array and cache it if no bids found", async () => {
      mockGetAsync.mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue([]); // No bids found
      mockBidFind.mockImplementation(() => ({
        populate: mockPopulate,
        sort: mockSort,
      }));
      mockSetAsync.mockResolvedValue("OK");
      // Mock ObjectId to return a specific mock instance for comparison
      const mockObjectIdInstance = {
        toString: () => freelancerId,
        equals: (other) =>
          other === freelancerId || other.toString() === freelancerId,
      };
      mongoose.Types.ObjectId.mockImplementation((id) => {
        if (id === freelancerId) return mockObjectIdInstance;
        return id;
      });

      await getRecentBids(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).toHaveBeenCalledWith({
        freelancer: mockObjectIdInstance,
      }); // Use mock instance
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify([]),
        "EX",
        60
      ); // Cache empty array
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ recentBids: [] }); // Return empty array
    });

    it("should return 500 if DB fetch fails", async () => {
      mockGetAsync.mockResolvedValue(null);
      const dbError = new Error("DB Find Failed");
      const mockPopulate = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockRejectedValue(dbError);
      mockBidFind.mockImplementation(() => ({
        populate: mockPopulate,
        sort: mockSort,
      }));
      // Mock ObjectId to return a specific mock instance for comparison
      const mockObjectIdInstance = {
        toString: () => freelancerId,
        equals: (other) =>
          other === freelancerId || other.toString() === freelancerId,
      };
      mongoose.Types.ObjectId.mockImplementation((id) => {
        if (id === freelancerId) return mockObjectIdInstance;
        return id;
      });

      await getRecentBids(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).toHaveBeenCalledWith({
        freelancer: mockObjectIdInstance,
      }); // Use mock instance
      expect(mockSetAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error retrieving recent bids",
        error: dbError.message,
      });
    });

    it("should return 500 if Redis get fails", async () => {
      const redisError = new Error("Redis GET failed");
      mockGetAsync.mockRejectedValue(redisError);

      await getRecentBids(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error retrieving recent bids",
        error: redisError.message,
      });
    });

    it("should still return data if Redis set fails", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockPopulate = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue(mockRecentBids);
      mockBidFind.mockImplementation(() => ({
        populate: mockPopulate,
        sort: mockSort,
      }));
      const redisSetError = new Error("Redis SET failed");
      mockSetAsync.mockRejectedValue(redisSetError);

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getRecentBids(req, res);

      expect(mockSetAsync).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Redis set error:",
        redisSetError
      );
      expect(res.status).toHaveBeenCalledWith(200); // Still success
      expect(res.json).toHaveBeenCalledWith({ recentBids: mockRecentBids }); // Still return data

      consoleErrorSpy.mockRestore();
    });
  });

  // --- Tests for getBidDetails ---
  describe("getBidDetails", () => {
    const bidId = "detailBidId";
    const cacheKey = `bid_details:${bidId}`;
    const mockBidDetail = {
      _id: bidId,
      amount: 250,
      freelancer: { name: "Detail Freelancer", username: "detailfree" },
      job: { title: "Detail Job" },
    };

    beforeEach(() => {
      req.params.bidId = bidId;
    });

    it("should return bid details from cache if available", async () => {
      mockGetAsync.mockResolvedValue(JSON.stringify(mockBidDetail));
      await getBidDetails(req, res);
      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFindById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ bid: mockBidDetail });
    });

    it("should fetch bid details from DB if not in cache and store in cache", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockPopulateJob = jest.fn().mockResolvedValue(mockBidDetail);
      mockBidFindById.mockImplementation(() => ({
        populate: mockPopulateFreelancer.mockImplementation(() => ({
          // Chain populate calls
          populate: mockPopulateJob,
        })),
      }));
      mockSetAsync.mockResolvedValue("OK");

      await getBidDetails(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockPopulateFreelancer).toHaveBeenCalledWith(
        "freelancer",
        "name username"
      );
      expect(mockPopulateJob).toHaveBeenCalledWith("job", "title");
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(mockBidDetail),
        "EX",
        60
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ bid: mockBidDetail });
    });

    it("should return 404 and cache null if bid not found in DB", async () => {
      mockGetAsync.mockResolvedValue(null);
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockPopulateJob = jest.fn().mockResolvedValue(null); // DB returns null
      mockBidFindById.mockImplementation(() => ({
        populate: mockPopulateFreelancer.mockImplementation(() => ({
          populate: mockPopulateJob,
        })),
      }));
      mockSetAsync.mockResolvedValue("OK");

      await getBidDetails(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(null),
        "EX",
        60
      ); // Cache null
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Bid not found" });
    });

    it("should return 500 if DB fetch fails", async () => {
      mockGetAsync.mockResolvedValue(null);
      const dbError = new Error("DB FindById Failed");
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockPopulateJob = jest.fn().mockRejectedValue(dbError);
      mockBidFindById.mockImplementation(() => ({
        populate: mockPopulateFreelancer.mockImplementation(() => ({
          populate: mockPopulateJob,
        })),
      }));

      await getBidDetails(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockSetAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: dbError,
      });
    });

    it("should return 500 if Redis get fails", async () => {
      const redisError = new Error("Redis GET failed");
      mockGetAsync.mockRejectedValue(redisError);

      await getBidDetails(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFindById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: redisError,
      });
    });

    it("should still return data if Redis set fails", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockPopulateJob = jest.fn().mockResolvedValue(mockBidDetail);
      mockBidFindById.mockImplementation(() => ({
        populate: mockPopulateFreelancer.mockImplementation(() => ({
          populate: mockPopulateJob,
        })),
      }));
      const redisSetError = new Error("Redis SET failed");
      mockSetAsync.mockRejectedValue(redisSetError);

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getBidDetails(req, res);

      expect(mockSetAsync).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Redis set error:",
        redisSetError
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ bid: mockBidDetail });

      consoleErrorSpy.mockRestore();
    });
  });

  // --- Tests for getBidById ---
  // Note: This is very similar to getBidDetails but uses a different cache key and response structure.
  describe("getBidById", () => {
    const bidId = "specificBidId";
    const cacheKey = `bid:${bidId}`;
    const mockSpecificBid = {
      _id: bidId,
      amount: 300,
      freelancer: {
        name: "Specific Freelancer",
        username: "specificfree",
        email: "specific@test.com",
      },
      job: { _id: "specificJobId", title: "Specific Job" },
    };

    beforeEach(() => {
      req.params.bidId = bidId;
    });

    it("should return bid from cache if available", async () => {
      mockGetAsync.mockResolvedValue(JSON.stringify(mockSpecificBid));
      await getBidById(req, res);
      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFindById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSpecificBid,
      });
    });

    it("should return 404 if null is cached", async () => {
      mockGetAsync.mockResolvedValue(JSON.stringify(null)); // Cache hit for not found
      await getBidById(req, res);
      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFindById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Bid not found",
      });
    });

    it("should fetch bid from DB if not in cache and store in cache", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockPopulateJob = jest.fn().mockResolvedValue(mockSpecificBid);
      mockBidFindById.mockImplementation(() => ({
        populate: mockPopulateFreelancer.mockImplementation(() => ({
          // Chain populate calls
          populate: mockPopulateJob,
        })),
      }));
      mockSetAsync.mockResolvedValue("OK");

      await getBidById(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockPopulateFreelancer).toHaveBeenCalledWith(
        "freelancer",
        "name username email"
      );
      expect(mockPopulateJob).toHaveBeenCalledWith("job");
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(mockSpecificBid),
        "EX",
        60
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSpecificBid,
      });
    });

    it("should return 404 and cache null if bid not found in DB", async () => {
      mockGetAsync.mockResolvedValue(null);
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockPopulateJob = jest.fn().mockResolvedValue(null); // DB returns null
      mockBidFindById.mockImplementation(() => ({
        populate: mockPopulateFreelancer.mockImplementation(() => ({
          populate: mockPopulateJob,
        })),
      }));
      mockSetAsync.mockResolvedValue("OK");

      await getBidById(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(null),
        "EX",
        60
      ); // Cache null
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Bid not found",
      });
    });

    it("should return 500 if DB fetch fails", async () => {
      mockGetAsync.mockResolvedValue(null);
      const dbError = new Error("DB FindById Failed");
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockPopulateJob = jest.fn().mockRejectedValue(dbError);
      mockBidFindById.mockImplementation(() => ({
        populate: mockPopulateFreelancer.mockImplementation(() => ({
          populate: mockPopulateJob,
        })),
      }));

      await getBidById(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFindById).toHaveBeenCalledWith(bidId);
      expect(mockSetAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error fetching bid",
        error: dbError.message,
      });
    });

    it("should return 500 if Redis get fails", async () => {
      const redisError = new Error("Redis GET failed");
      mockGetAsync.mockRejectedValue(redisError);

      await getBidById(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFindById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error fetching bid",
        error: redisError.message,
      });
    });

    it("should still return data if Redis set fails", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockPopulateJob = jest.fn().mockResolvedValue(mockSpecificBid);
      mockBidFindById.mockImplementation(() => ({
        populate: mockPopulateFreelancer.mockImplementation(() => ({
          populate: mockPopulateJob,
        })),
      }));
      const redisSetError = new Error("Redis SET failed");
      mockSetAsync.mockRejectedValue(redisSetError);

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getBidById(req, res);

      expect(mockSetAsync).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Redis set error:",
        redisSetError
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSpecificBid,
      });

      consoleErrorSpy.mockRestore();
    });
  });

  // --- Tests for getBidsByUserId ---
  describe("getBidsByUserId", () => {
    const userId = "userWithBidsId";
    const cacheKey = `user_bids:${userId}`;
    const mockUserBids = [
      {
        _id: "bidUser1",
        job: { title: "User Job 1" },
        freelancer: {
          name: "Test User",
          username: "testuser",
          email: "test@test.com",
        },
      },
      {
        _id: "bidUser2",
        job: { title: "User Job 2" },
        freelancer: {
          name: "Test User",
          username: "testuser",
          email: "test@test.com",
        },
      },
    ];

    beforeEach(() => {
      req.params.userId = userId;
    });

    it("should return user bids from cache if available", async () => {
      mockGetAsync.mockResolvedValue(JSON.stringify(mockUserBids));
      await getBidsByUserId(req, res);
      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockUserBids.length,
        data: mockUserBids,
      });
    });

    it("should fetch user bids from DB if not in cache and store in cache", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockPopulateJob = jest.fn().mockReturnThis();
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue(mockUserBids);
      mockBidFind.mockImplementation(() => ({
        populate: mockPopulateJob.mockImplementation(() => ({
          populate: mockPopulateFreelancer.mockImplementation(() => ({
            sort: mockSort,
          })),
        })),
      }));
      mockSetAsync.mockResolvedValue("OK");

      await getBidsByUserId(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).toHaveBeenCalledWith({ freelancer: userId });
      expect(mockPopulateJob).toHaveBeenCalledWith("job");
      expect(mockPopulateFreelancer).toHaveBeenCalledWith(
        "freelancer",
        "name username email"
      );
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(mockUserBids),
        "EX",
        60
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockUserBids.length,
        data: mockUserBids,
      });
    });

    it("should return empty array and cache it if no bids found", async () => {
      mockGetAsync.mockResolvedValue(null);
      const mockPopulateJob = jest.fn().mockReturnThis();
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue([]); // No bids found
      mockBidFind.mockImplementation(() => ({
        populate: mockPopulateJob.mockImplementation(() => ({
          populate: mockPopulateFreelancer.mockImplementation(() => ({
            sort: mockSort,
          })),
        })),
      }));
      mockSetAsync.mockResolvedValue("OK");

      await getBidsByUserId(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).toHaveBeenCalledWith({ freelancer: userId });
      expect(mockSetAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify([]),
        "EX",
        60
      ); // Cache empty array
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: [],
      }); // Return empty array
    });

    it("should return 500 if DB fetch fails", async () => {
      mockGetAsync.mockResolvedValue(null);
      const dbError = new Error("DB Find Failed");
      const mockPopulateJob = jest.fn().mockReturnThis();
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockRejectedValue(dbError);
      mockBidFind.mockImplementation(() => ({
        populate: mockPopulateJob.mockImplementation(() => ({
          populate: mockPopulateFreelancer.mockImplementation(() => ({
            sort: mockSort,
          })),
        })),
      }));

      await getBidsByUserId(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).toHaveBeenCalledWith({ freelancer: userId });
      expect(mockSetAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error fetching user's bids",
        error: dbError.message,
      });
    });

    it("should return 500 if Redis get fails", async () => {
      const redisError = new Error("Redis GET failed");
      mockGetAsync.mockRejectedValue(redisError);

      await getBidsByUserId(req, res);

      expect(mockGetAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockBidFind).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error fetching user's bids",
        error: redisError.message,
      });
    });

    it("should still return data if Redis set fails", async () => {
      mockGetAsync.mockResolvedValue(null); // Cache miss
      const mockPopulateJob = jest.fn().mockReturnThis();
      const mockPopulateFreelancer = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue(mockUserBids);
      mockBidFind.mockImplementation(() => ({
        populate: mockPopulateJob.mockImplementation(() => ({
          populate: mockPopulateFreelancer.mockImplementation(() => ({
            sort: mockSort,
          })),
        })),
      }));
      const redisSetError = new Error("Redis SET failed");
      mockSetAsync.mockRejectedValue(redisSetError);

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getBidsByUserId(req, res);

      expect(mockSetAsync).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Redis set error:",
        redisSetError
      );
      expect(res.status).toHaveBeenCalledWith(200); // Still success
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockUserBids.length,
        data: mockUserBids,
      }); // Still return data

      consoleErrorSpy.mockRestore();
    });
  });

  // --- Tests for deleteBid ---
  describe("deleteBid", () => {
    const bidIdToDelete = "bidToDeleteId";
    const ownerUserId = "ownerUserId";
    const nonOwnerUserId = "nonOwnerUserId";

    let mockBidToDelete;

    beforeEach(() => {
      req.params.bidId = bidIdToDelete;
      req.user = { id: ownerUserId }; // Assume the owner is making the request initially

      mockBidToDelete = {
        _id: bidIdToDelete,
        freelancer: ownerUserId, // The user making the request owns this bid
        deleteOne: mockBidDeleteOne.mockResolvedValue({ deletedCount: 1 }), // Mock instance method
      };

      // Reset ObjectId.isValid mock for each test if necessary
      mongoose.Types.ObjectId.isValid.mockImplementation((id) =>
        /^[0-9a-fA-F]{24}$/.test(id)
      );
      mockBidFindById.mockResolvedValue(mockBidToDelete); // Default: bid exists and is owned by user
    });

    it("should delete a bid successfully if user is owner", async () => {
      // Ensure the mock ObjectId is valid for the test case
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);

      await deleteBid(req, res);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(
        bidIdToDelete
      );
      expect(mockBidFindById).toHaveBeenCalledWith(bidIdToDelete);
      expect(mockBidDeleteOne).toHaveBeenCalled(); // Check if the instance method was called
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Bid deleted successfully",
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      req.user = null; // No user
      await deleteBid(req, res);
      expect(mongoose.Types.ObjectId.isValid).not.toHaveBeenCalled();
      expect(mockBidFindById).not.toHaveBeenCalled();
      expect(mockBidDeleteOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not authenticated",
      });
    });

    it("should return 400 if bid ID is invalid", async () => {
      req.params.bidId = "invalid-id";
      mongoose.Types.ObjectId.isValid.mockReturnValue(false); // Make it invalid for this test

      await deleteBid(req, res);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(
        "invalid-id"
      );
      expect(mockBidFindById).not.toHaveBeenCalled();
      expect(mockBidDeleteOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid bid ID" });
    });

    it("should return 404 if bid not found", async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      mockBidFindById.mockResolvedValue(null); // Bid not found

      await deleteBid(req, res);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(
        bidIdToDelete
      );
      expect(mockBidFindById).toHaveBeenCalledWith(bidIdToDelete);
      expect(mockBidDeleteOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Bid not found" });
    });

    it("should return 403 if user is not the owner of the bid", async () => {
      req.user.id = nonOwnerUserId; // User is not the owner
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      // mockBidFindById is already set to return a bid owned by ownerUserId

      await deleteBid(req, res);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(
        bidIdToDelete
      );
      expect(mockBidFindById).toHaveBeenCalledWith(bidIdToDelete);
      expect(mockBidDeleteOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized to delete this bid",
      });
    });

    it("should return 500 if findById fails", async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      const dbError = new Error("FindById failed");
      mockBidFindById.mockRejectedValue(dbError);

      await deleteBid(req, res);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(
        bidIdToDelete
      );
      expect(mockBidFindById).toHaveBeenCalledWith(bidIdToDelete);
      expect(mockBidDeleteOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error deleting bid",
        error: dbError.message,
      });
    });

    it("should return 500 if deleteOne fails", async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      const deleteError = new Error("Delete failed");
      mockBidToDelete.deleteOne =
        mockBidDeleteOne.mockRejectedValue(deleteError); // Mock failure on instance method
      mockBidFindById.mockResolvedValue(mockBidToDelete); // Ensure findById returns the object

      await deleteBid(req, res);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(
        bidIdToDelete
      );
      expect(mockBidFindById).toHaveBeenCalledWith(bidIdToDelete);
      expect(mockBidDeleteOne).toHaveBeenCalled(); // It was called but failed
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error deleting bid",
        error: deleteError.message,
      });
    });
  });
});
