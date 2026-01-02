import pino from "pino";
import { config } from "../config/env.js";

/**
 * Централизованная система логирования с Pino
 *
 * Преимущества Pino:
 * - Высокая производительность (быстрее чем Winston)
 * - Структурированные логи (JSON)
 * - Легкая интеграция с инструментами мониторинга
 * - Минимальное влияние на производительность
 */

const logger = pino({
  level: config.log.level,

  // В development режиме - красивый вывод
  // В production - JSON для парсинга
  transport: config.isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          singleLine: false,
          messageFormat: "{msg}",
        },
      }
    : undefined,

  // Дополнительные поля для всех логов
  base: {
    env: config.env,
    pid: process.pid,
  },

  // Форматирование временных меток
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

/**
 * Обертки для удобного логирования
 */

// HTTP запросы
export const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    // Разные уровни для разных статусов
    if (res.statusCode >= 500) {
      logger.error(logData, "HTTP Request");
    } else if (res.statusCode >= 400) {
      logger.warn(logData, "HTTP Request");
    } else {
      logger.info(logData, "HTTP Request");
    }
  });

  next();
};

// Ошибки с контекстом
export const logError = (error, context = {}) => {
  logger.error(
    {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    },
    "Application Error"
  );
};

export default logger;
