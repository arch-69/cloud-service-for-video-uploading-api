import { useMemo, useState } from "react";
import {
  readStorage,
  removeStorage,
  writeStorage,
} from "../utils/storage.utils";
import {
  loginApi,
  refreshTokenApi,
  registerApi,
} from "../api/auth.api";

const SESSION_KEY = "cloud_session";
const ACCESS_TOKEN_KEY = "cloud_access_token";
const REFRESH_TOKEN_KEY = "cloud_refresh_token";

export const useAuth = () => {
  const [user, setUser] = useState(() =>
    readStorage(SESSION_KEY, null)
  );
  const [accessToken, setAccessToken] = useState(() =>
    readStorage(ACCESS_TOKEN_KEY, null)
  );
  const [refreshToken, setRefreshToken] = useState(() =>
    readStorage(REFRESH_TOKEN_KEY, null)
  );

  const persistSession = ({
    nextUser,
    nextAccessToken,
    nextRefreshToken,
  }) => {
    setUser(nextUser || null);
    writeStorage(SESSION_KEY, nextUser || null);

    if (nextAccessToken) {
      setAccessToken(nextAccessToken);
      writeStorage(ACCESS_TOKEN_KEY, nextAccessToken);
    }

    if (nextRefreshToken) {
      setRefreshToken(nextRefreshToken);
      writeStorage(REFRESH_TOKEN_KEY, nextRefreshToken);
    }
  };

  const register = async (payload) => {
    try {
      const response = await registerApi(payload);
      if (!response?.success) {
        return { ok: false, error: response?.message || "Registration failed." };
      }

      return {
        ok: true,
        message: "Registration successful. Please login.",
        user: response.data,
      };
    } catch {
      return { ok: false, error: "Registration failed." };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const response = await loginApi({ email, password });
      if (!response?.success) {
        return { ok: false, error: response?.message || "Invalid credentials." };
      }

      const nextUser = response.data?.user;
      const nextAccessToken = response.data?.accessToken;
      const nextRefreshToken = response.data?.refreshToken;

      persistSession({
        nextUser,
        nextAccessToken,
        nextRefreshToken,
      });

      return { ok: true };
    } catch {
      return { ok: false, error: "Login failed." };
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      return { ok: false, error: "No refresh token." };
    }

    try {
      const response = await refreshTokenApi({ refreshToken });
      if (!response?.success) {
        return { ok: false, error: response?.message || "Refresh failed." };
      }

      const nextAccessToken = response.data?.accessToken;
      if (nextAccessToken) {
        setAccessToken(nextAccessToken);
        writeStorage(ACCESS_TOKEN_KEY, nextAccessToken);
      }

      return { ok: true, accessToken: nextAccessToken };
    } catch {
      return { ok: false, error: "Refresh failed." };
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    removeStorage(SESSION_KEY);
    removeStorage(ACCESS_TOKEN_KEY);
    removeStorage(REFRESH_TOKEN_KEY);
  };

  const stats = useMemo(
    () => ({
      totalUsers: user ? 1 : 0,
      admins: user?.role === "admin" ? 1 : 0,
    }),
    [user]
  );

  return {
    user,
    users: user ? [user] : [],
    stats,
    login,
    register,
    refreshAccessToken,
    logout,
    accessToken,
  };
};
