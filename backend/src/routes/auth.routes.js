import { Router } from "express";
import Joi from "joi";
import {
  checkUser,
  login,
  register,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  authLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = Router();

/**
 * Joi схемы валидации
 */

const checkUserSchema = Joi.object({
  credential: Joi.string().required().trim().messages({
    "string.empty": "Nickname or email is required",
  }),
});

const loginSchema = Joi.object({
  credential: Joi.string().required().trim().messages({
    "string.empty": "Nickname or email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

const registerSchema = Joi.object({
  nickname: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-z0-9_]+$/)
    .required()
    .trim()
    .lowercase()
    .messages({
      "string.empty": "Nickname is required",
      "string.min": "Nickname must be at least 3 characters",
      "string.max": "Nickname cannot exceed 30 characters",
      "string.pattern.base":
        "Nickname can only contain lowercase letters, numbers and underscores",
    }),

  password: Joi.string().min(8).max(100).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password cannot exceed 100 characters",
  }),

  email: Joi.string().email().trim().lowercase().optional().allow("").messages({
    "string.email": "Please provide a valid email",
  }),

  captchaToken: Joi.string().optional().allow(""),
});

const forgotPasswordSchema = Joi.object({
  credential: Joi.string().required().trim().messages({
    "string.empty": "Nickname or email is required",
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "Reset token is required",
  }),

  newPassword: Joi.string().min(8).max(100).required().messages({
    "string.empty": "New password is required",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password cannot exceed 100 characters",
  }),
});

/**
 * Роуты
 */

// POST /api/auth/check - проверить существование пользователя
router.post("/check", validateBody(checkUserSchema), checkUser);

// POST /api/auth/login - войти
router.post("/login", authLimiter, validateBody(loginSchema), login);

// POST /api/auth/register - зарегистрироваться
router.post("/register", authLimiter, validateBody(registerSchema), register);

// POST /api/auth/refresh - обновить токены
router.post("/refresh", refresh);

// POST /api/auth/logout - выйти
router.post("/logout", requireAuth, logout);

// POST /api/auth/forgot-password - запросить сброс пароля
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateBody(forgotPasswordSchema),
  forgotPassword
);

// POST /api/auth/reset-password - сбросить пароль
router.post(
  "/reset-password",
  passwordResetLimiter,
  validateBody(resetPasswordSchema),
  resetPassword
);

// GET /api/auth/me - получить текущего пользователя
router.get("/me", requireAuth, getMe);

export default router;
