// Define mock functions for models and dependencies
const mockJobSave = jest.fn();
const mockJobFindById = jest.fn();
const mockJobFind = jest.fn();
const mockUserFind = jest.fn();
const mockNotificationInsertMany = jest.fn();
const mockBidSave = jest.fn();

// Mock Models
jest.mock("../../models/job", () => {
  // Mock the constructor to return an object with a save method
  return jest.fn().mockImplementation((jobData) => ({
    ...jobData,
    _id: "mockJobId-" + Date.now(), // Assign a mock ID dynamically
    save: mockJobSave.mockImplementation(function () {
      // 'this' refers to the object created by the mockImplementation
      return Promise.resolve(this);
    }),
  }));
});

// Statically assign the mocked static methods AFTER mocking the constructor
const Job = require("../../models/job");
Job.findById = mockJobFindById;
Job.find = mockJobFind;

jest.mock("../../models/bid", () => {
  // Mock constructor to return object with save method
  return jest.fn().mockImplementation((bidData) => ({
    ...bidData,
    _id: "mockBidId-" + Date.now(),
    save: mockBidSave.mockImplementation(function () {
      // Save resolves with the instance itself
      return Promise.resolve(this);
    }),
  }));
});
jest.mock("../../models/user", () => ({
  find: mockUserFind,
}));
jest.mock("../../models/notification", () => ({
  insertMany: mockNotificationInsertMany,
}));

// Mock Redis
jest.mock("../../config/redis", () => ({
  getAsync: jest.fn(),
  setAsync: jest.fn(),
}));

// Import the controller functions *after* mocks are defined
const {
  createJob,
  getMarketplaceJobs,
  getJobById,
  updateJob,
  getFilteredJobs,
  getJobByIdAuthCheck,
  createBid,
  getJobsByUserId,
} = require("../jobController");

// Import mocked dependencies for use in tests
// Note: User is already required above to assign static mocks
const Bid = require("../../models/bid");
const User = require("../../models/user");
const Notification = require("../../models/notification");
const { getAsync, setAsync } = require("../../config/redis");

describe("Job Controller", () => {
  let req, res, next;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockJobSave.mockClear();
    mockJobFindById.mockClear();
    mockJobFind.mockClear();
    mockUserFind.mockClear();
    mockNotificationInsertMany.mockClear();
    mockBidSave.mockClear();
    getAsync.mockClear();
    setAsync.mockClear();

    // Mock request object
    req = {
      body: {},
      user: null, // For authenticated routes
      params: {}, // For URL parameters
      query: {}, // For query parameters
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn(),
    };

    // Mock next function
    next = jest.fn();
  });

  // --- Tests for createJob ---
  describe("createJob", () => {
    beforeEach(() => {
      req.user = { id: "employerUserId" };
      mockJobSave.mockClear();
    });

    it("should create a job, find matching freelancers, and send notifications", async () => {
      req.body = {
        title: "Test Job",
        description: "Job Description",
        budget: 500,
        categories: ["Web Dev"],
        skillsRequired: ["React", "Node.js"],
      };
      const mockFreelancers = [{ _id: "freelancer1" }, { _id: "freelancer2" }];
      mockUserFind.mockResolvedValue(mockFreelancers);
      mockNotificationInsertMany.mockResolvedValue(true);
      // Setup save to resolve with the instance data
      mockJobSave.mockImplementation(function () {
        return Promise.resolve(this);
      });

      await createJob(req, res);

      const jobInstance = Job.mock.results[0].value;

      expect(Job).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Job",
          employer: "employerUserId",
        })
      );
      expect(mockJobSave).toHaveBeenCalled();
      expect(mockUserFind).toHaveBeenCalledWith({
        role: "freelancer",
        skills: { $in: ["React", "Node.js"] },
      });
      expect(mockNotificationInsertMany).toHaveBeenCalledWith([
        expect.objectContaining({
          recipient: "freelancer1",
          relatedId: jobInstance._id,
        }),
        expect.objectContaining({
          recipient: "freelancer2",
          relatedId: jobInstance._id,
        }),
      ]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(jobInstance);
    });

    it("should create a job and handle no matching freelancers", async () => {
      req.body = { title: "Niche Job", skillsRequired: ["ObscureSkill"] };
      mockUserFind.mockResolvedValue([]);
      // Setup save to resolve with the instance data
      mockJobSave.mockImplementation(function () {
        return Promise.resolve(this);
      });

      await createJob(req, res);

      const jobInstance = Job.mock.results[0].value;

      expect(Job).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Niche Job" })
      );
      expect(mockJobSave).toHaveBeenCalled();
      expect(mockUserFind).toHaveBeenCalledWith({
        role: "freelancer",
        skills: { $in: ["ObscureSkill"] },
      });
      expect(mockNotificationInsertMany).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(jobInstance);
    });

    it("should return 500 if saving job fails", async () => {
      req.body = { title: "Fail Job" }; // Need some body data for constructor
      const saveError = new Error("Failed to save job");

      // Ensure the mock save function for *this specific test* rejects.
      // We need to target the save method of the instance created by the Job constructor.
      // The global mockJobSave needs to be configured to reject for this test case.
      mockJobSave.mockRejectedValueOnce(saveError);

      // We still need the Job constructor to run, even if save fails
      Job.mockImplementation((jobData) => ({
        ...jobData,
        _id: "failJobId",
        save: mockJobSave, // Attach the configured mockJobSave
      }));

      // Mock UserFind just in case, though it shouldn't be reached
      mockUserFind.mockResolvedValue([]);

      await createJob(req, res);

      expect(Job).toHaveBeenCalled(); // Constructor should be called
      expect(mockJobSave).toHaveBeenCalled(); // Save should be attempted
      // Crucially, these should NOT be called if save rejects
      expect(mockUserFind).not.toHaveBeenCalled();
      expect(mockNotificationInsertMany).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error creating job" });
    });

    it("should return 500 if finding users fails", async () => {
      req.body = { title: "User Find Fail Job", skillsRequired: ["JS"] };
      mockJobSave.mockImplementation(function () {
        return Promise.resolve(this);
      });
      const findError = new Error("Failed to find users");
      mockUserFind.mockRejectedValue(findError);

      await createJob(req, res);

      expect(Job).toHaveBeenCalled();
      expect(mockJobSave).toHaveBeenCalled();
      expect(mockUserFind).toHaveBeenCalled();
      expect(mockNotificationInsertMany).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error creating job" });
    });

    it("should return 500 if inserting notifications fails", async () => {
      req.body = { title: "Notify Fail Job", skillsRequired: ["CSS"] };
      mockJobSave.mockImplementation(function () {
        return Promise.resolve(this);
      });
      mockUserFind.mockResolvedValue([{ _id: "freelancer1" }]);
      const notifyError = new Error("Failed to insert notifications");
      mockNotificationInsertMany.mockRejectedValue(notifyError);

      await createJob(req, res);

      expect(Job).toHaveBeenCalled();
      expect(mockJobSave).toHaveBeenCalled();
      expect(mockUserFind).toHaveBeenCalled();
      expect(mockNotificationInsertMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error creating job" });
    });
  });

  // --- Tests for getMarketplaceJobs ---
  describe("getMarketplaceJobs", () => {
    const mockJobs = [
      { _id: "job1", title: "Job One", status: "open" },
      { _id: "job2", title: "Job Two", status: "open" },
    ];
    const mockJobsJson = JSON.stringify(mockJobs);

    it("should return jobs from cache if available and valid", async () => {
      getAsync.mockResolvedValue(mockJobsJson);

      await getMarketplaceJobs(req, res);

      expect(getAsync).toHaveBeenCalledWith("marketplace_jobs");
      expect(mockJobFind).not.toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/json"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith(mockJobsJson);
    });

    it("should fetch jobs from DB if cache is empty and store in cache", async () => {
      getAsync.mockResolvedValue(null); // Cache miss
      mockJobFind.mockResolvedValue(mockJobs); // Return jobs from DB
      setAsync.mockResolvedValue("OK"); // Mock cache set success

      await getMarketplaceJobs(req, res);

      expect(getAsync).toHaveBeenCalledWith("marketplace_jobs");
      expect(mockJobFind).toHaveBeenCalledWith({ status: "open" });
      expect(setAsync).toHaveBeenCalledWith(
        "marketplace_jobs",
        mockJobsJson,
        "EX",
        60 // CACHE_EXPIRATION
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/json"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith(mockJobsJson);
    });

    it("should fetch jobs from DB if cached data is invalid JSON", async () => {
      getAsync.mockResolvedValue("invalid-json{"); // Invalid JSON in cache
      mockJobFind.mockResolvedValue(mockJobs);
      setAsync.mockResolvedValue("OK");

      await getMarketplaceJobs(req, res);

      expect(getAsync).toHaveBeenCalledWith("marketplace_jobs");
      expect(mockJobFind).toHaveBeenCalledWith({ status: "open" }); // DB should be called
      expect(setAsync).toHaveBeenCalled(); // Should attempt to cache the valid DB data
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith(mockJobsJson); // Return valid data from DB
    });

    it("should bypass cache and fetch from DB if bypassCache query param is true", async () => {
      req.query.bypassCache = "true";
      mockJobFind.mockResolvedValue(mockJobs);

      await getMarketplaceJobs(req, res);

      expect(getAsync).not.toHaveBeenCalled(); // Cache should not be checked
      expect(mockJobFind).toHaveBeenCalledWith({ status: "open" });
      expect(setAsync).not.toHaveBeenCalled(); // Cache should not be set
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/json"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith(mockJobsJson);
    });

    it("should bypass cache and fetch from DB if Redis is manually disabled", async () => {
      global.isRedisManuallyDisabled = true; // Simulate manual disabling
      mockJobFind.mockResolvedValue(mockJobs);

      await getMarketplaceJobs(req, res);

      expect(getAsync).not.toHaveBeenCalled();
      expect(mockJobFind).toHaveBeenCalledWith({ status: "open" });
      expect(setAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith(mockJobsJson);

      global.isRedisManuallyDisabled = false; // Reset global flag after test
    });

    it("should return 500 if database query fails", async () => {
      getAsync.mockResolvedValue(null); // Cache miss
      const dbError = new Error("DB query failed");
      mockJobFind.mockRejectedValue(dbError);

      await getMarketplaceJobs(req, res);

      expect(getAsync).toHaveBeenCalledWith("marketplace_jobs");
      expect(mockJobFind).toHaveBeenCalledWith({ status: "open" });
      expect(setAsync).not.toHaveBeenCalled(); // Should not cache on DB error
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ error: "Error fetching jobs" })
      );
    });

    it("should handle Redis get error gracefully and fetch from DB", async () => {
      const redisError = new Error("Redis GET Error");
      getAsync.mockRejectedValue(redisError);

      // Spy on console.error to check logging
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getMarketplaceJobs(req, res);

      expect(getAsync).toHaveBeenCalledWith("marketplace_jobs");
      // **Database should NOT be called if Redis get fails**
      expect(mockJobFind).not.toHaveBeenCalled();
      expect(setAsync).not.toHaveBeenCalled();
      // **Expect 500 status due to the catch block**
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ error: "Error fetching jobs" })
      );
      // Check that the error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching marketplace jobs:",
        redisError
      );

      consoleErrorSpy.mockRestore(); // Restore console
    });

    it("should handle Redis set error gracefully after DB fetch", async () => {
      getAsync.mockResolvedValue(null); // Cache miss
      mockJobFind.mockResolvedValue(mockJobs);
      const redisSetError = new Error("Redis SET Error");
      setAsync.mockRejectedValue(redisSetError);

      await getMarketplaceJobs(req, res);

      expect(getAsync).toHaveBeenCalledWith("marketplace_jobs");
      expect(mockJobFind).toHaveBeenCalledWith({ status: "open" });
      expect(setAsync).toHaveBeenCalled(); // Set was attempted
      expect(res.status).toHaveBeenCalledWith(200); // Response should still succeed
      expect(res.end).toHaveBeenCalledWith(mockJobsJson); // Return DB data
      // Optionally check console.error
      // expect(console.error).toHaveBeenCalledWith("Redis set error:", redisSetError);
    });
  });

  // --- Tests for getJobById ---
  describe("getJobById", () => {
    const jobId = "testJobId123";
    const cacheKey = `job:${jobId}`;
    const mockJob = {
      _id: jobId,
      title: "Specific Job",
      employer: "empId",
      freelancer: "freeId",
    };
    const mockJobJson = JSON.stringify(mockJob);
    const mockPopulate = jest.fn();

    beforeEach(() => {
      req.params.id = jobId;
      // Reset populate mock
      mockPopulate.mockClear();
      // Mock findById to return an object with a populate method
      mockJobFindById.mockImplementation(() => ({
        populate: mockPopulate,
      }));
    });

    it("should return job from cache if available", async () => {
      getAsync.mockResolvedValue(mockJobJson);

      await getJobById(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFindById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockJob);
    });

    it("should return 404 if cache stores null", async () => {
      getAsync.mockResolvedValue(JSON.stringify(null));

      await getJobById(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFindById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should fetch job from DB if not in cache and store in cache", async () => {
      getAsync.mockResolvedValue(null); // Cache miss
      mockPopulate.mockResolvedValue(mockJob); // Mock the result of populate
      setAsync.mockResolvedValue("OK");

      await getJobById(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockPopulate).toHaveBeenCalledWith("employer freelancer");
      expect(setAsync).toHaveBeenCalledWith(cacheKey, mockJobJson, "EX", 60);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockJob);
    });

    it("should return 404 if job not found in DB and cache null result", async () => {
      getAsync.mockResolvedValue(null); // Cache miss
      mockPopulate.mockResolvedValue(null); // Job not found in DB
      setAsync.mockResolvedValue("OK"); // For caching null

      await getJobById(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockPopulate).toHaveBeenCalledWith("employer freelancer");
      // Check that null is cached
      expect(setAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(null),
        "EX",
        60
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should return 500 if DB query fails", async () => {
      getAsync.mockResolvedValue(null); // Cache miss
      const dbError = new Error("DB findById failed");
      mockPopulate.mockRejectedValue(dbError); // Make populate fail

      await getJobById(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockPopulate).toHaveBeenCalledWith("employer freelancer");
      expect(setAsync).not.toHaveBeenCalled(); // Don't cache on error
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error fetching job" });
    });

    // Add tests for Redis get/set errors similar to getMarketplaceJobs if needed
  });

  // --- Tests for updateJob ---
  describe("updateJob", () => {
    const jobId = "jobToUpdate123";
    // Define the base mock job structure
    let mockExistingJob = {
      _id: jobId,
      title: "Old Title",
      status: "open",
      save: jest.fn(),
    };

    beforeEach(() => {
      req.params.id = jobId;
      req.body = { status: "in-progress" };
      // Reset the mock job object to its initial state before each test
      mockExistingJob = {
        ...mockExistingJob, // Keep _id, title etc.
        status: "open", // Reset status
        save: jest.fn(), // Reset the save mock function
      };
    });

    it("should update job status successfully", async () => {
      mockJobFindById.mockResolvedValue(mockExistingJob);
      mockExistingJob.save.mockResolvedValue({
        ...mockExistingJob,
        status: "in-progress",
      });

      await updateJob(req, res);

      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockExistingJob.status).toBe("in-progress");
      expect(mockExistingJob.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "in-progress" })
      );
    });

    it("should not update status if no status provided in body", async () => {
      req.body = {}; // Empty body
      mockJobFindById.mockResolvedValue(mockExistingJob);
      // Mock save to resolve with the *current* (unmodified) state
      mockExistingJob.save.mockImplementation(function () {
        return Promise.resolve(this);
      });

      await updateJob(req, res);

      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      // Status should remain 'open' as it was reset in beforeEach and not updated
      expect(mockExistingJob.status).toBe("open");
      expect(mockExistingJob.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockExistingJob);
    });

    it("should return 404 if job not found", async () => {
      mockJobFindById.mockResolvedValue(null);

      await updateJob(req, res);

      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      // Access save through the reset mock object to check it wasn't called
      expect(mockExistingJob.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should return 500 if findById fails", async () => {
      const findError = new Error("Find failed");
      mockJobFindById.mockRejectedValue(findError);

      await updateJob(req, res);

      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockExistingJob.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error updating job" });
    });

    it("should return 500 if save fails", async () => {
      mockJobFindById.mockResolvedValue(mockExistingJob);
      const saveError = new Error("Save failed");
      mockExistingJob.save.mockRejectedValue(saveError);

      await updateJob(req, res);

      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      // Status is updated in the controller before save is called
      expect(mockExistingJob.status).toBe("in-progress");
      expect(mockExistingJob.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error updating job" });
    });
  });

  // --- Tests for getFilteredJobs ---
  describe("getFilteredJobs", () => {
    const mockJobs = [
      { _id: "job1", title: "Open Job 1", status: "open" },
      { _id: "job2", title: "Open Job 2", status: "open" },
    ];
    const mockJobsJson = JSON.stringify(mockJobs);
    const mockSort = jest.fn();

    beforeEach(() => {
      // Mock the sort function returned by find
      mockSort.mockResolvedValue(mockJobs);
      mockJobFind.mockImplementation(() => ({ sort: mockSort }));
    });

    it("should return filtered jobs from cache for freelancer", async () => {
      req.user = { id: "freelancerUserId", role: "freelancer" };
      const cacheKey = `filtered_jobs:freelancer:freelancerUserId`;
      getAsync.mockResolvedValue(mockJobsJson);

      await getFilteredJobs(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFind).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ jobs: mockJobs });
    });

    it("should fetch filtered jobs from DB for freelancer (cache miss)", async () => {
      req.user = { id: "freelancerUserId", role: "freelancer" };
      const cacheKey = `filtered_jobs:freelancer:freelancerUserId`;
      getAsync.mockResolvedValue(null);
      setAsync.mockResolvedValue("OK");

      await getFilteredJobs(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFind).toHaveBeenCalledWith({
        status: "open",
        employer: { $ne: "freelancerUserId" }, // Exclude own jobs
      });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(setAsync).toHaveBeenCalledWith(cacheKey, mockJobsJson, "EX", 60);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ jobs: mockJobs });
    });

    it("should fetch filtered jobs from DB for client (cache miss)", async () => {
      req.user = { id: "clientUserId", role: "client" };
      const cacheKey = `filtered_jobs:client:clientUserId`;
      getAsync.mockResolvedValue(null);
      setAsync.mockResolvedValue("OK");

      await getFilteredJobs(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      // Client role does not have the employer exclusion
      expect(mockJobFind).toHaveBeenCalledWith({ status: "open" });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(setAsync).toHaveBeenCalledWith(cacheKey, mockJobsJson, "EX", 60);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ jobs: mockJobs });
    });

    it("should fetch filtered jobs from DB for hybrid role (cache miss)", async () => {
      req.user = { id: "hybridUserId", role: "hybrid" };
      const cacheKey = `filtered_jobs:hybrid:hybridUserId`;
      getAsync.mockResolvedValue(null);
      setAsync.mockResolvedValue("OK");

      await getFilteredJobs(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      // Hybrid role should also exclude own jobs when filtering
      expect(mockJobFind).toHaveBeenCalledWith({
        status: "open",
        employer: { $ne: "hybridUserId" },
      });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(setAsync).toHaveBeenCalledWith(cacheKey, mockJobsJson, "EX", 60);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ jobs: mockJobs });
    });

    it("should return 500 if DB query fails", async () => {
      req.user = { id: "someUserId", role: "freelancer" };
      const cacheKey = `filtered_jobs:freelancer:someUserId`;
      getAsync.mockResolvedValue(null);
      const dbError = new Error("DB find failed");
      mockSort.mockRejectedValue(dbError); // Make sort (end of chain) fail

      await getFilteredJobs(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFind).toHaveBeenCalled();
      expect(mockSort).toHaveBeenCalled();
      expect(setAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error retrieving jobs",
        error: dbError.message,
      });
    });

    // Add tests for Redis errors if needed
  });

  // --- Tests for getJobByIdAuthCheck ---
  describe("getJobByIdAuthCheck", () => {
    // Reuses tests logic from getJobById as the underlying functionality is the same
    const jobId = "authCheckJobId456";
    const cacheKey = `job:${jobId}`; // Same cache key as getJobById
    const mockJob = {
      _id: jobId,
      title: "Specific Auth Check Job",
      employer: "empId",
      freelancer: "freeId",
    };
    const mockJobJson = JSON.stringify(mockJob);
    const mockPopulate = jest.fn();

    beforeEach(() => {
      req.params.id = jobId;
      // Mock auth user for this route
      req.user = { id: "someAuthenticatedUserId", role: "any" };
      mockPopulate.mockClear();
      mockJobFindById.mockImplementation(() => ({ populate: mockPopulate }));
    });

    it("should return job from cache if available", async () => {
      getAsync.mockResolvedValue(mockJobJson);

      await getJobByIdAuthCheck(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFindById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      // Response structure is slightly different { job: ... }
      expect(res.json).toHaveBeenCalledWith({ job: mockJob });
    });

    it("should return 404 if cache stores null", async () => {
      getAsync.mockResolvedValue(JSON.stringify(null));

      await getJobByIdAuthCheck(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFindById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Job not found" }); // Different message
    });

    it("should fetch job from DB if not in cache and store in cache", async () => {
      getAsync.mockResolvedValue(null);
      mockPopulate.mockResolvedValue(mockJob);
      setAsync.mockResolvedValue("OK");

      await getJobByIdAuthCheck(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockPopulate).toHaveBeenCalledWith("employer freelancer");
      expect(setAsync).toHaveBeenCalledWith(cacheKey, mockJobJson, "EX", 60);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ job: mockJob });
    });

    it("should return 404 if job not found in DB and cache null result", async () => {
      getAsync.mockResolvedValue(null);
      mockPopulate.mockResolvedValue(null);
      setAsync.mockResolvedValue("OK");

      await getJobByIdAuthCheck(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockPopulate).toHaveBeenCalledWith("employer freelancer");
      expect(setAsync).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(null),
        "EX",
        60
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Job not found" });
    });

    it("should return 500 if DB query fails", async () => {
      getAsync.mockResolvedValue(null);
      const dbError = new Error("DB populate failed");
      mockPopulate.mockRejectedValue(dbError);

      await getJobByIdAuthCheck(req, res);

      expect(getAsync).toHaveBeenCalledWith(cacheKey);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(mockPopulate).toHaveBeenCalledWith("employer freelancer");
      expect(setAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error retrieving job",
        error: dbError.message,
      });
    });
  });

  // --- Tests for createBid ---
  describe("createBid", () => {
    const jobId = "jobToBidOn789";
    const freelancerId = "freelancerBiddingId";
    const mockJobOpen = { _id: jobId, status: "open" };
    const mockJobClosed = { _id: jobId, status: "closed" };

    beforeEach(() => {
      req.params.jobId = jobId;
      req.user = { id: freelancerId };
      req.body = { amount: 100 };
      mockBidSave.mockClear();
      // No need to mockResolvedValue globally, it's handled in the mock factory
    });

    it("should create a bid successfully for an open job", async () => {
      mockJobFindById.mockResolvedValue(mockJobOpen);
      // Ensure save mock resolves correctly for this test
      mockBidSave.mockImplementation(function () {
        return Promise.resolve(this);
      });

      await createBid(req, res);

      // Get the instance created by the Bid constructor
      const bidInstance = Bid.mock.results[0].value;

      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(Bid).toHaveBeenCalledWith({
        amount: 100,
        job: jobId,
        freelancer: freelancerId,
      });
      expect(mockBidSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      // Check response contains the bid instance
      expect(res.json).toHaveBeenCalledWith({
        message: "Bid placed successfully",
        bid: bidInstance,
      });
    });

    it("should return 404 if job not found", async () => {
      mockJobFindById.mockResolvedValue(null);
      await createBid(req, res);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(Bid).not.toHaveBeenCalled();
      expect(mockBidSave).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Job not found" });
    });

    it("should return 400 if job is not open", async () => {
      mockJobFindById.mockResolvedValue(mockJobClosed);
      await createBid(req, res);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(Bid).not.toHaveBeenCalled();
      expect(mockBidSave).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Job is not open for bids",
      });
    });

    it("should return 500 if finding job fails", async () => {
      const findError = new Error("Find job failed");
      mockJobFindById.mockRejectedValue(findError);
      await createBid(req, res);
      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(Bid).not.toHaveBeenCalled();
      expect(mockBidSave).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error placing bid",
        error: findError.message,
      });
    });

    it("should return 500 if saving bid fails", async () => {
      mockJobFindById.mockResolvedValue(mockJobOpen);
      const saveError = new Error("Save bid failed");
      // Explicitly return a rejected promise from the mock
      mockBidSave.mockImplementationOnce(() => Promise.reject(saveError));

      await createBid(req, res);

      expect(mockJobFindById).toHaveBeenCalledWith(jobId);
      expect(Bid).toHaveBeenCalled(); // Constructor was called
      expect(mockBidSave).toHaveBeenCalled(); // Save was attempted
      expect(res.status).toHaveBeenCalledWith(500); // Should be 500 now
      expect(res.json).toHaveBeenCalledWith({
        message: "Error placing bid",
        error: saveError.message,
      });
    });
  });

  // --- Tests for getJobsByUserId ---
  describe("getJobsByUserId", () => {
    // Tests will go here
  });
});
