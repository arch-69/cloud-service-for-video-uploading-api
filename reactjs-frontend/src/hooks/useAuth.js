import { useMemo, useState } from "react";
import { useEffect } from "react";
import {
  readStorage,
  removeStorage,
  writeStorage,
} from "../utils/storage.utils";
import {
  loginApi,
  refreshTokenApi,
  registerApi,
  googleAuthApi,
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

  // Keep in-memory tokens in sync if httpClient refreshes them behind the scenes
  useEffect(() => {
    const handler = (ev) => {
      const { accessToken: at, refreshToken: rt } = ev?.detail || {};
      if (at) {
        setAccessToken(at);
        writeStorage(ACCESS_TOKEN_KEY, at);
      }
      if (rt) {
        setRefreshToken(rt);
        writeStorage(REFRESH_TOKEN_KEY, rt);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:refreshed', handler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:refreshed', handler);
      }
    };
  }, []);

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
    // clear persisted upload records and activities on logout to avoid leaking data between users
    try {
      removeStorage('cloud_upload_records');
      removeStorage('cloud_upload_activity');
    } catch {
      // ignore
    }

    // notify other parts of the app (and same-tab listeners) that logout occurred
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:loggedout'));
    }
  };

  // Accept an ID token from Google and exchange it for a session on the backend
  const googleSignIn = async (idToken) => {
    if (!idToken) return { ok: false, error: "No idToken provided" };

    try {
      const response = await googleAuthApi({ idToken });
      if (!response?.success) {
        return { ok: false, error: response?.message || "Google sign-in failed" };
      }

      const nextUser = response.data?.user;
      const nextAccessToken = response.data?.accessToken;
      const nextRefreshToken = response.data?.refreshToken;

      persistSession({ nextUser, nextAccessToken, nextRefreshToken });

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.message || "Google sign-in failed" };
    }
  };

  // Optional helper to initialize Google Identity SDK and prompt sign-in.
  // This will only work if VITE_GOOGLE_CLIENT_ID is set and the app is configured to use Google's
  // Identity Services. We provide a small convenience wrapper but keep it optional.
  const startGoogleSignIn = async () => {
    // Ensure env var is read and trimmed
    let clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
    if (typeof clientId === 'string') clientId = clientId.trim();
    if (!clientId) {
      throw new Error("Google client ID not configured (VITE_GOOGLE_CLIENT_ID). Please set VITE_GOOGLE_CLIENT_ID in your .env and restart the dev server.");
    }

    // Dynamically load the Google Identity Services script
    if (!window.google?.accounts?.id) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://accounts.google.com/gsi/client";
        s.async = true;
        s.onload = () => resolve();
  s.onerror = () => reject(new Error('Failed to load Google Identity script'));
        document.head.appendChild(s);
      });
    }

    // Helpful debug info in case Google returns 403 (Forbidden) or FedCM is disabled
    // Common causes:
    // - Client ID not correctly configured in .env or contains spaces
    // - Running on an origin not allowed in Google Cloud Console (Authorized JavaScript origins)
    // - Browser/site settings blocking FedCM / third-party sign-in
    // We'll log minimal info to console to help debugging.
    console.debug('[useAuth] starting Google sign-in', {
      clientId: clientId ? clientId.replace(/(.{8}).+(.{8})/, '$1...$2') : null,
      origin: window.location.origin,
    });

    return new Promise((resolve, reject) => {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp) => {
            // resp.credential is the ID token
            if (!resp || !resp.credential) {
              reject(new Error('No credential received from Google (user may have dismissed the prompt or FedCM is disabled)'));
              return;
            }
            resolve(resp.credential);
          },
        });

        // request a prompt; this will show a popup / One Tap depending on settings
        // note: Google may use FedCM under the hood; if FedCM is disabled in the browser
        // you may see a console message about it. That's a browser/site setting.
        window.google.accounts.id.prompt();
      } catch (err) {
        // Provide more actionable guidance for 403 / FedCM issues
        if (err?.message?.includes('403') || err?.message?.toLowerCase().includes('forbidden')) {
          reject(new Error('Google Identity returned 403 Forbidden. Check that your client ID is valid and that your origin ("' + window.location.origin + '") is authorized in Google Cloud Console.')); 
        } else {
          reject(err);
        }
      }
    });
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
    googleSignIn,
    startGoogleSignIn,
    accessToken,
  };
};
