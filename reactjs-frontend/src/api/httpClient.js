import axios from "axios";
import { readStorage, writeStorage, removeStorage } from "../utils/storage.utils";

const ACCESS_TOKEN_KEY = "cloud_access_token";
const REFRESH_TOKEN_KEY = "cloud_refresh_token";

const httpClient = axios.create({
  baseURL: "http://localhost:3200/api",
});

httpClient.interceptors.request.use((config) => {
  const token = readStorage(ACCESS_TOKEN_KEY, null);
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// Response interceptor with single-retry refresh logic
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;
    if (!originalConfig) return Promise.reject(error);

    // If it's not a 401, just forward the error
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loop: only retry once per request
    if (originalConfig._retry) {
      return Promise.reject(error);
    }
    originalConfig._retry = true;

    const refreshToken = readStorage(REFRESH_TOKEN_KEY, null);
    if (!refreshToken) {
      return Promise.reject(error);
    }

    try {
      // Use plain axios to avoid calling this client's interceptors again
      const refreshResponse = await axios.post(
        `${httpClient.defaults.baseURL}/v1/auth/refresh`,
        { refreshToken }
      );

      const data = refreshResponse.data;
      if (!data?.success) {
        // Clear stored tokens if refresh failed
        removeStorage(ACCESS_TOKEN_KEY);
        removeStorage(REFRESH_TOKEN_KEY);
        return Promise.reject(error);
      }

      const nextAccessToken = data?.data?.accessToken;
      const nextRefreshToken = data?.data?.refreshToken;

      if (nextAccessToken) writeStorage(ACCESS_TOKEN_KEY, nextAccessToken);
      if (nextRefreshToken) writeStorage(REFRESH_TOKEN_KEY, nextRefreshToken);

      // Update header and retry original request
      originalConfig.headers = {
        ...originalConfig.headers,
        Authorization: `Bearer ${nextAccessToken}`,
      };

      return httpClient(originalConfig);
    } catch (refreshError) {
      // On refresh failure, clear tokens and forward the error
      removeStorage(ACCESS_TOKEN_KEY);
      removeStorage(REFRESH_TOKEN_KEY);
      return Promise.reject(refreshError);
    }
  }
);

export default httpClient;
