import api from "./axios";

/**
 * Auth API Service
 */

export const authApi = {
  /**
   * Проверить существование пользователя
   */
  checkUser: async (credential) => {
    const response = await api.post("/auth/check", { credential });
    return response.data;
  },

  /**
   * Войти
   */
  login: async (credential, password) => {
    const response = await api.post("/auth/login", {
      credential,
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
   * Запросить сброс пароля
   */
  forgotPassword: async (credential) => {
    const response = await api.post("/auth/forgot-password", { credential });
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
