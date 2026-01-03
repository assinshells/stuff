import pino from "pino";
import { config } from "../config/env.js";

const logger = pino({
  level: config.log.level,
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
  base: {
    env: config.env,
    pid: process.pid,
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

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
