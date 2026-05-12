import httpClient from "./httpClient";

export const getAllUploadsApi = async () => {
  const response = await httpClient.get(
    "/v1/profile/get-all-uploads"
  );

  return response.data;
};
