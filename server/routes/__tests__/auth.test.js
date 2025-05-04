const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../../index"); // Using destructuring to get app from index.js
const User = require("../../models/user");

// Simple test user creation helper function
const createTestUser = async (overrides = {}) => {
  const userData = {
    name: "Test User",
    username: "testuser",
    email: "test-auth@example.com",
    password: "Password123!",
    role: "freelancer",
    ...overrides,
  };

  const user = await User.create(userData);

  // Create a token if the JWT functions exist
  const jwt = require("jsonwebtoken");
  const token = jwt.sign(
    { id: user._id, role: user.role },
    "skill_hub_secret_key",
    { expiresIn: "1h" }
  );

  return { user, token };
};

describe("Auth API Routes", () => {
  describe("POST /user/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "New User",
        username: "newuser",
        email: "new-user@example.com",
        password: "Password123!",
        role: "freelancer",
      };

      const response = await request(app).post("/user/register").send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("username", userData.username);
      expect(response.body).toHaveProperty("role", userData.role);
    });

    it("should not register user with existing email", async () => {
      // Create a user first
      const { user } = await createTestUser();

      // Try to register with the same email
      const response = await request(app).post("/user/register").send({
        name: "Another User",
        username: "anotheruser",
        email: user.email, // Same email
        password: "Password456!",
        role: "freelancer",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("already exists");
    });

    it("should not register user with invalid data", async () => {
      // We'll skip detailed validation for now, just check server handles it
      const response = await request(app).post("/user/register").send({
        // Missing required fields
        name: "Invalid User",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("POST /user/login", () => {
    it("should login user with valid credentials", async () => {
      const password = "Password123!";
      const { user } = await createTestUser({
        username: "loginuser",
        email: "login-test@example.com",
        password: await require("bcryptjs").hash(password, 10),
      });

      const response = await request(app).post("/user/login").send({
        usernameOrEmail: user.email,
        password,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("username", user.username);
    });

    it("should not login with invalid email", async () => {
      const response = await request(app).post("/user/login").send({
        usernameOrEmail: "nonexistent@example.com",
        password: "Password123!",
      });

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should not login with invalid password", async () => {
      const { user } = await createTestUser({
        username: "wrongpassuser",
        email: "wrongpass-test@example.com",
        password: await require("bcryptjs").hash("CorrectPass123", 10),
      });

      const response = await request(app).post("/user/login").send({
        usernameOrEmail: user.email,
        password: "WrongPassword123!",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("GET /user/profile", () => {
    it("should get current user profile with valid token", async () => {
      const { user, token } = await createTestUser({
        username: "profileuser",
        email: "profile-test@example.com",
      });

      const response = await request(app)
        .get("/user/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.user).toHaveProperty("_id", user._id.toString());
      expect(response.body.user).toHaveProperty("name", user.name);
      expect(response.body.user).toHaveProperty("email", user.email);
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get("/user/profile")
        .set("Authorization", "Bearer invalidtoken");

      expect(response.statusCode).toBe(401);
    });

    it("should reject request with no token", async () => {
      const response = await request(app).get("/user/profile");

      // The API returns 403 when no token is provided
      expect(response.statusCode).toBe(403);
    });
  });
});
