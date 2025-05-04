const validator = require("validator");
const { ApiError } = require("./errorMiddleware");

// Sanitize and validate request body
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    const sanitizedBody = {};

    // Iterate through each field in the request body
    Object.keys(req.body).forEach((key) => {
      // If the value is a string, sanitize it
      if (typeof req.body[key] === "string") {
        sanitizedBody[key] = validator.escape(req.body[key].trim());
      } else {
        sanitizedBody[key] = req.body[key];
      }
    });

    req.body = sanitizedBody;
  }

  next();
};

// Validate request parameters
const validateParams = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each parameter against the schema
    Object.keys(schema).forEach((param) => {
      if (schema[param].required && !req.params[param]) {
        errors.push(`Parameter '${param}' is required`);
      } else if (req.params[param] && schema[param].type) {
        // Type validation
        switch (schema[param].type) {
          case "string":
            if (typeof req.params[param] !== "string") {
              errors.push(`Parameter '${param}' must be a string`);
            }
            break;
          case "number":
            if (isNaN(Number(req.params[param]))) {
              errors.push(`Parameter '${param}' must be a number`);
            }
            break;
          case "boolean":
            if (req.params[param] !== "true" && req.params[param] !== "false") {
              errors.push(`Parameter '${param}' must be a boolean`);
            }
            break;
          case "objectId":
            if (!validator.isMongoId(req.params[param])) {
              errors.push(`Parameter '${param}' must be a valid ObjectId`);
            }
            break;
        }
      }
    });

    if (errors.length > 0) {
      return next(new ApiError("Invalid request parameters", 400, errors));
    }

    next();
  };
};

// Validate request body
const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each field against the schema
    Object.keys(schema).forEach((field) => {
      if (
        schema[field].required &&
        (req.body[field] === undefined || req.body[field] === "")
      ) {
        errors.push(`Field '${field}' is required`);
      } else if (req.body[field] !== undefined && schema[field].type) {
        // Type validation
        switch (schema[field].type) {
          case "string":
            if (typeof req.body[field] !== "string") {
              errors.push(`Field '${field}' must be a string`);
            }
            break;
          case "number":
            if (isNaN(Number(req.body[field]))) {
              errors.push(`Field '${field}' must be a number`);
            }
            break;
          case "boolean":
            if (typeof req.body[field] !== "boolean") {
              errors.push(`Field '${field}' must be a boolean`);
            }
            break;
          case "email":
            if (!validator.isEmail(req.body[field])) {
              errors.push(`Field '${field}' must be a valid email address`);
            }
            break;
          case "objectId":
            if (!validator.isMongoId(req.body[field])) {
              errors.push(`Field '${field}' must be a valid ObjectId`);
            }
            break;
          case "array":
            if (!Array.isArray(req.body[field])) {
              errors.push(`Field '${field}' must be an array`);
            }
            break;
        }
      }

      // Custom validation
      if (req.body[field] !== undefined && schema[field].validate) {
        const validationResult = schema[field].validate(req.body[field]);
        if (validationResult !== true) {
          errors.push(validationResult);
        }
      }
    });

    if (errors.length > 0) {
      return next(new ApiError("Invalid request body", 400, errors));
    }

    next();
  };
};

module.exports = {
  sanitizeBody,
  validateParams,
  validateBody,
};
