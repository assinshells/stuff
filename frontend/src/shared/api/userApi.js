import api from "./axios";

/**
 * User API Service
 *
 * Централизация всех API вызовов для пользователей
 *
 * Преимущества:
 * - Единое место для всех запросов
 * - Легко тестировать
 * - Легко менять логику запросов
 * - Типизация в TypeScript
 */

export const userApi = {
  /**
   * Получить список пользователей
   * @param {Object} params - Параметры запроса (page, limit, role, isActive)
   * @returns {Promise<Object>} - Список пользователей с пагинацией
   */
  getAll: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data; // Возвращаем только data
  },

  /**
   * Получить пользователя по ID
   * @param {string} id - ID пользователя
   * @returns {Promise<Object>} - Данные пользователя
   */
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Создать нового пользователя
   * @param {Object} userData - Данные пользователя
   * @returns {Promise<Object>} - Созданный пользователь
   */
  create: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  /**
   * Обновить пользователя
   * @param {string} id - ID пользователя
   * @param {Object} userData - Новые данные
   * @returns {Promise<Object>} - Обновленный пользователь
   */
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Удалить пользователя
   * @param {string} id - ID пользователя
   * @returns {Promise<Object>} - Результат удаления
   */
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Получить статистику пользователей
   * @returns {Promise<Object>} - Статистика
   */
  getStats: async () => {
    const response = await api.get("/users/stats");
    return response.data;
  },
};

export default userApi;
