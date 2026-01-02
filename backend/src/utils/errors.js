/**
 * Кастомные классы ошибок для приложения
 *
 * Преимущества:
 * - Стандартизированные ошибки по всему приложению
 * - Автоматические HTTP статусы
 * - Легкая обработка в middleware
 * - Читаемый код
 */

/**
 * Базовый класс для всех ошибок приложения
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Отличаем от программных ошибок

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - неверный запрос
 * Используется при валидации входных данных
 */
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400, "BAD_REQUEST");
  }
}

/**
 * 401 Unauthorized - не авторизован
 * Требуется авторизация для доступа
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * 403 Forbidden - доступ запрещен
 * Пользователь авторизован, но не имеет прав
 */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * 404 Not Found - ресурс не найден
 * Самая частая ошибка
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

/**
 * 409 Conflict - конфликт данных
 * Например, дубликат email при регистрации
 */
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409, "CONFLICT");
  }
}

/**
 * 422 Unprocessable Entity - ошибка валидации
 * Используется с Joi или другими валидаторами
 */
export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = []) {
    super(message, 422, "VALIDATION_ERROR");
    this.errors = errors; // Массив ошибок валидации
  }
}

/**
 * 500 Internal Server Error - внутренняя ошибка
 * Используется для неожиданных ошибок
 */
export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, "INTERNAL_ERROR");
  }
}

/**
 * 503 Service Unavailable - сервис недоступен
 * Используется при проблемах с БД или внешними сервисами
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable") {
    super(message, 503, "SERVICE_UNAVAILABLE");
  }
}
