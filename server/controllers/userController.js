const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { handleProfilePicUpload } = require("../middlewares/uploadMiddleware");
const { getAsync, setAsync } = require("../config/redis"); // Corrected import: setexAsync -> setAsync
const solrService = require('../services/solrService');
const jwtSecret = "skill_hub_secret_key";
const CACHE_EXPIRATION = 60; // Cache duration in seconds

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, username, email, password, role, bio, info } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role,
      bio,
      info,
      wallet: 0,
    });

    await newUser.save();
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, jwtSecret, {
      expiresIn: "24h",
    });
    res.status(201).json({
      success: true,
      token,
      role: newUser.role,
      username: newUser.username,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error registering user", error });
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  try {
    // Find user by either username or email
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: "24h",
    });
    res
      .status(200)
      .json({ success: true, token, role: user.role, username: user.username });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error logging in", error });
  }
};

// Get logged-in user's profile with Redis Caching
exports.getUserDetails = async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `user_profile:${userId}`;

  try {
    // 1. Try to get data from Redis cache
    const cachedProfile = await getAsync(cacheKey);

    if (cachedProfile) {
      console.log(`Cache hit for ${cacheKey}`);
      const user = JSON.parse(cachedProfile);
      return res.status(200).json({ success: true, user });
    }

    // 2. If not in cache, fetch from MongoDB
    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 3. Store the result in Redis with expiration
    try {
      await setAsync(cacheKey, JSON.stringify(user), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
      // Don't fail the request if Redis write fails
    }

    // 4. Return the result from MongoDB
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { name, bio, skills, experience, portfolio, previousWorks } = req.body;

  try {
    // Retrieve the current user data
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Merge the existing `info` object with the new fields
    const updatedInfo = {
      ...user.info, // Keep existing data
      skills: skills || user.info.skills, // Update only if new data is provided
      portfolio: portfolio || user.info.portfolio,
      experience: experience || user.info.experience,
    };

    // Update the user profile
    await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        bio,
        info: updatedInfo, // Use the merged info object
        previousWorks: previousWorks || user.previousWorks, // Keep previous works if not provided
      },
      { new: true }
    );

    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating profile", error });
  }
};

// Upload profile picture
exports.uploadProfilePic = [
  handleProfilePicUpload,
  (req, res) => {
    if (req.profilePicPath) {
      return res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        profilePic: req.profilePicPath,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No picture uploaded" });
    }
  },
];

// Get public user profile by username with Caching
exports.getUserProfile = async (req, res) => {
  const username = req.params.username;
  const cacheKey = `public_profile:${username}`;

  try {
    const cachedUserProfile = await getAsync(cacheKey);
    if (cachedUserProfile) {
      console.log(`Cache hit for ${cacheKey}`);
      const user = JSON.parse(cachedUserProfile);
      if (user === null) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user); // Note: original returns full user object, including sensitive data if not selected out
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    // Consider selecting specific fields to return for public profile
    const user = await User.findOne({ username: username });

    if (!user) {
      try {
        await setAsync(cacheKey, JSON.stringify(null), "EX", CACHE_EXPIRATION);
        console.log(`Stored null for ${cacheKey} in cache`);
      } catch (redisSetError) {
        console.error("Redis set error:", redisSetError);
      }
      return res.status(404).json({ message: "User not found" });
    }

    try {
      await setAsync(cacheKey, JSON.stringify(user), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.json(user);
  } catch (error) {
    console.error(`Error fetching public profile for ${username}:`, error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users (Admin only) with Caching
exports.getAllUsers = async (req, res) => {
  // This route is admin-only, caching might be less critical or need different strategy
  const cacheKey = "all_users";

  try {
    const cachedUsers = await getAsync(cacheKey);
    if (cachedUsers) {
      console.log(`Cache hit for ${cacheKey}`);
      const users = JSON.parse(cachedUsers);
      return res.status(200).json({ success: true, users });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const users = await User.find().select("-password");

    try {
      await setAsync(cacheKey, JSON.stringify(users), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Delete a user by Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting user", error });
  }
};

// Search users with Solr
exports.searchUsersSolr = async (req, res) => {
  try {
    const { query, role, skills, limit, page } = req.query;
    
    // Build filters object
    const filters = {};
    if (role) filters.role = role;
    if (skills) {
      // Handle multiple skills as array or comma-separated string
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      filters.skills = skillsArray;
    }
    
    // Calculate pagination
    const start = page ? (parseInt(page) - 1) * (limit ? parseInt(limit) : 10) : 0;
    
    const searchOptions = {
      start,
      limit: limit ? parseInt(limit) : 10,
      filters
    };
    
    const result = await solrService.searchUsers(query || '*:*', searchOptions);
    
    res.status(200).json({
      success: true,
      count: result.numFound,
      users: result.docs
    });
  } catch (error) {
    console.error('Error searching users with Solr:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
};
