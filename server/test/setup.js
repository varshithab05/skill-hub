const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

// Set the Node environment to test
process.env.NODE_ENV = "test";

// Disable the actual server connection in tests
const originalConnect = mongoose.connect;
let mongoServer;

// Mock console methods to reduce noise during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Set up MongoDB memory server before all tests
beforeAll(async () => {
  // Mock console methods
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();

  try {
    // Close any existing connections (should ideally not happen, but safety check)
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Create a new in-memory server
    console.log = originalConsoleLog; // Temporarily restore log for server startup messages
    console.error = originalConsoleError;
    mongoServer = await MongoMemoryServer.create();
    console.log = jest.fn(); // Re-mock log
    console.error = jest.fn();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      // useNewUrlParser and useUnifiedTopology are deprecated and default to true
      // No options needed usually unless specific ones required
    });

    // Restore original console.log only after successful setup
    console.log = originalConsoleLog;
  } catch (error) {
    // Log the error and re-throw to fail tests quickly
    console.error = originalConsoleError; // Restore error log to see the actual problem
    console.error("Error during MongoDB Memory Server setup:", error);
    // Restore other logs if needed
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    throw error; // Ensure Jest knows the setup failed
  }
});

// Clear all test data after each test
afterEach(async () => {
  console.log = jest.fn();
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
  console.log = originalConsoleLog;
});

// Stop MongoDB and close connection
afterAll(async () => {
  // Restore console methods early to see teardown errors if any
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;

  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  } catch (error) {
    console.error("Error closing Mongoose connection:", error);
  }

  try {
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error("Error stopping MongoDB Memory Server:", error);
  }

  // *** ADD REDIS CLIENT QUIT ***
  try {
    // Attempt to quit redis client if it exists and has a quit method
    // This handles cases where the real client might have been initialized
    const redis = require("../config/redis"); // Get the client instance
    if (redis.redisClient && typeof redis.redisClient.quit === "function") {
      await redis.redisClient.quit();
      console.log("Redis client closed.");
    }
  } catch (error) {
    console.error("Error closing Redis client:", error);
  }
  // *** END REDIS CLIENT QUIT ***

  // Clear mocks if any were set globally for mongoose/redis etc. if applicable
}, 30000); // Keep timeout for teardown
