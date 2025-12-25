import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.alphanum": "Username must contain only alphanumeric characters",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must be at most 30 characters",
    "any.required": "Username is required",
  }),

  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must be at most 128 characters",
    "any.required": "Password is required",
  }),

  email: Joi.string().email().optional().allow("", null).messages({
    "string.email": "Invalid email format",
  }),

  captchaToken: Joi.string().required().messages({
    "any.required": "Captcha verification is required",
  }),
});

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Username is required",
  }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token is required",
  }),
});

export const requestPasswordResetSchema = Joi.object({
  username: Joi.string().optional(),

  email: Joi.string().email().optional().messages({
    "string.email": "Invalid email format",
  }),

  captchaToken: Joi.string().required().messages({
    "any.required": "Captcha verification is required",
  }),
})
  .or("username", "email")
  .messages({
    "object.missing": "Either username or email is required",
  });

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Reset token is required",
  }),

  newPassword: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must be at most 128 characters",
    "any.required": "New password is required",
  }),
});

export const checkUserSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Username is required",
  }),
});

export default {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  checkUserSchema,
};
