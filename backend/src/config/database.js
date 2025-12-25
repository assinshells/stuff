import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { ENV } from "./env.js";

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      this.connection = await mongoose.connect(ENV.MONGODB_URI, options);

      logger.info(
        { host: this.connection.connection.host },
        "MongoDB connected"
      );

      // Handle connection events
      mongoose.connection.on("error", (err) => {
        logger.error({ err }, "MongoDB connection error");
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
      });

      mongoose.connection.on("reconnected", () => {
        logger.info("MongoDB reconnected");
      });

      return this.connection;
    } catch (error) {
      logger.error({ err: error }, "Failed to connect to MongoDB");
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        logger.info("MongoDB disconnected successfully");
      }
    } catch (error) {
      logger.error({ err: error }, "Error disconnecting from MongoDB");
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }
}

export const database = new Database();
export default database;
