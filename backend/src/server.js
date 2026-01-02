import app from "./app.js";
import { config } from "./config/env.js";
import database from "./config/db.js";
import logger from "./utils/logger.js";

/**
 * Точка входа сервера
 *
 * Последовательность запуска:
 * 1. Подключение к БД
 * 2. Запуск HTTP сервера
 * 3. Настройка graceful shutdown
 */

let server;

/**
 * Запуск сервера
 */
async function startServer() {
  try {
    // 1. Подключаемся к базе данных
    logger.info("Connecting to database...");
    await database.connect();

    // 2. Запускаем HTTP сервер
    server = app.listen(config.port, () => {
      logger.info(
        {
          port: config.port,
          env: config.env,
          nodeVersion: process.version,
        },
        `Server started successfully`
      );

      // Логируем доступные эндпоинты
      logger.info(`Health check: http://localhost:${config.port}/health`);
      logger.info(`API endpoint: http://localhost:${config.port}/api/users`);
    });

    // Таймауты для долгих запросов
    server.timeout = 60000; // 60 секунд
    server.keepAliveTimeout = 65000; // чуть больше timeout
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 * Корректное завершение работы при остановке процесса
 */
async function gracefulShutdown(signal) {
  logger.info(`${signal} received, starting graceful shutdown...`);

  // Останавливаем прием новых подключений
  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed");

      try {
        // Отключаемся от БД
        await database.disconnect();
        logger.info("Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown:", error);
        process.exit(1);
      }
    });

    // Форсированное завершение если не успели за 30 секунд
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 30000);
  }
}

/**
 * Обработчики сигналов завершения
 */
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

/**
 * Обработка необработанных ошибок
 * Последняя линия защиты
 */
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  // В production лучше перезапустить процесс
  if (config.isProduction) {
    gracefulShutdown("UNHANDLED_REJECTION");
  }
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  // При uncaught exception нужно обязательно перезапустить
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

// Запускаем сервер
startServer();
