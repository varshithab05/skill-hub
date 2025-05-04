const Bid = require("../models/bid");
const mongoose = require("mongoose");
const Job = require("../models/job");
const Notification = require("../models/notification");
const { getAsync, setAsync } = require("../config/redis"); // Corrected import

const CACHE_EXPIRATION = 60; // Cache duration in seconds

// Place a new bid
const placeBid = async (req, res) => {
  try {
    const { amount, jobId } = req.body;
    const freelancer = req.user.id;
    console.log(jobId);

    const newBid = new Bid({
      amount,
      job: jobId,
      freelancer,
    });

    await newBid.save();

    // Get job details to notify the job owner
    const job = await Job.findById(jobId);
    if (job) {
      // Create notification for job owner
      const notification = new Notification({
        recipient: job.employer,
        type: "bid",
        title: "New Bid Received",
        message: `A new bid of $${amount} has been placed on your job`,
        relatedId: newBid._id,
        onModel: "Bid",
      });
      await notification.save();
    }

    res.status(201).json(newBid);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error placing bid" });
  }
};

// Get all bids for a specific job with Caching
const getBidsForJob = async (req, res) => {
  const jobId = req.params.jobId;
  const cacheKey = `job_bids:${jobId}`;

  try {
    const cachedBids = await getAsync(cacheKey);
    if (cachedBids) {
      console.log(`Cache hit for ${cacheKey}`);
      const bids = JSON.parse(cachedBids);
      return res.status(200).json(bids);
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const bids = await Bid.find({ job: jobId }).populate("freelancer");

    try {
      await setAsync(cacheKey, JSON.stringify(bids), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json(bids);
  } catch (error) {
    console.error(`Error fetching bids for job ${jobId}:`, error);
    res.status(500).json({ error: "Error fetching bids" });
  }
};

const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    // Find the job associated with the bid
    const job = await Job.findById(bid.job);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check if the user trying to accept the bid is the job poster
    const currentUserId = req.user.id;
    if (job.employer.toString() !== currentUserId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to accept this bid." });
    }

    // Update the accepted bid's status
    bid.status = "accepted";
    await bid.save();

    // Update job details
    job.freelancer = bid.freelancer;
    job.status = "in-progress";
    job.bidAccepted = true;

    // Reject all other bids for this job
    await Bid.updateMany(
      { job: job._id, _id: { $ne: bid._id } }, // Find bids for this job, excluding the accepted bid
      { status: "rejected" } // Update their status to 'rejected'
    );

    // Create notification for the freelancer
    const notification = new Notification({
      recipient: bid.freelancer,
      type: "job_award",
      title: "Bid Accepted",
      message: `Your bid has been accepted for the job: ${job.title}`,
      relatedId: job._id,
      onModel: "Job",
    });
    await notification.save();

    await job.save();
    res.status(200).json({ message: "Bid accepted", job });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error accepting bid" });
  }
};

const getRecentBids = async (req, res) => {
  const freelancerId = req.user.id;
  const cacheKey = `recent_bids:${freelancerId}`;

  try {
    // 1. Try to get data from Redis cache
    const cachedBids = await getAsync(cacheKey);

    if (cachedBids) {
      console.log(`Cache hit for ${cacheKey}`);
      const recentBids = JSON.parse(cachedBids);
      return res.status(200).json({ recentBids });
    }

    // 2. If not in cache, fetch from MongoDB
    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const freelancerObjectId = new mongoose.Types.ObjectId(freelancerId);

    const recentBids = await Bid.find({ freelancer: freelancerObjectId })
      .populate("job") // Populate job details
      .sort({ createdAt: -1 }); // Sort by most recent first

    // Note: Original code had a 404 if no bids found.
    // We'll cache the empty array result as well.
    // if (!recentBids.length) {
    //   return res
    //     .status(404)
    //     .json({ message: "No recent bids found for this user" });
    // }

    // 3. Store the result in Redis (even if empty) with expiration
    try {
      await setAsync(
        cacheKey,
        JSON.stringify(recentBids),
        "EX",
        CACHE_EXPIRATION
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
      // Don't fail the request if Redis write fails
    }

    // 4. Return the result from MongoDB
    res.status(200).json({ recentBids });
  } catch (error) {
    console.error("Error retrieving recent bids:", error);
    res
      .status(500)
      .json({ message: "Error retrieving recent bids", error: error.message });
  }
};

// Controller to get bid details by ID with Caching
const getBidDetails = async (req, res) => {
  const { bidId } = req.params;
  const cacheKey = `bid_details:${bidId}`;

  try {
    const cachedBidDetails = await getAsync(cacheKey);
    if (cachedBidDetails) {
      console.log(`Cache hit for ${cacheKey}`);
      const bid = JSON.parse(cachedBidDetails);
      return res.status(200).json({ bid });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const bid = await Bid.findById(bidId)
      .populate("freelancer", "name username")
      .populate("job", "title");

    if (!bid) {
      // Cache the fact that the bid wasn't found
      try {
        await setAsync(cacheKey, JSON.stringify(null), "EX", CACHE_EXPIRATION);
        console.log(`Stored null for ${cacheKey} in cache`);
      } catch (redisSetError) {
        console.error("Redis set error:", redisSetError);
      }
      return res.status(404).json({ message: "Bid not found" });
    }

    try {
      await setAsync(cacheKey, JSON.stringify(bid), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ bid });
  } catch (error) {
    console.error(`Error fetching bid details ${bidId}:`, error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a specific bid by ID with Caching
const getBidById = async (req, res) => {
  const bidId = req.params.bidId;
  const cacheKey = `bid:${bidId}`; // Slightly different key from details for clarity

  try {
    const cachedBid = await getAsync(cacheKey);
    if (cachedBid) {
      console.log(`Cache hit for ${cacheKey}`);
      const bid = JSON.parse(cachedBid);
      // Handle case where null was cached for not found
      if (bid === null) {
        return res
          .status(404)
          .json({ success: false, message: "Bid not found" });
      }
      return res.status(200).json({ success: true, data: bid });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const bid = await Bid.findById(bidId)
      .populate("freelancer", "name username email")
      .populate("job");

    if (!bid) {
      try {
        await setAsync(cacheKey, JSON.stringify(null), "EX", CACHE_EXPIRATION);
        console.log(`Stored null for ${cacheKey} in cache`);
      } catch (redisSetError) {
        console.error("Redis set error:", redisSetError);
      }
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    try {
      await setAsync(cacheKey, JSON.stringify(bid), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ success: true, data: bid });
  } catch (error) {
    console.error(`Error fetching bid ${bidId}:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching bid",
      error: error.message,
    });
  }
};

// Get all bids by a specific user with Caching
const getBidsByUserId = async (req, res) => {
  const userId = req.params.userId;
  const cacheKey = `user_bids:${userId}`;

  try {
    const cachedUserBids = await getAsync(cacheKey);
    if (cachedUserBids) {
      console.log(`Cache hit for ${cacheKey}`);
      const bids = JSON.parse(cachedUserBids);
      return res.status(200).json({
        success: true,
        count: bids.length,
        data: bids,
      });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const bids = await Bid.find({ freelancer: userId })
      .populate("job")
      .populate("freelancer", "name username email")
      .sort({ createdAt: -1 });

    try {
      await setAsync(cacheKey, JSON.stringify(bids), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    console.error(`Error fetching bids for user ${userId}:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching user's bids",
      error: error.message,
    });
  }
};

// Delete a bid (write operation - potential place for cache invalidation)
const deleteBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!mongoose.Types.ObjectId.isValid(bidId)) {
      return res.status(400).json({ message: "Invalid bid ID" });
    }

    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Check if the user is the owner of the bid
    if (bid.freelancer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this bid" });
    }

    await bid.deleteOne();
    res.status(200).json({ message: "Bid deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBid:", error);
    res
      .status(500)
      .json({ message: "Error deleting bid", error: error.message });
  }
};

module.exports = {
  placeBid,
  getBidsForJob,
  acceptBid,
  getRecentBids,
  getBidDetails,
  getBidById,
  getBidsByUserId,
  deleteBid,
};
