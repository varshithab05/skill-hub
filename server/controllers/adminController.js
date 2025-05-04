const Admin = require("../models/admin");
const User = require("../models/user");
const Job = require("../models/job");
const Bid = require("../models/bid");
// const Project = require("../models/project"); // Removed incorrect require
const Transaction = require("../models/transaction");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getAsync, setAsync } = require("../config/redis"); // Corrected import

const CACHE_EXPIRATION_ADMIN = 300; // Longer cache for admin data? (e.g., 5 minutes)

// Create a new admin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await admin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating admin", error: error.message });
  }
};

// Admin login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin and include password for comparison
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      admin.loginAttempts += 1;
      if (admin.loginAttempts >= 5) {
        admin.accountLocked = true;
      }
      await admin.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset login attempts on successful login
    admin.loginAttempts = 0;
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token with all necessary information
    const token = jwt.sign(
      {
        adminId: admin._id,
        role: admin.role,
        permissions: admin.permissions || [],
      },
      "admin_secret",
      { expiresIn: "24h" }
    );

    // Log successful login
    console.log(`Admin login successful: ${admin.email} (${admin.role})`);

    res.json({
      message: "Login successful",
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || [],
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};

// Get all admins (superuser only) with Caching
exports.getAllAdmins = async (req, res) => {
  const cacheKey = "all_admins";
  try {
    const cachedAdmins = await getAsync(cacheKey);
    if (cachedAdmins) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.json(JSON.parse(cachedAdmins));
    }
    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const admins = await Admin.find().select("-password");
    try {
      await setAsync(
        cacheKey,
        JSON.stringify(admins),
        "EX",
        CACHE_EXPIRATION_ADMIN
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }
    res.json(admins);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

// Get admin by ID with Caching
exports.getAdminById = async (req, res) => {
  const adminId = req.params.id;
  const cacheKey = `admin:${adminId}`;
  try {
    const cachedAdmin = await getAsync(cacheKey);
    if (cachedAdmin) {
      console.log(`Cache hit for ${cacheKey}`);
      const admin = JSON.parse(cachedAdmin);
      if (admin === null)
        return res.status(404).json({ message: "Admin not found" });
      return res.json(admin);
    }
    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const admin = await Admin.findById(adminId).select("-password");
    if (!admin) {
      try {
        await setAsync(
          cacheKey,
          JSON.stringify(null),
          "EX",
          CACHE_EXPIRATION_ADMIN
        );
        console.log(`Stored null for ${cacheKey} in cache`);
      } catch (redisSetError) {
        console.error("Redis set error:", redisSetError);
      }
      return res.status(404).json({ message: "Admin not found" });
    }
    try {
      await setAsync(
        cacheKey,
        JSON.stringify(admin),
        "EX",
        CACHE_EXPIRATION_ADMIN
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }
    res.json(admin);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admin", error: error.message });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      message: "Admin updated successfully",
      admin,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating admin", error: error.message });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const adminToDelete = await Admin.findById(req.params.id);
    if (!adminToDelete) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent self-deletion
    if (req.admin.id === req.params.id) {
      return res
        .status(403)
        .json({ message: "You cannot delete your own account" });
    }

    // Prevent deletion of last superuser
    if (adminToDelete.role === "superuser") {
      const superuserCount = await Admin.countDocuments({ role: "superuser" });
      if (superuserCount <= 1) {
        return res.status(403).json({
          message: "Cannot delete the last superuser account",
        });
      }
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting admin", error: error.message });
  }
};

// Update admin permissions
exports.updatePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    console.log(permissions);
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { $set: { permissions } },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      message: "Permissions updated successfully",
      admin,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating permissions", error: error.message });
  }
};

// Get current admin with Caching
exports.getCurrentAdmin = async (req, res) => {
  const adminId = req.admin.id;
  const cacheKey = `admin:${adminId}`; // Reuse same cache key as getAdminById
  try {
    const cachedAdmin = await getAsync(cacheKey);
    if (cachedAdmin) {
      console.log(`Cache hit for ${cacheKey} (current)`);
      const admin = JSON.parse(cachedAdmin);
      if (admin === null)
        return res.status(404).json({ message: "Admin not found" });
      return res.json(admin);
    }
    console.log(`Cache miss for ${cacheKey} (current), fetching from DB`);
    const admin = await Admin.findById(adminId).select("-password");
    if (!admin) {
      // Should not happen if middleware passed, but handle defensively
      return res.status(404).json({ message: "Admin not found" });
    }
    try {
      await setAsync(
        cacheKey,
        JSON.stringify(admin),
        "EX",
        CACHE_EXPIRATION_ADMIN
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }
    res.json(admin);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admin data", error: error.message });
  }
};

// User Management - Caching applied here
exports.getAllUsers = async (req, res) => {
  const cacheKey = "all_users_admin"; // Different key from non-admin getAllUsers if exists
  try {
    const cachedUsers = await getAsync(cacheKey);
    if (cachedUsers) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.json(JSON.parse(cachedUsers));
    }
    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const users = await User.find().select("-password");
    try {
      await setAsync(
        cacheKey,
        JSON.stringify(users),
        "EX",
        CACHE_EXPIRATION_ADMIN
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Get User By ID - Caching
exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  const cacheKey = `user_admin:${userId}`;
  try {
    const cachedUser = await getAsync(cacheKey);
    if (cachedUser) {
      console.log(`Cache hit for ${cacheKey}`);
      const user = JSON.parse(cachedUser);
      if (user === null)
        return res.status(404).json({ message: "User not found" });
      return res.json(user);
    }
    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const user = await User.findById(userId).select("-password");
    if (!user) {
      try {
        await setAsync(
          cacheKey,
          JSON.stringify(null),
          "EX",
          CACHE_EXPIRATION_ADMIN
        );
        console.log(`Stored null for ${cacheKey} in cache`);
      } catch (redisSetError) {
        console.error("Redis set error:", redisSetError);
      }
      return res.status(404).json({ message: "User not found" });
    }
    try {
      await setAsync(
        cacheKey,
        JSON.stringify(user),
        "EX",
        CACHE_EXPIRATION_ADMIN
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Fields that are allowed to be updated by admin
    const allowedUpdates = [
      "name",
      "username",
      "email",
      "role",
      "commissionRate",
      "bio",
      "info",
    ];
    const updateData = {};

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

// Job Management - Caching
exports.getAllJobs = async (req, res) => {
  const cacheKey = "all_jobs_admin";
  try {
    const cachedJobs = await getAsync(cacheKey);
    if (cachedJobs) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.json(JSON.parse(cachedJobs));
    }
    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const jobs = await Job.find()
      .populate("employer", "name username")
      .populate("freelancer", "name username");
    try {
      await setAsync(
        cacheKey,
        JSON.stringify(jobs),
        "EX",
        CACHE_EXPIRATION_ADMIN
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }
    res.json(jobs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching jobs", error: error.message });
  }
};

// Get Job By ID - Caching
exports.getJobById = async (req, res) => {
  const jobId = req.params.id;
  const cacheKey = `job_admin:${jobId}`; // Potentially reuse `job:${jobId}` if data/perms allow?
  try {
    const cachedJob = await getAsync(cacheKey);
    if (cachedJob) {
      console.log(`Cache hit for ${cacheKey}`);
      const job = JSON.parse(cachedJob);
      if (job === null)
        return res.status(404).json({ message: "Job not found" });
      return res.json(job);
    }
    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const job = await Job.findById(jobId)
      .populate("employer", "name username")
      .populate("freelancer", "name username");
    if (!job) {
      try {
        await setAsync(
          cacheKey,
          JSON.stringify(null),
          "EX",
          CACHE_EXPIRATION_ADMIN
        );
        console.log(`Stored null for ${cacheKey} in cache`);
      } catch (redisSetError) {
        console.error("Redis set error:", redisSetError);
      }
      return res.status(404).json({ message: "Job not found" });
    }
    try {
      await setAsync(
        cacheKey,
        JSON.stringify(job),
        "EX",
        CACHE_EXPIRATION_ADMIN
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }
    res.json(job);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching job", error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const updates = req.body;

    // Fields that are allowed to be updated
    const allowedUpdates = [
      "title",
      "description",
      "budget",
      "status",
      "categories",
      "skillsRequired",
    ];
    const updateData = {};

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const job = await Job.findByIdAndUpdate(jobId, updateData, {
      new: true,
      runValidators: true,
    }).populate("employer", "name email");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating job", error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting job", error: error.message });
  }
};

// Site Statistics - Caching (more complex, depends on calculation)
// Caching simple stats for now
exports.getSiteStats = async (req, res) => {
  const cacheKey = "site_stats";
  try {
    const cachedStats = await getAsync(cacheKey);
    if (cachedStats) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.json(JSON.parse(cachedStats));
    }
    console.log(`Cache miss for ${cacheKey}, fetching/calculating`);

    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalCompletedJobs = await Job.countDocuments({ status: "closed" });
    const totalBids = await Bid.countDocuments();
    const totalTransactions = await Transaction.countDocuments({
      status: "completed",
    });
    // Add more complex stats if needed

    const stats = {
      totalUsers,
      totalJobs,
      totalCompletedJobs,
      totalBids,
      totalTransactions,
    };

    try {
      await setAsync(
        cacheKey,
        JSON.stringify(stats),
        "EX",
        CACHE_EXPIRATION_ADMIN * 2
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching site statistics",
      error: error.message,
    });
  }
};

// Reports and Analytics
exports.getReports = async (req, res) => {
  try {
    const [users, jobs, completedJobs] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: "completed" }),
    ]);

    // Calculate monthly data (last 6 months)
    const monthlyData = await getMonthlyData();

    // Get recent activities
    const recentActivities = await getRecentActivities();

    res.json({
      statistics: {
        totalUsers: users,
        activeJobs: jobs,
        completedJobs,
        totalRevenue: await calculateTotalRevenue(),
        monthlyData,
      },
      recentActivities,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reports", error: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      jobs: await Job.countDocuments(),
      completedJobs: await Job.countDocuments({ status: "completed" }),
      totalRevenue: await calculateTotalRevenue(),
    };
    res.json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching statistics", error: error.message });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const activities = await getRecentActivities();
    res.json(activities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching activities", error: error.message });
  }
};

// Helper functions
async function getMonthlyData() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyUsers = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const monthlyJobs = await Job.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // Format data for the last 6 months
  const months = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.unshift({
      month: date.toLocaleString("default", { month: "short" }),
      users: 0,
      jobs: 0,
    });
  }

  // Fill in the actual data
  monthlyUsers.forEach((item) => {
    const monthIndex = months.findIndex(
      (m) =>
        m.month ===
        new Date(0, item._id.month - 1).toLocaleString("default", {
          month: "short",
        })
    );
    if (monthIndex !== -1) {
      months[monthIndex].users = item.count;
    }
  });

  monthlyJobs.forEach((item) => {
    const monthIndex = months.findIndex(
      (m) =>
        m.month ===
        new Date(0, item._id.month - 1).toLocaleString("default", {
          month: "short",
        })
    );
    if (monthIndex !== -1) {
      months[monthIndex].jobs = item.count;
    }
  });

  return months;
}

async function calculateTotalRevenue() {
  const completedJobs = await Job.find({ status: "completed" });
  return completedJobs.reduce((total, job) => total + (job.budget || 0), 0);
}

async function getRecentActivities() {
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name createdAt");

  const recentJobs = await Job.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("employer", "name")
    .select("title createdAt employer");

  const activities = [
    ...recentUsers.map((user) => ({
      description: `New user registered: ${user.name}`,
      timestamp: user.createdAt,
      type: "user",
    })),
    ...recentJobs.map((job) => ({
      description: `New job posted: ${job.title} by ${job.employer.name}`,
      timestamp: job.createdAt,
      type: "job",
    })),
  ];

  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
}
