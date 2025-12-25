import { apiClient } from "./apiClient";

export const authApi = {
  register: async (data) => {
    return apiClient.post("/auth/register", data);
  },

  login: async (data) => {
    return apiClient.post("/auth/login", data);
  },

  logout: async (refreshToken) => {
    return apiClient.post("/auth/logout", { refreshToken });
  },

  refreshToken: async (refreshToken) => {
    return apiClient.post("/auth/refresh-token", { refreshToken });
  },

  requestPasswordReset: async (data) => {
    return apiClient.post("/auth/request-password-reset", data);
  },

  resetPassword: async (data) => {
    return apiClient.post("/auth/reset-password", data);
  },

  checkUser: async (username) => {
    return apiClient.post("/auth/check-user", { username });
  },

  getCurrentUser: async () => {
    return apiClient.get("/auth/me");
  },
};

export default authApi;
