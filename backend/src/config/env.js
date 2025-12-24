import { config } from "dotenv";

// Load environment variables
config();

const requiredEnvVars = ["NODE_ENV", "PORT", "MONGODB_URI"];

// Validate required environment variables
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,

  // Optional configurations
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  // Computed properties
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

export default ENV;
