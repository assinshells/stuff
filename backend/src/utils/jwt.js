import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { UnauthorizedError } from "./errors.js";

/**
 * JWT Утилиты для работы с токенами
 */

/**
 * Генерация Access Token
 */
export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role,
      type: "access",
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.accessExpiry,
      issuer: "fullstack-app",
      audience: "fullstack-app-client",
    }
  );
};

/**
 * Генерация Refresh Token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      userId,
      type: "refresh",
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiry,
      issuer: "fullstack-app",
      audience: "fullstack-app-client",
    }
  );
};

/**
 * Верификация Access Token
 */
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: "fullstack-app",
      audience: "fullstack-app-client",
    });

    if (decoded.type !== "access") {
      throw new UnauthorizedError("Invalid token type");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Invalid token");
    }
    throw error;
  }
};

/**
 * Верификация Refresh Token
 */
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: "fullstack-app",
      audience: "fullstack-app-client",
    });

    if (decoded.type !== "refresh") {
      throw new UnauthorizedError("Invalid token type");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Refresh token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Invalid refresh token");
    }
    throw error;
  }
};

/**
 * Декодировать токен без верификации (для debugging)
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Генерация пары токенов
 */
export const generateTokenPair = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);

  return { accessToken, refreshToken };
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  generateTokenPair,
};
