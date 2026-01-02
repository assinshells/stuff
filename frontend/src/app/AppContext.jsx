import { createContext, useContext, useState, useCallback } from "react";

/**
 * Глобальное состояние приложения
 *
 * Управляет:
 * - Loading состояния
 * - Глобальные ошибки
 * - Уведомления
 * - Другие общие данные
 */

const AppContext = createContext(null);

/**
 * Provider для глобального состояния
 */
export const AppProvider = ({ children }) => {
  // Loading состояние
  const [isLoading, setIsLoading] = useState(false);

  // Глобальные ошибки
  const [error, setError] = useState(null);

  // Уведомления (toast)
  const [notification, setNotification] = useState(null);

  /**
   * Показать уведомление
   * @param {string} message - Текст уведомления
   * @param {string} type - Тип: 'success' | 'error' | 'info' | 'warning'
   */
  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type, id: Date.now() });

    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  }, []);

  /**
   * Показать ошибку
   * @param {Error|Object|string} err - Ошибка
   */
  const showError = useCallback(
    (err) => {
      const errorMessage = err?.message || err || "An error occurred";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    },
    [showNotification]
  );

  /**
   * Очистить ошибку
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Wrapper для async операций с автоматическим loading
   * @param {Function} asyncFn - Async функция
   * @returns {Promise} - Результат функции
   */
  const withLoading = useCallback(
    async (asyncFn) => {
      setIsLoading(true);
      clearError();

      try {
        const result = await asyncFn();
        return result;
      } catch (err) {
        showError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, showError]
  );

  const value = {
    // State
    isLoading,
    error,
    notification,

    // Actions
    setIsLoading,
    setError,
    clearError,
    showError,
    showNotification,
    withLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook для использования App Context
 */
export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
};

export default AppContext;
