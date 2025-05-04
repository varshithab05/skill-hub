// Define mock functions first
const mockUserSave = jest.fn();
const mockUserFindOne = jest.fn();
const mockUserFindById = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();

// Mock dependencies *before* importing the controller
jest.mock("../../models/user", () => {
  const MockUser = jest.fn().mockImplementation(() => ({
    save: mockUserSave,
  }));
  MockUser.findOne = mockUserFindOne;
  MockUser.findById = mockUserFindById;
  MockUser.findByIdAndUpdate = mockUserFindByIdAndUpdate;
  return MockUser;
});
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../config/redis", () => ({
  getAsync: jest.fn(),
  setAsync: jest.fn(),
}));

// Now import the controller functions
const {
  registerUser,
  loginUser,
  getUserDetails,
} = require("../userController");

// Import the mocked dependencies for use in tests
const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getAsync, setAsync } = require("../../config/redis");

describe("User Controller", () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockUserSave.mockClear();
    mockUserFindOne.mockClear();
    mockUserFindById.mockClear();
    mockUserFindByIdAndUpdate.mockClear();

    // Mock request object
    req = {
      body: {},
      user: null,
      params: {},
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock next function
    next = jest.fn();
  });

  // --- Tests for registerUser ---
  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      req.body = {
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "freelancer",
      };
      mockUserFindOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword123");
      const createdUserInstance = {
        _id: "mockUserId",
        role: "freelancer",
        username: "testuser",
      };
      User.mockImplementation(() => ({
        save: mockUserSave.mockResolvedValue(createdUserInstance),
        ...createdUserInstance,
      }));
      jwt.sign.mockReturnValue("mockToken123");
      await registerUser(req, res);
      expect(mockUserFindOne).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(User).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          password: "hashedPassword123",
        })
      );
      expect(mockUserSave).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "mockUserId", role: "freelancer" },
        "skill_hub_secret_key",
        { expiresIn: "24h" }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: "mockToken123",
        role: "freelancer",
        username: "testuser",
      });
    });
    it("should return 400 if user already exists", async () => {
      req.body = { email: "existing@example.com" };
      mockUserFindOne.mockResolvedValue({ email: "existing@example.com" });
      await registerUser(req, res);
      expect(mockUserFindOne).toHaveBeenCalledWith({
        email: "existing@example.com",
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User already exists",
      });
    });
    it("should return 500 if database error occurs", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      const dbError = new Error("Database failed");
      mockUserFindOne.mockRejectedValue(dbError);
      await registerUser(req, res);
      expect(mockUserFindOne).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error registering user",
        error: dbError,
      });
    });
  });

  // --- Tests for loginUser ---
  describe("loginUser", () => {
    it("should login a user successfully with email", async () => {
      req.body = {
        usernameOrEmail: "test@example.com",
        password: "password123",
      };
      const mockUser = {
        _id: "mockUserId",
        username: "testuser",
        email: "test@example.com",
        password: "hashedPassword123",
        role: "freelancer",
      };
      mockUserFindOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockLoginToken123");
      await loginUser(req, res);
      expect(mockUserFindOne).toHaveBeenCalledWith({
        $or: [{ email: "test@example.com" }, { username: "test@example.com" }],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword123"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "mockUserId", role: "freelancer" },
        "skill_hub_secret_key",
        { expiresIn: "24h" }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: "mockLoginToken123",
        role: "freelancer",
        username: "testuser",
      });
    });
    it("should login a user successfully with username", async () => {
      req.body = { usernameOrEmail: "testuser", password: "password123" };
      const mockUser = {
        _id: "mockUserId",
        username: "testuser",
        email: "test@example.com",
        password: "hashedPassword123",
        role: "client",
      };
      mockUserFindOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockLoginToken456");
      await loginUser(req, res);
      expect(mockUserFindOne).toHaveBeenCalledWith({
        $or: [{ email: "testuser" }, { username: "testuser" }],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword123"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "mockUserId", role: "client" },
        "skill_hub_secret_key",
        { expiresIn: "24h" }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: "mockLoginToken456",
        role: "client",
        username: "testuser",
      });
    });
    it("should return 404 if user not found", async () => {
      req.body = {
        usernameOrEmail: "notfound@example.com",
        password: "password123",
      };
      mockUserFindOne.mockResolvedValue(null);
      await loginUser(req, res);
      expect(mockUserFindOne).toHaveBeenCalledWith({
        $or: [
          { email: "notfound@example.com" },
          { username: "notfound@example.com" },
        ],
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });
    it("should return 400 if passwords do not match", async () => {
      req.body = {
        usernameOrEmail: "test@example.com",
        password: "wrongPassword",
      };
      const mockUser = { _id: "mockUserId", password: "hashedPassword123" };
      mockUserFindOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      await loginUser(req, res);
      expect(mockUserFindOne).toHaveBeenCalledWith({
        $or: [{ email: "test@example.com" }, { username: "test@example.com" }],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrongPassword",
        "hashedPassword123"
      );
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });
    it("should return 500 if database error occurs during findOne", async () => {
      req.body = {
        usernameOrEmail: "test@example.com",
        password: "password123",
      };
      const dbError = new Error("DB Find Failed");
      mockUserFindOne.mockRejectedValue(dbError);
      await loginUser(req, res);
      expect(mockUserFindOne).toHaveBeenCalledWith({
        $or: [{ email: "test@example.com" }, { username: "test@example.com" }],
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error logging in",
        error: dbError,
      });
    });
    it("should return 500 if bcrypt.compare fails", async () => {
      req.body = {
        usernameOrEmail: "test@example.com",
        password: "password123",
      };
      const mockUser = { _id: "mockUserId", password: "hashedPassword123" };
      mockUserFindOne.mockResolvedValue(mockUser);
      const bcryptError = new Error("Bcrypt Failed");
      bcrypt.compare.mockRejectedValue(bcryptError);
      await loginUser(req, res);
      expect(mockUserFindOne).toHaveBeenCalledWith({
        $or: [{ email: "test@example.com" }, { username: "test@example.com" }],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword123"
      );
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error logging in",
        error: bcryptError,
      });
    });
  });

  // --- Tests for getUserDetails ---
  describe("getUserDetails", () => {
    beforeEach(() => {
      getAsync.mockClear();
      setAsync.mockClear();
      mockUserFindById.mockClear();
      req.user = { id: "authenticatedUserId" };
    });

    it("should return user details from cache if available", async () => {
      const cachedUser = {
        _id: "authenticatedUserId",
        name: "Cached User",
        email: "cached@example.com",
      };
      getAsync.mockResolvedValue(JSON.stringify(cachedUser));
      await getUserDetails(req, res);
      expect(getAsync).toHaveBeenCalledWith("user_profile:authenticatedUserId");
      expect(mockUserFindById).not.toHaveBeenCalled();
      expect(setAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: cachedUser,
      });
    });

    it("should fetch user details from DB if not in cache and store in cache", async () => {
      const dbUser = {
        _id: "authenticatedUserId",
        name: "DB User",
        email: "db@example.com",
      };
      getAsync.mockResolvedValue(null);
      const mockSelect = jest.fn().mockResolvedValue(dbUser);
      mockUserFindById.mockImplementation(() => ({
        select: mockSelect,
      }));
      setAsync.mockResolvedValue("OK");

      await getUserDetails(req, res);

      expect(getAsync).toHaveBeenCalledWith("user_profile:authenticatedUserId");
      expect(mockUserFindById).toHaveBeenCalledWith("authenticatedUserId");
      expect(mockSelect).toHaveBeenCalledWith("-password");
      expect(setAsync).toHaveBeenCalledWith(
        "user_profile:authenticatedUserId",
        JSON.stringify(dbUser),
        "EX",
        60
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, user: dbUser });
    });

    it("should return 404 if user not found in DB", async () => {
      getAsync.mockResolvedValue(null);
      const mockSelect = jest.fn().mockResolvedValue(null);
      mockUserFindById.mockImplementation(() => ({
        select: mockSelect,
      }));

      await getUserDetails(req, res);

      expect(getAsync).toHaveBeenCalledWith("user_profile:authenticatedUserId");
      expect(mockUserFindById).toHaveBeenCalledWith("authenticatedUserId");
      expect(mockSelect).toHaveBeenCalledWith("-password");
      expect(setAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("should handle Redis get error gracefully", async () => {
      const redisError = new Error("Redis GET failed");
      getAsync.mockRejectedValue(redisError);

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getUserDetails(req, res);

      expect(getAsync).toHaveBeenCalledWith("user_profile:authenticatedUserId");
      expect(mockUserFindById).not.toHaveBeenCalled();
      expect(setAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error fetching user profile",
        error: redisError.message,
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching user profile:",
        redisError
      );

      consoleErrorSpy.mockRestore();
    });

    it("should handle Redis set error gracefully", async () => {
      getAsync.mockResolvedValue(null);
      const dbUser = { _id: "authenticatedUserId", name: "DB User" };
      const mockSelect = jest.fn().mockResolvedValue(dbUser);
      mockUserFindById.mockImplementation(() => ({
        select: mockSelect,
      }));
      const redisSetError = new Error("Redis SET failed");
      setAsync.mockRejectedValue(redisSetError);

      await getUserDetails(req, res);

      expect(getAsync).toHaveBeenCalledWith("user_profile:authenticatedUserId");
      expect(mockUserFindById).toHaveBeenCalledWith("authenticatedUserId");
      expect(mockSelect).toHaveBeenCalledWith("-password");
      expect(setAsync).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, user: dbUser });
    });

    it("should return 500 if DB error occurs", async () => {
      getAsync.mockResolvedValue(null);
      const dbError = new Error("DB FindById Failed");
      const mockSelect = jest.fn().mockRejectedValue(dbError);
      mockUserFindById.mockImplementation(() => ({
        select: mockSelect,
      }));

      await getUserDetails(req, res);

      expect(getAsync).toHaveBeenCalledWith("user_profile:authenticatedUserId");
      expect(mockUserFindById).toHaveBeenCalledWith("authenticatedUserId");
      expect(mockSelect).toHaveBeenCalledWith("-password");
      expect(setAsync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error fetching user profile",
        error: dbError.message,
      });
    });
  });

  // --- Tests for updateUserProfile ---
  // describe('updateUserProfile', () => { ... });

  // --- Tests for uploadProfilePic ---
  // describe('uploadProfilePic', () => { ... });

  // --- Tests for getUserProfile ---
  // describe('getUserProfile', () => { ... });

  // --- Tests for getAllUsers ---
  // describe('getAllUsers', () => { ... });

  // --- Tests for deleteUser ---
  // describe('deleteUser', () => { ... });
});
