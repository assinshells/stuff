import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { jwtService } from "../services/jwt.service.js";
import { logger } from "../utils/logger.js";

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded;
    try {
      decoded = jwtService.verifyToken(token);
    } catch (error) {
      throw ApiError.unauthorized(error.message);
    }

    // Check token type
    if (decoded.type !== "access") {
      throw ApiError.unauthorized("Invalid token type");
    }

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Account is deactivated");
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    logger.warn({ err: error, path: req.path }, "Authentication failed");
    next(error);
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwtService.verifyToken(token);

    if (decoded.type === "access") {
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch (error) {
    // Don't throw error for optional auth, just continue without user
    next();
  }
};

export default { authenticate, optionalAuthenticate };
