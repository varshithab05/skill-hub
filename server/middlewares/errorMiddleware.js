const errorHandler = (err, req, res, next) => {
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log the error for server-side debugging
  console.error(`Error: ${message}`);
  console.error(`Stack: ${err.stack}`);

  // Determine environment and adjust response accordingly
  const isDevelopment = process.env.NODE_ENV === "development";

  // Send appropriate response based on environment
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(isDevelopment && { stack: err.stack }),
      ...(err.errors && { details: err.errors }),
    },
  });
};

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Not Found middleware
const notFound = (req, res, next) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = { errorHandler, ApiError, notFound };
