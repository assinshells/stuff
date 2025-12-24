import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { database } from "./config/database.js";
import { logger } from "./utils/logger.js";

class Server {
  constructor() {
    this.httpServer = null;
    this.isShuttingDown = false;
  }

  async start() {
    try {
      // Connect to database
      logger.info("Connecting to MongoDB...");
      await database.connect();

      // Create HTTP server
      this.httpServer = http.createServer(app);

      // Start listening
      await new Promise((resolve) => {
        this.httpServer.listen(ENV.PORT, () => {
          logger.info(
            `Server running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`
          );
          resolve();
        });
      });

      // Setup graceful shutdown handlers
      this.setupShutdownHandlers();
    } catch (error) {
      logger.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  setupShutdownHandlers() {
    const gracefulShutdown = async (signal) => {
      if (this.isShuttingDown) {
        logger.warn("Shutdown already in progress...");
        return;
      }

      this.isShuttingDown = true;
      logger.info(`${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      if (this.httpServer) {
        this.httpServer.close(async () => {
          logger.info("HTTP server closed");

          try {
            // Close database connection
            await database.disconnect();
            logger.info("Graceful shutdown completed");
            process.exit(0);
          } catch (error) {
            logger.error("Error during shutdown:", error);
            process.exit(1);
          }
        });
      }

      // Force shutdown after timeout
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught errors
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("UNHANDLED_REJECTION");
    });
  }
}

// Start server
const server = new Server();
server.start();
