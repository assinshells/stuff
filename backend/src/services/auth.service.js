import crypto from "crypto";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { jwtService } from "./jwt.service.js";
import { emailService } from "./email.service.js";
import { captchaService } from "./captcha.service.js";
import { logger } from "../utils/logger.js";

class AuthService {
  async register({ username, password, email, captchaToken }) {
    // Verify captcha
    const isCaptchaValid = await captchaService.verify(captchaToken);
    if (!isCaptchaValid) {
      throw ApiError.badRequest("Invalid captcha");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, ...(email ? [{ email }] : [])],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw ApiError.conflict("Username already exists");
      }
      if (email && existingUser.email === email) {
        throw ApiError.conflict("Email already exists");
      }
    }

    // Create user
    const user = await User.create({
      username,
      password,
      email: email || undefined,
    });

    // Send welcome email if email provided
    if (email) {
      await emailService.sendWelcomeEmail(email, username);
    }

    // Generate tokens
    const accessToken = jwtService.generateAccessToken(user._id);
    const refreshToken = jwtService.generateRefreshToken(user._id);

    // Save refresh token
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
    });
    await user.save();

    logger.info({ userId: user._id, username }, "User registered successfully");

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  async login({ username, password }) {
    // Find user and include password field
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Account is deactivated");
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    // Generate tokens
    const accessToken = jwtService.generateAccessToken(user._id);
    const refreshToken = jwtService.generateRefreshToken(user._id);

    // Save refresh token
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
    });

    // Keep only last 5 refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    logger.info({ userId: user._id, username }, "User logged in successfully");

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken) {
    // Verify token
    let decoded;
    try {
      decoded = jwtService.verifyToken(refreshToken);
    } catch (error) {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    if (decoded.type !== "refresh") {
      throw ApiError.unauthorized("Invalid token type");
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("User not found or inactive");
    }

    const tokenExists = user.refreshTokens.some(
      (t) => t.token === refreshToken
    );
    if (!tokenExists) {
      throw ApiError.unauthorized("Refresh token not found");
    }

    // Generate new tokens
    const newAccessToken = jwtService.generateAccessToken(user._id);
    const newRefreshToken = jwtService.generateRefreshToken(user._id);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== refreshToken
    );
    user.refreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date(),
    });

    await user.save();

    logger.info({ userId: user._id }, "Tokens refreshed successfully");

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId, refreshToken) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Remove refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== refreshToken
    );
    await user.save();

    logger.info({ userId }, "User logged out successfully");
  }

  async requestPasswordReset({ username, email, captchaToken }) {
    // Verify captcha
    const isCaptchaValid = await captchaService.verify(captchaToken);
    if (!isCaptchaValid) {
      throw ApiError.badRequest("Invalid captcha");
    }

    // Find user by username or email
    const query = {};
    if (username) query.username = username;
    if (email) query.email = email;

    if (Object.keys(query).length === 0) {
      throw ApiError.badRequest("Username or email is required");
    }

    const user = await User.findOne(query);

    // Don't reveal if user exists or not for security
    if (!user) {
      logger.warn(
        { username, email },
        "Password reset requested for non-existent user"
      );
      return {
        message: "If the account exists, a password reset link will be sent",
      };
    }

    if (!user.email) {
      throw ApiError.badRequest("No email associated with this account");
    }

    // Generate reset token using JWT
    const resetToken = jwtService.generatePasswordResetToken(user._id);

    // Save hashed token to database
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    logger.info({ userId: user._id }, "Password reset requested");

    return { message: "Password reset link sent to email" };
  }

  async resetPassword({ token, newPassword }) {
    // Verify token
    let decoded;
    try {
      decoded = jwtService.verifyToken(token);
    } catch (error) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }

    if (decoded.type !== "reset") {
      throw ApiError.badRequest("Invalid token type");
    }

    // Find user with valid reset token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      _id: decoded.userId,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions

    await user.save();

    logger.info({ userId: user._id }, "Password reset successfully");

    return { message: "Password reset successful" };
  }

  async checkUserExists(username) {
    const user = await User.findOne({ username });
    return {
      exists: !!user,
      username: user?.username,
      email: user?.email,
    };
  }
}

export const authService = new AuthService();
export default authService;
