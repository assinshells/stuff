import dotenv from "dotenv";

// Загружаем переменные окружения
dotenv.config();

/**
 * Валидация обязательных переменных окружения
 * Предотвращает запуск приложения с неполной конфигурацией
 */
const requiredEnvVars = ["NODE_ENV", "PORT", "MONGODB_URI", "CORS_ORIGIN"];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}\n` +
      "Please check your .env file"
  );
}

/**
 * Централизованная конфигурация приложения
 * Все настройки в одном месте для легкой поддержки
 */
export const config = {
  // Окружение
  env: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Сервер
  port: parseInt(process.env.PORT, 10),

  // База данных
  db: {
    uri: process.env.MONGODB_URI,
    options: {
      // Настройки для production
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
    },
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },

  // Логирование
  log: {
    level: process.env.LOG_LEVEL || "info",
  },
};

export default config;
