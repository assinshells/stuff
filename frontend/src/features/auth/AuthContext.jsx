import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../../shared/api/authApi";
import api from "../../shared/api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  /**
   * Сохранить токен и настроить axios
   */
  const saveToken = useCallback((token) => {
    setAccessToken(token);
    // Добавляем токен в заголовки axios
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  /**
   * Очистить токен
   */
  const clearToken = useCallback(() => {
    setAccessToken(null);
    delete api.defaults.headers.common["Authorization"];
  }, []);

  /**
   * Загрузить текущего пользователя
   */
  const loadUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      setUser(response.data);
      return response.data;
    } catch (error) {
      clearToken();
      setUser(null);
      throw error;
    }
  }, [clearToken]);

  /**
   * Автоматическое обновление токена при ошибке 401
   */
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Если 401 и это не повторный запрос
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Пробуем обновить токен
            const response = await authApi.refresh();
            const newToken = response.data.accessToken;

            // Сохраняем новый токен
            saveToken(newToken);

            // Повторяем оригинальный запрос с новым токеном
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Если refresh не удался - выходим
            clearToken();
            setUser(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [saveToken, clearToken]);

  /**
   * Проверить пользователя
   */
  const checkUser = useCallback(async (credential) => {
    const response = await authApi.checkUser(credential);
    return response.data;
  }, []);

  /**
   * Войти
   */
  const login = useCallback(
    async (credential, password) => {
      const response = await authApi.login(credential, password);
      saveToken(response.data.accessToken);
      setUser(response.data.user);
      return response;
    },
    [saveToken]
  );

  /**
   * Зарегистрироваться
   */
  const register = useCallback(
    async (nickname, password, email, captchaToken) => {
      const response = await authApi.register(
        nickname,
        password,
        email,
        captchaToken
      );
      saveToken(response.data.accessToken);
      setUser(response.data.user);
      return response;
    },
    [saveToken]
  );

  /**
   * Выйти
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Игнорируем ошибки при logout
    } finally {
      clearToken();
      setUser(null);
    }
  }, [clearToken]);

  /**
   * Запросить сброс пароля
   */
  const forgotPassword = useCallback(async (credential) => {
    return await authApi.forgotPassword(credential);
  }, []);

  /**
   * Сбросить пароль
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    return await authApi.resetPassword(token, newPassword);
  }, []);

  /**
   * Проверка авторизации при загрузке
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Пробуем загрузить текущего пользователя
        // Если есть refresh token в cookie - он автоматически используется
        const response = await authApi.refresh();
        saveToken(response.data.accessToken);
        await loadUser();
      } catch (error) {
        // Пользователь не авторизован
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [saveToken, clearToken, loadUser]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    checkUser,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
