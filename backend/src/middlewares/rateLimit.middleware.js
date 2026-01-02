import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";
import logger from "../utils/logger.js";

/**
 * Rate Limiting для защиты от brute-force атак
 */

/**
 * Общий rate limiter для API
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      {
        type: "RATE_LIMIT_EXCEEDED",
        ip: req.ip,
        path: req.path,
      },
      "Rate limit exceeded"
    );

    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later",
      },
    });
  },
});

/**
 * Строгий rate limiter для аутентификации
 * Защита от brute-force атак на login/register
 */
export const authLimiter = rateLimit({
  windowMs: config.authRateLimit.windowMs,
  max: config.authRateLimit.max,
  skipSuccessfulRequests: true, // Не считаем успешные запросы
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts. Please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      {
        type: "AUTH_RATE_LIMIT_EXCEEDED",
        ip: req.ip,
        path: req.path,
        body: {
          nickname: req.body?.nickname,
          email: req.body?.email,
        },
      },
      "Auth rate limit exceeded"
    );

    res.status(429).json({
      success: false,
      error: {
        code: "AUTH_RATE_LIMIT_EXCEEDED",
        message:
          "Too many authentication attempts. Please try again in 15 minutes",
      },
    });
  },
});

/**
 * Rate limiter для password reset
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 3, // Максимум 3 попытки в час
  skipSuccessfulRequests: false,
  message: {
    success: false,
    error: {
      code: "PASSWORD_RESET_LIMIT_EXCEEDED",
      message: "Too many password reset attempts. Please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      {
        type: "PASSWORD_RESET_LIMIT_EXCEEDED",
        ip: req.ip,
        credential: req.body?.credential,
      },
      "Password reset rate limit exceeded"
    );

    res.status(429).json({
      success: false,
      error: {
        code: "PASSWORD_RESET_LIMIT_EXCEEDED",
        message: "Too many password reset attempts. Please try again in 1 hour",
      },
    });
  },
});

export default {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
};
