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
 * Auth Controller - бизнес-логика аутентификации
 */

/**
 * CHECK USER - проверка существования пользователя
 * POST /api/auth/check
 * Body: { credential } - nickname или email
 */
export const checkUser = async (req, res) => {
  const { credential } = req.body;

  const user = await User.findByCredential(credential);

  if (!user) {
    // Пользователь не найден - нужна регистрация
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

  // Пользователь найден - нужен пароль
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
 * LOGIN - вход пользователя
 * POST /api/auth/login
 * Body: { credential, password }
 */
export const login = async (req, res) => {
  const { credential, password } = req.body;

  // Находим пользователя
  const user = await User.findByCredential(credential);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Проверяем блокировку
  if (user.isLocked) {
    logger.warn({ userId: user._id }, "Login attempt on locked account");
    throw new UnauthorizedError(
      "Account is temporarily locked due to multiple failed attempts"
    );
  }

  // Проверяем активность
  if (!user.isActive) {
    throw new UnauthorizedError("Account is deactivated");
  }

  // Проверяем пароль (защита от timing attacks через constant-time comparison)
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Увеличиваем счетчик неудачных попыток
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

  // Успешный вход - сбрасываем счетчик
  await user.resetLoginAttempts();

  // Генерируем токены
  const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

  // Сохраняем refresh token в БД
  user.refreshTokens.push({
    token: refreshToken,
  });
  await user.save();

  logger.info({ userId: user._id }, "User logged in successfully");

  // Устанавливаем refresh token в httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
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
 * REGISTER - регистрация нового пользователя
 * POST /api/auth/register
 * Body: { nickname, password, email?, captchaToken }
 */
export const register = async (req, res) => {
  const { nickname, password, email, captchaToken } = req.body;

  // Валидация captcha
  await validateCaptcha(captchaToken);

  // Проверяем уникальность nickname
  const existingUser = await User.findOne({
    nickname: nickname.toLowerCase(),
  });

  if (existingUser) {
    throw new ConflictError("Nickname already exists");
  }

  // Проверяем уникальность email (если указан)
  if (email) {
    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      throw new ConflictError("Email already exists");
    }
  }

  // Создаем пользователя
  const user = await User.create({
    nickname: nickname.toLowerCase(),
    password,
    email: email ? email.toLowerCase() : undefined,
  });

  logger.info({ userId: user._id, nickname }, "New user registered");

  // Автоматически логиним пользователя
  const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  // Устанавливаем refresh token в cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
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
 * REFRESH - обновление access token
 * POST /api/auth/refresh
 */
export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new UnauthorizedError("Refresh token not found");
  }

  // Верифицируем refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Находим пользователя
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  // Проверяем что токен есть в БД
  const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken);

  if (!tokenExists) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  // Генерируем новую пару токенов
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(
    user._id,
    user.role
  );

  // Заменяем старый refresh token на новый
  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.token !== refreshToken
  );
  user.refreshTokens.push({ token: newRefreshToken });
  await user.save();

  // Обновляем cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
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
 * LOGOUT - выход пользователя
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken && req.user) {
    // Удаляем refresh token из БД
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (t) => t.token !== refreshToken
    );
    await req.user.save();

    logger.info({ userId: req.user._id }, "User logged out");
  }

  // Очищаем cookie
  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "Logout successful",
  });
};

/**
 * FORGOT PASSWORD - запрос на сброс пароля
 * POST /api/auth/forgot-password
 * Body: { credential } - nickname или email
 */
export const forgotPassword = async (req, res) => {
  const { credential } = req.body;

  const user = await User.findByCredential(credential);

  if (!user) {
    // Для безопасности всегда возвращаем успех
    logger.warn(
      { credential },
      "Password reset requested for non-existent user"
    );

    return res.json({
      success: true,
      message: "If the user exists, a password reset email has been sent",
    });
  }

  // Генерируем reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Сохраняем hash токена и время истечения
  user.passwordResetToken = resetTokenHash;
  user.passwordResetExpires = Date.now() + config.security.passwordResetExpiry;
  await user.save();

  // Отправляем email (или логируем в DEV)
  try {
    await sendPasswordResetEmail(user, resetToken);
  } catch (error) {
    logger.error(
      { userId: user._id, error },
      "Failed to send password reset email"
    );
    // Не пробрасываем ошибку - для безопасности
  }

  logger.info({ userId: user._id }, "Password reset requested");

  res.json({
    success: true,
    message: "If the user exists, a password reset email has been sent",
  });
};

/**
 * RESET PASSWORD - установка нового пароля
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  // Хешируем токен для поиска
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Находим пользователя по токену
  const user = await User.findByPasswordResetToken(resetTokenHash);

  if (!user) {
    throw new ValidationError("Invalid or expired reset token");
  }

  // Устанавливаем новый пароль
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Очищаем все refresh токены (logout везде)
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
 * GET ME - получить текущего пользователя
 * GET /api/auth/me
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
