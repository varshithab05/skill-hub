const {
  getAsync,
  setAsync,
  redisEnabled,
  DEFAULT_EXPIRY,
} = require("../config/redis");

/**
 * Middleware to cache API responses in Redis
 * @param {number} expiry - Cache expiry time in seconds (optional)
 * @returns {function} Express middleware
 */
const cacheMiddleware = (expiry = DEFAULT_EXPIRY) => {
  return async (req, res, next) => {
    // Skip if Redis is not available
    if (!redisEnabled) {
      return next();
    }

    // Skip caching for non-GET requests or authenticated routes
    if (req.method !== "GET" || req.originalUrl.includes("/user/profile")) {
      return next();
    }

    // Skip caching for routes that require fresh data
    if (req.headers["x-skip-cache"] === "true") {
      return next();
    }

    try {
      // Create a unique cache key based on the request
      // For auth endpoints, include user ID in the key to avoid sharing sensitive data
      const userId = req.user ? req.user.id : "anonymous";
      const cacheKey = `api:${userId}:${req.originalUrl}`;

      // Try to get cached response
      const cachedResponse = await getAsync(cacheKey);

      if (cachedResponse) {
        try {
          // Parse the cached response
          const parsedResponse = JSON.parse(cachedResponse);

          // Handle different response types appropriately
          if (Array.isArray(parsedResponse)) {
            // For arrays, return them directly but set a header indicating it's cached
            res.set("X-Cache", "HIT");
            return res.status(200).json(parsedResponse);
          } else {
            // For objects, we can spread in the cached:true property
            return res.status(200).json({
              ...parsedResponse,
              cached: true,
            });
          }
        } catch (parseError) {
          console.error("Error parsing cached response:", parseError);
          // If we can't parse the cached response, proceed to the controller
        }
      }

      // Cache miss - proceed to controller but intercept the response
      const originalSend = res.send;

      res.send = function (body) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          // Don't try to cache if body is not valid JSON
          try {
            // Check if it's already a string (Express sometimes serializes for us)
            const bodyString =
              typeof body === "string" ? body : JSON.stringify(body);

            // Try to parse it to ensure it's valid JSON
            const parsedBody =
              typeof body === "string" ? JSON.parse(body) : body;

            if (!parsedBody.error && !parsedBody.message?.includes("error")) {
              // Store in cache - with error handling
              setAsync(cacheKey, bodyString, "EX", expiry).catch((err) =>
                console.error("[CacheMiddleware] Redis cache error:", err)
              );
            }

            // DO NOT MODIFY THE RESPONSE BODY - let it pass through unchanged
          } catch (error) {
            // Just log the error but don't modify response
            console.error(
              "[CacheMiddleware] Error parsing response for caching:",
              error
            );
          }
        }

        // Call the original send method - keep the body unchanged
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      // If there's any error in the caching process, just log it and proceed normally
      console.error("Redis cache middleware error:", error);
      next();
    }
  };
};

/**
 * Cache middleware for specific endpoints with custom expiry times
 */
const routeCache = {
  // Public data that changes infrequently (1 day)
  longTerm: cacheMiddleware(86400),

  // Standard cache for most endpoints (1 hour)
  standard: cacheMiddleware(3600),

  // Short-term cache for frequently changing data (5 minutes)
  shortTerm: cacheMiddleware(300),

  // Very short cache for highly dynamic data (30 seconds)
  dynamic: cacheMiddleware(30),
};

module.exports = {
  cacheMiddleware,
  routeCache,
};
