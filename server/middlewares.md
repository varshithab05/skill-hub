# SkillHub Backend Middleware Documentation

This document outlines the five types of middleware implemented in the SkillHub backend application.

## 1. Application-level Middleware

Application-level middleware applies to all routes in the application. These middleware functions are bound to the application instance using `app.use()`.

**Implemented middleware:**
- Logging middleware (request logging, error logging)
- Security middleware (security headers, rate limiting)
- CORS middleware (Cross-Origin Resource Sharing)
- Body parsing middleware (JSON, URL-encoded)
- Request sanitization middleware

## 2. Router-level Middleware

Router-level middleware works in the same way as application-level middleware, except it is bound to an instance of `express.Router()`. These middleware functions are scoped to specific routes.

**Implemented middleware:**
- Authentication middleware (JWT verification)
- Role-based access control middleware
- Route-specific rate limiting
- Admin authentication middleware

## 3. Error-handling Middleware

Error-handling middleware functions are defined with four arguments (err, req, res, next) and are used to handle errors that occur during request processing.

**Implemented middleware:**
- Centralized error handler
- Custom API error class
- 404 Not Found handler

## 4. Built-in Middleware

Built-in middleware is included with Express and doesn't require additional npm modules.

**Implemented middleware:**
- `express.json()` - Parses incoming requests with JSON payloads
- `express.urlencoded()` - Parses incoming requests with URL-encoded payloads
- `express.static()` - Serves static files

## 5. Third-party Middleware

Third-party middleware is external modules that provide additional functionality.

**Implemented middleware:**
- `cors` - Enables Cross-Origin Resource Sharing
- `helmet` - Sets security-related HTTP headers
- `morgan` - HTTP request logger
- `express-rate-limit` - Limits repeated requests

---

These middleware components work together to create a secure, robust, and maintainable backend application for the SkillHub platform. 