import pino from "pino";
import { ENV } from "../config/env.js";

// Pino configuration
const pinoConfig = {
  level: ENV.LOG_LEVEL,
  transport: ENV.isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

export const logger = pino(pinoConfig);

export default logger;
