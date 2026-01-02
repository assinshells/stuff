import crypto from "crypto";
import User from "../models/User.js";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import { validateCaptcha } from "../utils/captcha.js";
import {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  ValidationError,
} from "../utils/errors.js";
import logger from "../utils/logger.js";
import { config } from "../config/env.js";

/**
 * Auth Controller
 */

/**
 * CHECK USER
 */
export const checkUser = async (req, res) => {
  const { credential } = req.body;

  const user = await User.findByCredential(credential);

  if (!user) {
    logger.info({ credential }, "User not found - registration required");

    return res.json({
      success: true,
      data: {
        exists: false,
        action: "register",
        message: "User not found. Please register",
      },
    });
  }

  logger.info(
    { userId: user._id, credential },
    "User found - password required"
  );

  res.json({
    success: true,
    data: {
      exists: true,
      action: "login",
      message: "User found. Please enter your password",
      user: {
        nickname: user.nickname,
        email: user.email,
      },
    },
  });
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  const { credential, password } = req.body;

  const user = await User.findByCredential(credential);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.isLocked) {
    logger.warn({ userId: user._id }, "Login attempt on locked account");
    throw new UnauthorizedError(
      "Account is temporarily locked due to multiple failed attempts"
    );
  }

  if (!user.isActive) {
    throw new UnauthorizedError("Account is deactivated");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    await user.incLoginAttempts();

    logger.warn(
      {
        userId: user._id,
        attempts: user.loginAttempts + 1,
      },
      "Failed login attempt"
    );

    throw new UnauthorizedError("Invalid credentials");
  }

  await user.resetLoginAttempts();

  const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
  });
  await user.save();

  logger.info({ userId: user._id }, "User logged in successfully");

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      accessToken,
      user: user.getPublicProfile(),
    },
    message: "Login successful",
  });
};

/**
 * REGISTER
 */
export const register = async (req, res) => {
  const { nickname, password, email, captchaToken } = req.body;

  await validateCaptcha(captchaToken);

  const existingUser = await User.findOne({
    nickname: nickname.toLowerCase(),
  });

  if (existingUser) {
    throw new ConflictError("Nickname already exists");
  }

  if (email) {
    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      throw new ConflictError("Email already exists");
    }
  }

  const user = await User.create({
    nickname: nickname.toLowerCase(),
    password,
    email: email ? email.toLowerCase() : undefined,
  });

  logger.info({ userId: user._id, nickname }, "New user registered");

  const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
  });
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    data: {
      accessToken,
      user: user.getPublicProfile(),
    },
    message: "Registration successful",
  });
};

/**
 * REFRESH
 */
export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    logger.warn("Refresh attempt without token");
    throw new UnauthorizedError("Refresh token not found");
  }

  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.userId);

  if (!user) {
    logger.warn(
      { userId: decoded.userId },
      "Refresh token for non-existent user"
    );
    throw new UnauthorizedError("User not found");
  }

  const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken);

  if (!tokenExists) {
    logger.warn({ userId: user._id }, "Invalid refresh token used");
    throw new UnauthorizedError("Invalid refresh token");
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(
    user._id,
    user.role
  );

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.token !== refreshToken
  );
  user.refreshTokens.push({
    token: newRefreshToken,
    createdAt: new Date(),
  });
  await user.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info({ userId: user._id }, "Tokens refreshed");

  res.json({
    success: true,
    data: {
      accessToken,
    },
  });
};

/**
 * LOGOUT
 */
export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken && req.user) {
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (t) => t.token !== refreshToken
    );
    await req.user.save();

    logger.info({ userId: req.user._id }, "User logged out");
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "strict" : "lax",
  });

  res.json({
    success: true,
    message: "Logout successful",
  });
};

/**
 * FORGOT PASSWORD
 */
export const forgotPassword = async (req, res) => {
  const { credential } = req.body;

  const user = await User.findByCredential(credential);

  if (!user) {
    logger.warn(
      { credential },
      "Password reset requested for non-existent user"
    );

    return res.json({
      success: true,
      message: "If the user exists, a password reset email has been sent",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = resetTokenHash;
  user.passwordResetExpires = Date.now() + config.security.passwordResetExpiry;
  await user.save();

  try {
    await sendPasswordResetEmail(user, resetToken);
  } catch (error) {
    logger.error(
      { userId: user._id, error },
      "Failed to send password reset email"
    );
  }

  logger.info({ userId: user._id }, "Password reset requested");

  res.json({
    success: true,
    message: "If the user exists, a password reset email has been sent",
  });
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const resetTokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findByPasswordResetToken(resetTokenHash);

  if (!user) {
    throw new ValidationError("Invalid or expired reset token");
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];

  await user.save();

  logger.info({ userId: user._id }, "Password reset successful");

  res.json({
    success: true,
    message:
      "Password has been reset successfully. Please login with your new password",
  });
};

/**
 * GET ME
 */
export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user.getPublicProfile(),
  });
};

export default {
  checkUser,
  login,
  register,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
