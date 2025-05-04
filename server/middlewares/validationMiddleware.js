const { default: mongoose } = require("mongoose");

exports.validateUserInput = (req, res, next) => {
  const { name, email, password } = req.body;

  // Regex validation
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,}$/; // Allows special characters

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .json({
        message:
          "Password must be at least 8 characters, contain letters, numbers, and special characters",
      });
  }

  next();
};

exports.validateReviewInput = (req, res, next) => {
  const { reviewedUser, rating, comment } = req.body;

  // Ensure that `rating` is a number between 1 and 5
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
  }

  // Ensure `reviewedUser` is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(reviewedUser)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  next();
};
