import axios from "axios";

/**
 * Централизованный Axios instance
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Request Interceptor
 */
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 */
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.config.method.toUpperCase()} ${response.config.url}`,
        response.data
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

      // Специальная обработка статусов (кроме 401 - его обрабатывает AuthContext)
      if (status === 403) {
        customError.message = "You do not have permission";
      } else if (status === 404) {
        customError.message = "Resource not found";
      } else if (status === 422) {
        customError.message = "Validation failed";
      } else if (status >= 500) {
        customError.message = "Server error. Please try again later";
      }
    } else if (error.request) {
      customError.message = "No response from server. Check your connection";
      customError.code = "NO_RESPONSE";
    } else {
      customError.message = error.message;
      customError.code = "REQUEST_ERROR";
    }

    return Promise.reject(customError);
  }
);

export default api;
