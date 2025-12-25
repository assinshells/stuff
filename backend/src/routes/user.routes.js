import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get current user profile
router.get("/profile", userController.getProfile.bind(userController));

// Update user profile
router.put("/profile", userController.updateProfile.bind(userController));

// Change password
router.post(
  "/change-password",
  userController.changePassword.bind(userController)
);

// Delete account
router.delete("/account", userController.deleteAccount.bind(userController));

export default router;
