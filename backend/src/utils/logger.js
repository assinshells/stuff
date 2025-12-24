import { ENV } from "../config/env.js";

const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor(level = "info") {
    this.level = LogLevel[level.toUpperCase()] ?? LogLevel.INFO;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString =
      Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  error(message, meta = {}) {
    if (this.level >= LogLevel.ERROR) {
      console.error(this.formatMessage("ERROR", message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this.level >= LogLevel.WARN) {
      console.warn(this.formatMessage("WARN", message, meta));
    }
  }

  info(message, meta = {}) {
    if (this.level >= LogLevel.INFO) {
      console.log(this.formatMessage("INFO", message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this.level >= LogLevel.DEBUG) {
      console.log(this.formatMessage("DEBUG", message, meta));
    }
  }
}

export const logger = new Logger(ENV.LOG_LEVEL);
export default logger;
