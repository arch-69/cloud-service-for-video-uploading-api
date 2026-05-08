import axios from "axios";

const BASE_URL =
  "http://localhost:3200/api/v2/file";

export const startMultipartUploadApi =
  async (data) => {

    const response =
      await axios.post(
        `${BASE_URL}/start-multipart-upload`,
        data
      );

    console.log(response);

    return response.data.data;
  };

export const getSignedUrlApi =
  async (data) => {

    const response =
      await axios.post(
        `${BASE_URL}/get-presigned-url`,
        data
      );

    return response.data.data.url;
  };

export const saveUploadedPartApi =
  async (data) => {

    const response =
      await axios.post(
        `${BASE_URL}/save-uploaded-part`,
        data
      );

    return response.data.data;
  };

export const completeMultipartUploadApi =
  async (data) => {

    const response =
      await axios.post(
        `${BASE_URL}/complete-multipart-upload`,
        data
      );

    return response.data.data;
  };

export const abortMultipartUploadApi =
  async (data) => {

    const response =
      await axios.post(
        `${BASE_URL}/abort-multipart-upload`,
        data
      );

    return response.data.data;
  };