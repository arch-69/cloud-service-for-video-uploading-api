import httpClient from "./httpClient";

export const registerApi = async (payload) => {
  const response = await httpClient.post(
    "/v1/auth/register",
    payload
  );

  return response.data;
};

export const loginApi = async (payload) => {
  const response = await httpClient.post(
    "/v1/auth/login",
    payload
  );

  return response.data;
};

export const refreshTokenApi = async (payload) => {
  const response = await httpClient.post(
    "/v1/auth/refresh",
    payload
  );

  return response.data;
};

export const googleAuthApi = async (payload) => {
  // Expect payload: { idToken }
  const response = await httpClient.post(
    "/v1/auth/google",
     payload
  );

  return response.data;
};
