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
    return api.get("/users", { params });
  },

  /**
   * Получить пользователя по ID
   * @param {string} id - ID пользователя
   * @returns {Promise<Object>} - Данные пользователя
   */
  getById: async (id) => {
    return api.get(`/users/${id}`);
  },

  /**
   * Создать нового пользователя
   * @param {Object} userData - Данные пользователя
   * @returns {Promise<Object>} - Созданный пользователь
   */
  create: async (userData) => {
    return api.post("/users", userData);
  },

  /**
   * Обновить пользователя
   * @param {string} id - ID пользователя
   * @param {Object} userData - Новые данные
   * @returns {Promise<Object>} - Обновленный пользователь
   */
  update: async (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  /**
   * Удалить пользователя
   * @param {string} id - ID пользователя
   * @returns {Promise<Object>} - Результат удаления
   */
  delete: async (id) => {
    return api.delete(`/users/${id}`);
  },

  /**
   * Получить статистику пользователей
   * @returns {Promise<Object>} - Статистика
   */
  getStats: async () => {
    return api.get("/users/stats");
  },
};

export default userApi;
