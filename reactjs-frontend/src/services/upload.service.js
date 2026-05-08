import axios from "axios";

import {
  retryUpload,
} from "../utils/retry.utils";

import {
  getSignedUrlApi,
  saveUploadedPartApi,
} from "../api/upload.api";

export const uploadChunkService =
  async ({
    chunk,
    partNumber,
    uploadId,
    key,
    fileType,
    onProgress,
  }) => {

    const signedUrl =
      await getSignedUrlApi({
        uploadId,
        key,
        partNumber
      });

    const response =
      await retryUpload(() =>
        axios.put(
          signedUrl,
          chunk,
          {
            headers: {
              "Content-Type": fileType || 'application/octet-stream',
            },
            // IMPORTANT: Prevent Axios from transforming the Blob into a string or JSON
            transformRequest: [(data) => data], 
          }
        )
      );

    const etag =
      response.headers.etag;

    if (!etag) {

      throw new Error(
        "ETag missing"
      );
    }

    await saveUploadedPartApi({
      uploadId,
      partNumber,
      etag
    });

    onProgress();

    return {
      ETag: etag,
      PartNumber: partNumber,
    };
  };