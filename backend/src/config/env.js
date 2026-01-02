import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "MONGODB_URI",
  "CORS_ORIGIN",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}\n` +
      "Please check your .env file"
  );
}

export const config = {
  // Окружение
  env: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Сервер
  port: parseInt(process.env.PORT, 10),

  // База данных
  db: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
    },
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },

  // Логирование
  log: {
    level: process.env.LOG_LEVEL || "info",
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  // Feature Flags
  features: {
    captcha: process.env.ENABLE_CAPTCHA === "true",
    email: process.env.ENABLE_EMAIL === "true",
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) * 60 * 1000 || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  authRateLimit: {
    windowMs:
      parseInt(process.env.AUTH_RATE_LIMIT_WINDOW, 10) * 60 * 1000 || 900000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 5,
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    passwordResetExpiry:
      parseInt(process.env.PASSWORD_RESET_EXPIRY, 10) || 3600000,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION, 10) || 900000,
  },
};

export default config;
