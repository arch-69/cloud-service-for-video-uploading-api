import axios from "axios";
import { readStorage, writeStorage, removeStorage } from "../utils/storage.utils";

const ACCESS_TOKEN_KEY = "cloud_access_token";
const REFRESH_TOKEN_KEY = "cloud_refresh_token";

const httpClient = axios.create({
  baseURL: import.meta.env?.VITE_BASE_URL
});

httpClient.interceptors.request.use((config) => {
  const token = readStorage(ACCESS_TOKEN_KEY, null);
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  // Log outgoing requests for debugging (method and url)
  try {
    console.debug('[httpClient] request:', (config.method || 'GET').toUpperCase(), config.url || config.baseURL || config);
  } catch {
    // ignore logging errors
  }

  // Safety: ensure we never accidentally send refresh token on regular requests.
  try {
    const url = String(config.url || '');
    if (config.data && config.data.refreshToken && !url.includes('/v1/auth/refresh')) {
      console.warn('[httpClient] removing refreshToken from outgoing request to', url);
      // remove refreshToken from the body to avoid accidental leakage
      const newData = { ...config.data };
      delete newData.refreshToken;
      config.data = newData;
    }
  } catch {
    // ignore
  }
  return config;
});

// Response interceptor with single-retry refresh logic
httpClient.interceptors.response.use(
  (response) => {
    try {
      console.debug('[httpClient] response:', response.config?.url || response.config?.baseURL, response.status);
    } catch {
      // ignore
    }
    return response;
  },
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
      console.debug('[httpClient] no refresh token available, cannot refresh');
      return Promise.reject(error);
    }

    try {
      // Use plain axios to avoid calling this client's interceptors again
      console.debug('[httpClient] attempting token refresh');
      const refreshUrl = `${httpClient.defaults.baseURL}/v1/auth/refresh`;
      const refreshResponse = await axios.post(
        refreshUrl,
        { refreshToken },
        { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
      );

      console.debug('[httpClient] refresh response status', refreshResponse.status);
      const data = refreshResponse.data;
      console.debug('[httpClient] refresh response data', data);

      if (!data?.success) {
        // Clear stored tokens if refresh failed
        console.warn('[httpClient] refresh failed, clearing stored tokens');
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

      // Broadcast token refresh so other parts of the app (hooks) can update in-memory state
      try {
        if (typeof window !== 'undefined' && (nextAccessToken || nextRefreshToken)) {
          window.dispatchEvent(new CustomEvent('auth:refreshed', {
            detail: { accessToken: nextAccessToken, refreshToken: nextRefreshToken }
          }));
        }
      } catch {
        // ignore
      }

      console.debug('[httpClient] retrying original request with new access token');
      return httpClient(originalConfig);
    } catch (refreshError) {
      // On refresh failure, clear tokens and forward the error
      console.error('[httpClient] refresh request error', refreshError?.message || refreshError);
      removeStorage(ACCESS_TOKEN_KEY);
      removeStorage(REFRESH_TOKEN_KEY);
      return Promise.reject(refreshError);
    }
  }
);

export default httpClient;
