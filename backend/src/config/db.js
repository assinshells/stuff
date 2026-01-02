import mongoose from "mongoose";
import { config } from "./env.js";
import logger from "../utils/logger.js";

/**
 * Подключение к MongoDB с обработкой ошибок и переподключением
 *
 * Особенности:
 * - Автоматическое переподключение при разрыве
 * - Логирование всех событий соединения
 * - Graceful shutdown
 * - Production-ready настройки
 */

class Database {
  constructor() {
    this.isConnected = false;

    // Настройка обработчиков событий
    this.setupEventListeners();
  }

  /**
   * Настройка обработчиков событий MongoDB
   */
  setupEventListeners() {
    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      logger.info("MongoDB: Connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      this.isConnected = false;
      logger.error("MongoDB: Connection error", err);
    });

    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
      logger.warn("MongoDB: Disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Подключение к базе данных
   */
  async connect() {
    try {
      // Настройки подключения
      const options = {
        ...config.db.options,
        // Дополнительные настройки для production
        autoIndex: config.isDevelopment, // Отключаем автоиндексацию в production
        serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера
      };

      await mongoose.connect(config.db.uri, options);
      logger.info("Database connection established");
    } catch (error) {
      logger.error("Failed to connect to database:", error);

      // В production не падаем сразу, даем время на переподключение
      if (config.isProduction) {
        logger.info("Retrying database connection in 5 seconds...");
        setTimeout(() => this.connect(), 5000);
      } else {
        process.exit(1);
      }
    }
  }

  /**
   * Отключение от базы данных
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      logger.info("Database connection closed");
    } catch (error) {
      logger.error("Error closing database connection:", error);
    }
  }

  /**
   * Проверка состояния подключения
   */
  getStatus() {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    return {
      connected: this.isConnected,
      readyState: states[mongoose.connection.readyState] || "unknown",
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// Singleton pattern
export default new Database();
