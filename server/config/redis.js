const redis = require("redis");
const util = require("util");
const { EventEmitter } = require("events");

// Connection promise to track Redis connection state
let redisReadyPromise;

// Check if Redis is installed and available
let redisClient;
let redisEnabled = false;

try {
  // *** ADD CHECK FOR TEST ENVIRONMENT ***
  if (process.env.NODE_ENV === "test") {
    console.log("Skipping Redis initialization in test environment.");
    redisEnabled = false;
    redisReadyPromise = Promise.resolve(false);
    // Create dummy client immediately
    redisClient = {
      get: () => Promise.resolve(null),
      set: () => Promise.resolve("OK"),
      setex: () => Promise.resolve("OK"),
      del: () => Promise.resolve(0),
      exists: () => Promise.resolve(0),
      expire: () => Promise.resolve(1),
      flushall: () => Promise.resolve("OK"),
      info: () => Promise.resolve(""),
      dbsize: () => Promise.resolve(0),
      pipeline: () => ({ del: () => ({}), exec: () => Promise.resolve([]) }),
      connect: () => Promise.resolve(),
      quit: () => Promise.resolve(),
      scanStream: () => {
        // Create a dummy event emitter that emits no data and ends immediately
        const emitter = new EventEmitter();
        setTimeout(() => {
          emitter.emit("data", []);
          emitter.emit("end");
        }, 0);
        return emitter;
      },
      on: () => {}, // Add dummy 'on' to prevent errors if called
      removeAllListeners: () => {}, // Add dummy removeAllListeners
    };
    // Throw a dummy error to bypass the rest of the try block cleanly
    // (This is a simple way to exit the try block early)
    throw new Error("TEST_ENV_SKIP");
  }
  // *** END CHECK ***

  console.log("Initializing Redis client...");

  // Determine connection options
  const redisConnectionOptions = process.env.REDIS_URL
    ? { url: process.env.REDIS_URL }
    : {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
      };

  // Create Redis client with determined options and common retry strategy
  redisClient = redis.createClient({
    ...redisConnectionOptions, // Spread the connection options (either URL or host/port)
    retry_strategy: (options) => {
      if (options.error) {
        if (options.error.code === "ECONNREFUSED") {
          console.error("Redis connection refused. Retrying in 5 seconds...");
          return 5000;
        }
        return new Error("Redis connection error");
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        return new Error("Redis retry time exhausted");
      }
      return Math.min(options.attempt * 100, 3000);
    },
  });

  // Use a promise to track connection readiness
  redisReadyPromise = new Promise((resolve) => {
    // The 'ready' event is emitted when Redis is fully connected and ready
    redisClient.on("ready", () => {
      console.log("Redis client ready and fully connected");
      redisEnabled = true;
      resolve(true);
    });
  });

  // Handle Redis events
  redisClient.on("connect", () => {
    console.log("Redis client connected");
    // Note: 'connect' fires before 'ready', so we don't set redisEnabled=true here
  });

  redisClient.on("error", (err) => {
    console.error("Redis client error:", err);
    redisEnabled = false;
  });

  // Check connection state after a timeout to avoid hanging the server
  setTimeout(() => {
    if (!redisEnabled) {
      console.warn(
        "Redis not ready after timeout - operations will use fallbacks"
      );
    }
  }, 5000);
} catch (error) {
  // Catch the dummy error specifically, otherwise handle real errors
  if (error.message !== "TEST_ENV_SKIP") {
    console.error("Failed to initialize Redis client:", error);
    // Ensure dummy client is created on real errors too
    if (!redisClient) {
      redisReadyPromise = Promise.resolve(false);
      redisClient = {
        get: () => Promise.resolve(null),
        set: () => Promise.resolve("OK"),
        setex: () => Promise.resolve("OK"),
        del: () => Promise.resolve(0),
        exists: () => Promise.resolve(0),
        expire: () => Promise.resolve(1),
        flushall: () => Promise.resolve("OK"),
        info: () => Promise.resolve(""),
        dbsize: () => Promise.resolve(0),
        pipeline: () => ({
          del: () => ({}),
          exec: () => Promise.resolve([]),
        }),
        connect: () => Promise.resolve(),
        quit: () => Promise.resolve(),
        scanStream: () => {
          // Create a dummy event emitter that emits no data and ends immediately
          const emitter = new EventEmitter();
          setTimeout(() => {
            emitter.emit("data", []);
            emitter.emit("end");
          }, 0);
          return emitter;
        },
        on: () => {}, // Add dummy 'on' to prevent errors if called
        removeAllListeners: () => {}, // Add dummy removeAllListeners
      };
    }
  }
  // If it was the TEST_ENV_SKIP error, we've already set up the dummy client.
}

// Wait for Redis connection before continuing
// This can be awaited when the server starts
const waitForRedis = async (timeout = 5000) => {
  try {
    // Use Promise.race to avoid hanging if Redis never connects
    const result = await Promise.race([
      redisReadyPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis connection timeout")), timeout)
      ),
    ]);
    return result;
  } catch (error) {
    console.warn("Redis connection timed out or failed:", error.message);
    return false;
  }
};

// Simple wrapper functions that will work whether Redis is available or not
const getAsync = async (key) => {
  if (global.isRedisManuallyDisabled) {
    return null;
  }
  if (!redisEnabled) {
    return null; // Return null directly
  }
  try {
    // Promisify the get call for this specific operation to get actual data
    const getValuePromise = new Promise((resolve, reject) => {
      redisClient.get(key, (err, reply) => {
        if (err) reject(err);
        else resolve(reply);
      });
    });

    return await getValuePromise;
  } catch (err) {
    console.error(`Redis get error for key ${key}:`, err);
    redisEnabled = false; // Consider disabling on error
    return null;
  }
};

const setAsync = async (key, value, flag, expiry) => {
  if (global.isRedisManuallyDisabled) {
    return "OK";
  }
  if (!redisEnabled) return "OK"; // Return "OK" directly
  try {
    if (flag === "EX" && expiry) {
      // For Redis v3.1.2, we need to use setex and promisify to handle callbacks
      const setExPromise = new Promise((resolve, reject) => {
        redisClient.setex(key, expiry, value, (err, reply) => {
          if (err) reject(err);
          else resolve(reply === true ? "OK" : reply);
        });
      });
      return await setExPromise;
    } else {
      // Basic set without expiry
      const setPromise = new Promise((resolve, reject) => {
        redisClient.set(key, value, (err, reply) => {
          if (err) reject(err);
          else resolve(reply === true ? "OK" : reply);
        });
      });
      return await setPromise;
    }
  } catch (err) {
    console.error(`Redis set error for key ${key}:`, err);
    redisEnabled = false; // Consider disabling on error
    return null; // Indicate failure
  }
};

const delAsync = async (key) => {
  if (global.isRedisManuallyDisabled) {
    return 0;
  }
  if (!redisEnabled) return 0; // Return 0 directly
  try {
    return await redisClient.del(key);
  } catch (err) {
    console.error(`Redis del error for key ${key}:`, err);
    redisEnabled = false; // Consider disabling on error
    return 0;
  }
};

const existsAsync = async (key) => {
  if (global.isRedisManuallyDisabled) {
    return 0;
  }
  if (!redisEnabled) return 0; // Return 0 directly
  try {
    return await redisClient.exists(key);
  } catch (err) {
    console.error(`Redis exists error for key ${key}:`, err);
    redisEnabled = false; // Consider disabling on error
    return 0;
  }
};

const flushallAsync = async () => {
  if (global.isRedisManuallyDisabled) {
    return "OK";
  }
  if (!redisEnabled) {
    return "OK"; // Return OK as per dummy client behavior
  }
  try {
    const result = await redisClient.flushall();
    return result; // Return the actual result
  } catch (err) {
    console.error("Redis flushall error:", err);
    redisEnabled = false;
    return null;
  }
};

const infoAsync = async () => {
  if (global.isRedisManuallyDisabled) {
    return "";
  }
  if (!redisEnabled) return "";
  try {
    return await redisClient.info();
  } catch (err) {
    console.error("Redis info error:", err);
    redisEnabled = false;
    return "";
  }
};

const dbsizeAsync = async () => {
  if (global.isRedisManuallyDisabled) {
    return 0;
  }
  if (!redisEnabled) return 0;
  try {
    return await redisClient.dbSize();
  } catch (err) {
    console.error("Redis dbsize error:", err);
    redisEnabled = false;
    return 0;
  }
};

module.exports = {
  redisClient,
  redisEnabled,
  waitForRedis,
  getAsync,
  setAsync,
  delAsync,
  existsAsync,
  flushallAsync,
  infoAsync,
  dbsizeAsync,
  // Default cache expiry in seconds
  DEFAULT_EXPIRY: 3600, // 1 hour
};
