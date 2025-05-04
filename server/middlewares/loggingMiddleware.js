const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const path = require("path");
const fs = require("fs");

// Create log directory if it doesn't exist
const logDirectory = path.join(__dirname, "../log");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory, { recursive: true });

// Create a rotating write stream for access logs
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // Rotate daily
  path: logDirectory,
  size: "10M", // Rotate when size exceeds 10MB
  compress: "gzip", // Compress rotated files
});

// Create a rotating write stream for error logs
const errorLogStream = rfs.createStream("error.log", {
  interval: "1d", // Rotate daily
  path: logDirectory,
  size: "10M", // Rotate when size exceeds 10MB
  compress: "gzip", // Compress rotated files
});

// Custom token for request body logging (with sensitive data filtering)
morgan.token("body", (req) => {
  if (req.method === "POST" || req.method === "PUT") {
    const filteredBody = { ...req.body };

    // Filter out sensitive information
    if (filteredBody.password) filteredBody.password = "[FILTERED]";
    if (filteredBody.token) filteredBody.token = "[FILTERED]";
    if (filteredBody.creditCard) filteredBody.creditCard = "[FILTERED]";

    return JSON.stringify(filteredBody);
  }
  return "";
});

// Development logging format (colorful and detailed)
const developmentFormat =
  ":method :url :status :response-time ms - :res[content-length] :body";

// Production logging format (machine-readable)
const productionFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

// Request logging middleware
const requestLogger = (isDevelopment = false) => {
  return morgan(isDevelopment ? developmentFormat : productionFormat, {
    stream: accessLogStream,
    skip: (req, res) => res.statusCode >= 400, // Skip error responses
  });
};

// Error logging middleware
const errorLogger = (isDevelopment = false) => {
  return morgan(isDevelopment ? developmentFormat : productionFormat, {
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400, // Only log error responses
  });
};

module.exports = {
  requestLogger,
  errorLogger,
};
