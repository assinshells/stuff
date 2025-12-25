import { logger } from "../utils/logger.js";
import { ENV } from "../config/env.js";
import ApiError from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // If error is not an ApiError, treat as 500
  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || "Internal Server Error";
  }

  // Prepare error log data
  const errorLog = {
    statusCode,
    message,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  };

  // Log error with appropriate level
  if (statusCode >= 500) {
    logger.error(errorLog, "Server error");
  } else {
    logger.warn(errorLog, "Client error");
  }

  // Prepare response
  const response = {
    success: false,
    statusCode,
    message,
  };

  // Include stack trace in development
  if (ENV.isDevelopment) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
