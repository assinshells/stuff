import axios from "axios";

/**
 * Централизованный Axios instance
 *
 * Преимущества:
 * - Единая точка конфигурации
 * - Глобальные interceptors
 * - Автоматическая обработка ошибок
 * - Легкое добавление авторизации
 */

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000, // 10 секунд
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Выполняется перед каждым запросом
 */
api.interceptors.request.use(
  (config) => {
    // Можно добавить токен авторизации
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    // Логируем запросы в development
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
 * Обрабатывает все ответы и ошибки
 */
api.interceptors.response.use(
  (response) => {
    // Успешный ответ - возвращаем только data
    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.config.method.toUpperCase()} ${response.config.url}`,
        response.data
      );
    }

    return response.data;
  },
  (error) => {
    // Обработка ошибок
    const customError = {
      message: "An error occurred",
      code: "UNKNOWN_ERROR",
      status: error.response?.status,
    };

    if (error.response) {
      // Сервер ответил с ошибкой
      const { data, status } = error.response;

      customError.message = data?.error?.message || "Server error";
      customError.code = data?.error?.code || "SERVER_ERROR";
      customError.status = status;
      customError.errors = data?.error?.errors; // Валидация

      // Логируем в development
      if (import.meta.env.DEV) {
        console.error(
          `❌ ${status} ${error.config.method.toUpperCase()} ${
            error.config.url
          }`,
          data
        );
      }

      // Специальная обработка статусов
      if (status === 401) {
        // Unauthorized - можно редиректить на логин
        customError.message = "Please log in to continue";
      } else if (status === 403) {
        // Forbidden
        customError.message = "You do not have permission";
      } else if (status === 404) {
        // Not Found
        customError.message = "Resource not found";
      } else if (status >= 500) {
        // Server errors
        customError.message = "Server error. Please try again later";
      }
    } else if (error.request) {
      // Запрос отправлен, но нет ответа
      customError.message = "No response from server. Check your connection";
      customError.code = "NO_RESPONSE";
    } else {
      // Ошибка при настройке запроса
      customError.message = error.message;
      customError.code = "REQUEST_ERROR";
    }

    return Promise.reject(customError);
  }
);

export default api;
