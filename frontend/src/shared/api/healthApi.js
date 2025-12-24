import { apiClient } from "./apiClient";

export const healthApi = {
  checkHealth: async () => {
    return apiClient.get("/health");
  },
};

export default healthApi;
