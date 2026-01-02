import { verifyAccessToken } from "../utils/jwt.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import User from "../models/User.js";

/**
 * Middleware для проверки авторизации
 *
 * Проверяет наличие и валидность JWT токена
 * Добавляет пользователя в req.user
 */

/**
 * Извлечь токен из заголовка или cookie
 */
const extractToken = (req) => {
  // 1. Из Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // 2. Из cookie (для SSR или альтернативного хранения)
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

/**
 * Требовать авторизацию
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Извлекаем токен
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError("No authentication token provided");
    }

    // Верифицируем токен
    const decoded = verifyAccessToken(token);

    // Загружаем пользователя из БД
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Проверяем активность
    if (!user.isActive) {
      throw new UnauthorizedError("User account is deactivated");
    }

    // Проверяем блокировку
    if (user.isLocked) {
      throw new UnauthorizedError(
        "Account is temporarily locked. Try again later"
      );
    }

    // Добавляем пользователя в request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Опциональная авторизация
 * Не требует токен, но если есть - проверяет
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (user && user.isActive && !user.isLocked) {
      req.user = user;
      req.userId = user._id;
    }

    next();
  } catch (error) {
    // Игнорируем ошибки в optional режиме
    next();
  }
};

/**
 * Требовать конкретную роль
 * Использовать ПОСЛЕ requireAuth
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!req.user.hasRole(...roles)) {
      return next(
        new ForbiddenError(`Access denied. Required roles: ${roles.join(", ")}`)
      );
    }

    next();
  };
};

/**
 * Требовать админские права
 */
export const requireAdmin = requireRole("admin");

/**
 * Проверка владельца ресурса
 * Пользователь может получить доступ только к своим данным
 * (или админ к любым)
 */
export const requireOwnerOrAdmin = (getUserIdFromReq) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const resourceUserId = getUserIdFromReq(req);

    // Админ может все
    if (req.user.hasRole("admin")) {
      return next();
    }

    // Пользователь может только свои ресурсы
    if (req.user._id.toString() !== resourceUserId.toString()) {
      return next(new ForbiddenError("Access denied"));
    }

    next();
  };
};

export default {
  requireAuth,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireOwnerOrAdmin,
};
