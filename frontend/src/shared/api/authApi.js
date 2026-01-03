import api from "./axios";

/**
 * Auth API Service
 */

export const authApi = {
  /**
   * Проверить существование пользователя (только nickname)
   */
  checkUser: async (nickname) => {
    const response = await api.post("/auth/check", { nickname });
    return response.data;
  },

  /**
   * Войти (только nickname)
   */
  login: async (nickname, password) => {
    const response = await api.post("/auth/login", {
      nickname,
      password,
    });
    return response.data;
  },

  /**
   * Зарегистрироваться
   */
  register: async (nickname, password, email, captchaToken) => {
    const response = await api.post("/auth/register", {
      nickname,
      password,
      email: email || undefined,
      captchaToken,
    });
    return response.data;
  },

  /**
   * Обновить токен
   */
  refresh: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  /**
   * Выйти
   */
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  /**
   * Запросить сброс пароля (только email)
   */
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Сбросить пароль
   */
  resetPassword: async (token, newPassword) => {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  /**
   * Получить текущего пользователя
   */
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export default authApi;
