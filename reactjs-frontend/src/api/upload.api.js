import httpClient from "./httpClient";

const BASE_URL = "/v2/file";

export const startMultipartUploadApi =
  async (data) => {

    const response =
      await httpClient.post(
        `${BASE_URL}/start-multipart-upload`,
        data
      );

    console.log(response);

    return response.data.data;
  };

export const getSignedUrlApi =
  async (data) => {

    const response =
      await httpClient.post(
        `${BASE_URL}/get-presigned-url`,
        data
      );

    return response.data.data.url;
  };

export const saveUploadedPartApi =
  async (data) => {

    const response =
      await httpClient.post(
        `${BASE_URL}/save-uploaded-part`,
        data
      );

    return response.data.data;
  };

export const completeMultipartUploadApi =
  async (data) => {

    const response =
      await httpClient.post(
        `${BASE_URL}/complete-multipart-upload`,
        data
      );

    return response.data.data;
  };

export const abortMultipartUploadApi =
  async (data) => {

    const response =
      await httpClient.post(
        `${BASE_URL}/abort-multipart-upload`,
        data
      );

    return response.data.data;
  };

export const getUploadedPartsApi =
  async (uploadId) => {

    const response =
      await httpClient.post(
        `${BASE_URL}/get-uploaded-parts`,
        {
          uploadId,
        }
      );

    return response.data.data;
  };

  export const getStreamingUrlApi = async (data) => {
    const response = await httpClient.post(
      `${BASE_URL}/get-streaming-url`,
      data
    );
    // console.log(response.data.data);

    return response.data.data;
  };