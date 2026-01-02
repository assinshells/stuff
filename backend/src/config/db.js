import mongoose from "mongoose";
import { config } from "./env.js";
import logger from "../utils/logger.js";

/**
 * Подключение к MongoDB с обработкой ошибок и переподключением
 */

class Database {
  constructor() {
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;

    // Настройка обработчиков событий
    this.setupEventListeners();
  }

  /**
   * Настройка обработчиков событий MongoDB
   */
  setupEventListeners() {
    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      logger.info("MongoDB: Connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      this.isConnected = false;
      logger.error("MongoDB: Connection error", err);
    });

    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
      logger.warn("MongoDB: Disconnected");

      // Автоматическое переподключение
      if (
        config.isProduction &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;
        logger.info(
          `MongoDB: Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
        );
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received, closing MongoDB connection...`);
      await this.disconnect();
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }

  /**
   * Подключение к базе данных
   */
  async connect() {
    try {
      // Настройки подключения
      const options = {
        ...config.db.options,
        autoIndex: config.isDevelopment,
        serverSelectionTimeoutMS: 5000,
      };

      await mongoose.connect(config.db.uri, options);
      logger.info("Database connection established");
    } catch (error) {
      logger.error("Failed to connect to database:", error);

      if (
        config.isProduction &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;
        logger.info(
          `Retrying database connection in ${
            this.reconnectInterval / 1000
          } seconds... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        setTimeout(() => this.connect(), this.reconnectInterval);
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        logger.error("Max reconnection attempts reached. Exiting...");
        process.exit(1);
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
