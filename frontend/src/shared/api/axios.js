import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ⚠️ УЛУЧШЕНО: Расширен список чувствительных полей
const SENSITIVE_FIELDS = [
  "password",
  "newPassword",
  "oldPassword",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "captchaToken",
  "resetToken",
  "verificationToken",
];

/**
 * Рекурсивно скрывает чувствительные данные
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  const sanitized = { ...data };
  for (const key in sanitized) {
    if (
      SENSITIVE_FIELDS.some((field) =>
        key.toLowerCase().includes(field.toLowerCase())
      )
    ) {
      sanitized[key] = "***REDACTED***";
    } else if (typeof sanitized[key] === "object") {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  return sanitized;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(
        `🚀 ${config.method.toUpperCase()} ${config.url}`,
        sanitizeData(config.data)
      );
    }

    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error("❌ Request Error:", error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.config.method.toUpperCase()} ${response.config.url}`,
        sanitizeData(response.data)
      );
    }

    return response;
  },
  (error) => {
    const customError = {
      message: "An error occurred",
      code: "UNKNOWN_ERROR",
      status: error.response?.status,
      original: error,
    };

    if (error.response) {
      // Server responded with error status
      const { data, status } = error.response;

      customError.message =
        data?.error?.message || data?.message || "Server error";
      customError.code = data?.error?.code || "SERVER_ERROR";
      customError.status = status;
      customError.errors = data?.error?.errors;

      if (import.meta.env.DEV) {
        console.error(
          `❌ ${status} ${error.config.method.toUpperCase()} ${
            error.config.url
          }`,
          data
        );
      }

      // Friendly messages for common status codes
      if (status === 403) {
        customError.message = "You do not have permission";
      } else if (status === 404) {
        customError.message = "Resource not found";
      } else if (status === 422) {
        customError.message = data?.error?.message || "Validation failed";
      } else if (status === 429) {
        customError.message = "Too many requests. Please try again later";
      } else if (status >= 500) {
        customError.message = "Server error. Please try again later";
      }
    } else if (error.request) {
      // Request made but no response received
      customError.message = "No response from server. Check your connection";
      customError.code = "NO_RESPONSE";

      if (import.meta.env.DEV) {
        console.error("❌ No response:", error.request);
      }
    } else {
      // Error in request setup
      customError.message = error.message || "Request failed";
      customError.code = "REQUEST_ERROR";

      if (import.meta.env.DEV) {
        console.error("❌ Request setup error:", error.message);
      }
    }

    return Promise.reject(customError);
  }
);

export default api;
