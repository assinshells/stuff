import { config } from "../config/env.js";
import { logError } from "../utils/logger.js";
import { AppError } from "../utils/errors.js";

/**
 * Централизованный обработчик ошибок
 *
 * Функции:
 * - Обработка всех ошибок в одном месте
 * - Логирование ошибок
 * - Форматирование ответа клиенту
 * - Скрытие деталей в production
 * - Обработка специфичных ошибок (MongoDB, Validation)
 */

/**
 * Обработчик ошибок MongoDB
 */
const handleMongoError = (err) => {
  // Дубликат ключа (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return {
      statusCode: 409,
      code: "DUPLICATE_KEY",
      message: `${field} already exists`,
    };
  }

  // Ошибка валидации Mongoose
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return {
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors,
    };
  }

  // Неверный ObjectId
  if (err.name === "CastError") {
    return {
      statusCode: 400,
      code: "INVALID_ID",
      message: `Invalid ${err.path}: ${err.value}`,
    };
  }

  return null;
};

/**
 * Главный обработчик ошибок
 */
export const errorHandler = (err, req, res, next) => {
  // Логируем ошибку с контекстом
  logError(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    body: req.body,
  });

  // Базовые значения
  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "Internal server error";
  let errors = undefined;

  // Обработка кастомных ошибок
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    errors = err.errors;
  }
  // Обработка MongoDB ошибок
  else {
    const mongoError = handleMongoError(err);
    if (mongoError) {
      ({ statusCode, code, message, errors } = mongoError);
    }
  }

  // В development показываем стек
  const response = {
    success: false,
    error: {
      code,
      message,
      ...(errors && { errors }),
      ...(config.isDevelopment && {
        stack: err.stack,
        raw: err.message,
      }),
    },
  };

  res.status(statusCode).json(response);
};

/**
 * Обработчик 404 (роут не найден)
 * Должен быть последним в цепочке middleware
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.url} not found`,
    },
  });
};
