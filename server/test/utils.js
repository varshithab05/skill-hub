const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");

/**
 * Create a test user with optional role and return the user object with auth token
 * @param {Object} overrides - Override default user properties
 * @returns {Object} User object and auth token
 */
const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    name: "Test User",
    username: `testuser${Math.floor(Math.random() * 10000)}`,
    email: `test-${Math.floor(Math.random() * 10000)}@example.com`,
    password: "Password123!",
    role: "freelancer",
    skills: ["JavaScript", "React"],
    ...overrides,
  };

  const user = await User.create(defaultUser);
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "testsecret",
    { expiresIn: "1d" }
  );

  return {
    user: user.toObject(),
    token,
  };
};

/**
 * Generate a random MongoDB ObjectId
 * @returns {String} MongoDB ObjectId string
 */
const generateObjectId = () => {
  return new mongoose.Types.ObjectId().toString();
};

module.exports = {
  createTestUser,
  generateObjectId,
};
