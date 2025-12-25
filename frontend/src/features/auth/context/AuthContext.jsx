import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@shared/api/authApi";
import { apiClient } from "@shared/api/apiClient";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken")
  );

  useEffect(() => {
    const requestInterceptor = apiClient.client.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = apiClient.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          refreshToken
        ) {
          originalRequest._retry = true;

          try {
            const response = await authApi.refreshToken(refreshToken);
            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            } = response.data;

            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient.client(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.client.interceptors.request.eject(requestInterceptor);
      apiClient.client.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, refreshToken]);

  useEffect(() => {
    const loadUser = async () => {
      if (accessToken) {
        try {
          const response = await authApi.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const { user, accessToken, refreshToken } = response.data;

    setUser(user);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    return response;
  };

  const register = async (data) => {
    const response = await authApi.register(data);
    const { user, accessToken, refreshToken } = response.data;

    setUser(user);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    return response;
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      // Ignore errors on logout
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
