import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  checkUserSchema,
} from "../validations/auth.validation.js";

const router = Router();

// Public routes
router.post(
  "/register",
  validate(registerSchema),
  authController.register.bind(authController)
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController)
);

router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

router.post(
  "/request-password-reset",
  validate(requestPasswordResetSchema),
  authController.requestPasswordReset.bind(authController)
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

router.post(
  "/check-user",
  validate(checkUserSchema),
  authController.checkUser.bind(authController)
);

// Protected routes
router.post(
  "/logout",
  authenticate,
  authController.logout.bind(authController)
);

router.get(
  "/me",
  authenticate,
  authController.getCurrentUser.bind(authController)
);

export default router;
