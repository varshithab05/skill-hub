// controllers/walletController.js
const User = require("../models/user");
const { getAsync, setAsync } = require("../config/redis"); // Corrected import

const CACHE_EXPIRATION = 60; // Cache duration in seconds

// Controller to get the wallet balance of the logged-in user with Caching
exports.getWalletBalance = async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `wallet_balance:${userId}`;

  try {
    const cachedBalance = await getAsync(cacheKey);
    if (cachedBalance !== null) {
      // Balance can be 0
      console.log(`Cache hit for ${cacheKey}`);
      const walletBalance = parseFloat(cachedBalance); // Parse potentially cached number
      return res.status(200).json({ walletBalance });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const user = await User.findById(userId).select("wallet");

    if (!user) {
      // Don't cache not found for wallet, as user should exist if authenticated
      return res.status(404).json({ message: "User not found" });
    }

    const walletBalance = user.wallet;

    try {
      // Corrected: Use setAsync
      await setAsync(
        cacheKey,
        walletBalance.toString(),
        "EX",
        CACHE_EXPIRATION
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ walletBalance });
  } catch (error) {
    console.error(`Error retrieving wallet balance for user ${userId}:`, error);
    res.status(500).json({
      message: "Error retrieving wallet balance",
      error: error.message,
    });
  }
};
