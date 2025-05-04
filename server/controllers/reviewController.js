const Review = require("../models/review");
const User = require("../models/user");
const Notification = require("../models/notification");
const { getAsync, setAsync } = require("../config/redis"); // Corrected import

const CACHE_EXPIRATION = 60; // Cache duration in seconds

// Add a review
exports.addReview = async (req, res) => {
  const { reviewedUser, rating, comment } = req.body;
  const reviewer = req.user.id;

  if (reviewedUser === reviewer) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot review yourself" });
  }

  try {
    const existingReview = await Review.findOne({ reviewer, reviewedUser });
    if (existingReview)
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this user",
      });

    const newReview = new Review({
      reviewer,
      reviewedUser,
      rating,
      comment,
    });

    await newReview.save();

    // Create notification for the reviewed user
    const notification = new Notification({
      recipient: reviewedUser,
      type: "review",
      title: "New Review Received",
      message: `You have received a ${rating}-star review`,
      relatedId: newReview._id,
      onModel: "Review",
    });
    await notification.save();

    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error adding review", error });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const reviewer = req.user.id;

  try {
    const review = await Review.findOne({ _id: reviewId, reviewer });
    if (!review)
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not the reviewer",
      });

    review.rating = rating;
    review.comment = comment;
    review.updatedAt = Date.now(); // Update the timestamp

    await review.save();
    res.status(200).json({ success: true, review });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating review", error });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const reviewer = req.user.id;

  try {
    const review = await Review.findOneAndDelete({ _id: reviewId, reviewer });
    if (!review)
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not the reviewer",
      });
    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting review", error });
  }
};

// Get all reviews for a user with Caching
exports.getAllReviewsForUser = async (req, res) => {
  const { userId } = req.params;
  const cacheKey = `reviews_for_user:${userId}`;

  try {
    const cachedReviews = await getAsync(cacheKey);
    if (cachedReviews) {
      console.log(`Cache hit for ${cacheKey}`);
      const reviews = JSON.parse(cachedReviews);
      return res.status(200).json({ success: true, reviews });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const reviews = await Review.find({ reviewedUser: userId }).populate(
      "reviewer",
      "name username info.profilePic"
    );

    try {
      await setAsync(cacheKey, JSON.stringify(reviews), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error(`Error fetching reviews for user ${userId}:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

// Get all reviews by a user with Caching
exports.getAllReviewsByUser = async (req, res) => {
  const { userId } = req.params;
  const cacheKey = `reviews_by_user:${userId}`;

  try {
    const cachedReviews = await getAsync(cacheKey);
    if (cachedReviews) {
      console.log(`Cache hit for ${cacheKey}`);
      const reviews = JSON.parse(cachedReviews);
      return res.status(200).json({ success: true, reviews });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const reviews = await Review.find({ reviewer: userId }).populate(
      "reviewedUser",
      "name"
    );

    try {
      await setAsync(cacheKey, JSON.stringify(reviews), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error(`Error fetching reviews by user ${userId}:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

// Get a specific review by ID with Caching
exports.getReviewById = async (req, res) => {
  const reviewId = req.params.reviewId;
  const cacheKey = `review:${reviewId}`;

  try {
    const cachedReview = await getAsync(cacheKey);
    if (cachedReview) {
      console.log(`Cache hit for ${cacheKey}`);
      const review = JSON.parse(cachedReview);
      if (review === null) {
        return res
          .status(404)
          .json({ success: false, message: "Review not found" });
      }
      return res.status(200).json({ success: true, data: review });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const review = await Review.findById(reviewId)
      .populate("reviewer", "name username email")
      .populate("reviewedUser", "name username email");

    if (!review) {
      try {
        await setAsync(cacheKey, JSON.stringify(null), "EX", CACHE_EXPIRATION);
        console.log(`Stored null for ${cacheKey} in cache`);
      } catch (redisSetError) {
        console.error("Redis set error:", redisSetError);
      }
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    try {
      await setAsync(cacheKey, JSON.stringify(review), "EX", CACHE_EXPIRATION);
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error(`Error fetching review ${reviewId}:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching review",
      error: error.message,
    });
  }
};
