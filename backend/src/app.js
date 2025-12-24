import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ENV } from "./config/env.js";
import routes from "./routes/index.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import ApiError from "./utils/ApiError.js";

class App {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddlewares() {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: ENV.CORS_ORIGIN,
        credentials: true,
      })
    );

    // Body parsers
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging
    this.app.use(requestLogger);
  }

  setupRoutes() {
    // API routes
    this.app.use("/api", routes);

    // 404 handler
    this.app.use((req, res, next) => {
      next(ApiError.notFound("Route not found"));
    });
  }

  setupErrorHandling() {
    // Centralized error handler
    this.app.use(errorHandler);
  }

  getExpressApp() {
    return this.app;
  }
}

export const appInstance = new App();
export default appInstance.getExpressApp();
