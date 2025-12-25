import { userService } from "../services/user.service.js";

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.userId, req.body);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      await userService.changePassword(req.userId, req.body);

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      await userService.deleteAccount(req.userId);

      res.status(200).json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
export default userController;
