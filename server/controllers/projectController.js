const Job = require("../models/job");
const { getAsync, setAsync } = require("../config/redis"); // Corrected import

const CACHE_EXPIRATION = 60; // Cache duration in seconds

// Controller to get recent projects for the logged-in freelancer with Caching
exports.getRecentProjects = async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `recent_projects:${userId}`;

  try {
    // 1. Try cache
    const cachedProjects = await getAsync(cacheKey);
    if (cachedProjects) {
      console.log(`Cache hit for ${cacheKey}`);
      const recentProjects = JSON.parse(cachedProjects);
      return res.status(200).json({ recentProjects });
    }

    // 2. Fetch from DB
    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const recentProjects = await Job.find({
      freelancer: userId,
      status: { $in: ["in-progress", "closed"] },
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    // Note: Original code had a 404 if no projects found.
    // Caching the empty array result.
    // if (!recentProjects.length) {
    //   return res
    //     .status(404)
    //     .json({ message: "No recent projects found for this freelancer" });
    // }

    // 3. Store in cache
    try {
      await setAsync(
        cacheKey,
        JSON.stringify(recentProjects),
        "EX",
        CACHE_EXPIRATION
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    // 4. Return result
    res.status(200).json({ recentProjects });
  } catch (error) {
    console.error(
      `Error retrieving recent projects for user ${userId}:`,
      error
    );
    res.status(500).json({
      message: "Error retrieving recent projects",
      error: error.message,
    });
  }
};
