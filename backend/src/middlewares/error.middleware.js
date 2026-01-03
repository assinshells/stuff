import { config } from "../config/env.js";
import logger, { logError } from "../utils/logger.js";
import { AppError } from "../utils/errors.js";

const handleMongoError = (err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    return {
      statusCode: 409,
      code: "DUPLICATE_KEY",
      message: `${field} '${value}' already exists`,
    };
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));

    return {
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors,
    };
  }

  if (err.name === "CastError") {
    return {
      statusCode: 400,
      code: "INVALID_ID",
      message: `Invalid ${err.path}: ${err.value}`,
    };
  }

  return null;
};

const handleJWTError = (err) => {
  if (err.name === "JsonWebTokenError") {
    return {
      statusCode: 401,
      code: "INVALID_TOKEN",
      message: "Invalid token",
    };
  }

  if (err.name === "TokenExpiredError") {
    return {
      statusCode: 401,
      code: "TOKEN_EXPIRED",
      message: "Token has expired",
    };
  }

  return null;
};

const handleJoiError = (err) => {
  if (err.isJoi || err.name === "ValidationError") {
    const errors = err.details?.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
      type: detail.type,
    }));

    return {
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors,
    };
  }

  return null;
};

export const errorHandler = (err, req, res, next) => {
  logError(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    body: config.isDevelopment ? req.body : undefined,
  });

  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "Internal server error";
  let errors = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    errors = err.errors;
  } else {
    const mongoError = handleMongoError(err);
    if (mongoError) {
      ({ statusCode, code, message, errors } = mongoError);
    } else {
      const jwtError = handleJWTError(err);
      if (jwtError) {
        ({ statusCode, code, message } = jwtError);
      } else {
        const joiError = handleJoiError(err);
        if (joiError) {
          ({ statusCode, code, message, errors } = joiError);
        }
      }
    }
  }

  const response = {
    success: false,
    error: {
      code,
      message,
      ...(errors && { errors }),
      ...(config.isDevelopment && {
        stack: err.stack,
        raw: err.message,
        name: err.name,
      }),
    },
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);

  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.url} not found`,
      availableEndpoints: config.isDevelopment
        ? {
            users: {
              getAll: "GET /api/users",
              getById: "GET /api/users/:id",
              create: "POST /api/users",
              update: "PUT /api/users/:id",
              delete: "DELETE /api/users/:id",
              stats: "GET /api/users/stats",
            },
            health: "GET /health",
          }
        : undefined,
    },
  });
};
