const { redisClient, delAsync, redisEnabled } = require("../config/redis");

/**
 * Invalidate all cache entries for a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} - Number of keys removed
 */
const invalidateUserCache = async (userId) => {
  if (!redisEnabled) {
    return Promise.resolve(0);
  }

  return new Promise((resolve, reject) => {
    const pattern = `api:${userId}:*`;
    try {
      const stream = redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      let deletedCount = 0;

      stream.on("data", async (keys) => {
        if (keys.length > 0) {
          const pipeline = redisClient.pipeline();
          keys.forEach((key) => {
            pipeline.del(key);
            deletedCount++;
          });
          await pipeline.exec();
        }
      });

      stream.on("end", () => {
        resolve(deletedCount);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      console.error("Error in invalidateUserCache:", error.message);
      resolve(0); // Resolve with 0 to prevent app crash
    }
  });
};

/**
 * Invalidate cache for a specific resource
 * @param {string} resourceType - Type of resource (e.g., 'job', 'bid', 'user')
 * @param {string} resourceId - ID of the resource
 * @returns {Promise<number>} - Number of keys removed
 */
const invalidateResourceCache = async (resourceType, resourceId) => {
  if (!redisEnabled) {
    return Promise.resolve(0);
  }

  return new Promise((resolve, reject) => {
    try {
      const pattern = `api:*:*${resourceType}*${resourceId}*`;
      const stream = redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      let deletedCount = 0;

      stream.on("data", async (keys) => {
        if (keys.length > 0) {
          const pipeline = redisClient.pipeline();
          keys.forEach((key) => {
            pipeline.del(key);
            deletedCount++;
          });
          await pipeline.exec();
        }
      });

      stream.on("end", () => {
        resolve(deletedCount);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      console.error("Error in invalidateResourceCache:", error.message);
      resolve(0); // Resolve with 0 to prevent app crash
    }
  });
};

/**
 * Invalidate cache for a specific endpoint
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<number>} - Number of keys removed
 */
const invalidateEndpointCache = async (endpoint) => {
  if (!redisEnabled) {
    return Promise.resolve(0);
  }

  return new Promise((resolve, reject) => {
    try {
      const pattern = `api:*:${endpoint}*`;
      const stream = redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      let deletedCount = 0;

      stream.on("data", async (keys) => {
        if (keys.length > 0) {
          const pipeline = redisClient.pipeline();
          keys.forEach((key) => {
            pipeline.del(key);
            deletedCount++;
          });
          await pipeline.exec();
        }
      });

      stream.on("end", () => {
        resolve(deletedCount);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      console.error("Error in invalidateEndpointCache:", error.message);
      resolve(0); // Resolve with 0 to prevent app crash
    }
  });
};

/**
 * Invalidate specific cache by key
 * @param {string} key - Cache key to invalidate
 * @returns {Promise<number>} - 1 if removed, 0 if not found
 */
const invalidateCache = async (key) => {
  return await delAsync(key);
};

module.exports = {
  invalidateUserCache,
  invalidateResourceCache,
  invalidateEndpointCache,
  invalidateCache,
};
