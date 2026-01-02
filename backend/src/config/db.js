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

    // Отключаем устаревшие режимы
    mongoose.set("strictQuery", false);

    // События подключения
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
  }

  /**
   * Подключение к базе данных
   */
  async connect() {
    try {
      await mongoose.connect(config.db.uri, config.db.options);
      logger.info("Database connection established");
    } catch (error) {
      logger.error("Failed to connect to database:", error);
      // В production не падаем сразу, даем время на переподключение
      if (config.isProduction) {
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
    return {
      connected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
    };
  }
}

// Singleton pattern
export default new Database();
