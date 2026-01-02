import express from "express";
import cors from "cors";
import helmet from "helmet";
import "express-async-errors"; // Автоматическая обработка async ошибок
import { config } from "./config/env.js";
import { httpLogger } from "./utils/logger.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user.routes.js";

/**
 * Express приложение
 *
 * Архитектура:
 * 1. Security middleware (helmet, cors)
 * 2. Парсинг тела запроса
 * 3. Логирование
 * 4. Роуты
 * 5. Обработка 404
 * 6. Обработка ошибок
 */

const app = express();

// ============= SECURITY =============

// Helmet - защита от известных веб-уязвимостей
app.use(helmet());

// CORS - настройка межсайтовых запросов
app.use(cors(config.cors));

// ============= ПАРСИНГ =============

// JSON body parser с лимитом размера
app.use(express.json({ limit: "10mb" }));

// URL-encoded данные (формы)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============= ЛОГИРОВАНИЕ =============

// HTTP запросы
app.use(httpLogger);

// ============= HEALTH CHECK =============

/**
 * Health check endpoint
 * Используется для мониторинга и load balancers
 */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
    },
  });
});

// ============= API РОУТЫ =============

/**
 * API v1
 * Версионирование API для обратной совместимости
 */
app.use("/api/users", userRoutes);

// Дополнительные роуты можно добавить здесь
// app.use('/api/posts', postRoutes);
// app.use('/api/comments', commentRoutes);

// ============= ROOT ENDPOINT =============

app.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      message: "API is running",
      version: "1.0.0",
      endpoints: {
        health: "/health",
        users: "/api/users",
      },
    },
  });
});

// ============= ERROR HANDLING =============

// 404 - должен быть перед error handler
app.use(notFoundHandler);

// Централизованная обработка ошибок
// Должна быть последней!
app.use(errorHandler);

export default app;
