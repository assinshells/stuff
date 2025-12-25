import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user.toJSON();
  }

  async updateProfile(userId, data) {
    const { email } = data;

    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        throw ApiError.conflict("Email already in use");
      }
      user.email = email;
    }

    await user.save();

    logger.info({ userId }, "User profile updated");

    return user.toJSON();
  }

  async changePassword(userId, data) {
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest("Current and new password are required");
    }

    if (newPassword.length < 6) {
      throw ApiError.badRequest("New password must be at least 6 characters");
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    logger.info({ userId }, "User password changed");

    return true;
  }

  async deleteAccount(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    await User.findByIdAndDelete(userId);

    logger.info({ userId }, "User account deleted");

    return true;
  }
}

export const userService = new UserService();
export default userService;
