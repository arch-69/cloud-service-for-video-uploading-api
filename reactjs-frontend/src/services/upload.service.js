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
    signal,
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
            signal,
          }
        )
      );

    // Helpful diagnostics: log response meta for debugging
    // prefer lowercase key access; axios lowercases header keys in browser
    const rawHeaders = response?.headers || {};

    // Try multiple possible header names (some servers expose 'ETag' or 'etag')
    let etag = rawHeaders.etag || rawHeaders.ETag || rawHeaders['x-amz-meta-etag'];

    // strip surrounding quotes if present
    if (typeof etag === 'string') {
      etag = etag.replace(/^"|"$/g, '');
    }

    if (!etag) {
      // If ETag is missing it's often a CORS expose-headers issue when uploading directly to S3.
      // Log full headers to console to aid debugging.
      console.error('Upload chunk response headers missing ETag', { signedUrl, status: response.status, headers: rawHeaders });
      throw new Error('ETag missing from upload response. Check that the upload endpoint (or S3 CORS) exposes the ETag header (Access-Control-Expose-Headers).');
    }

    const cleanedEtag = etag;

    await saveUploadedPartApi({
      uploadId,
      partNumber,
      etag: cleanedEtag,
    });

    onProgress?.();

    return {
      ETag: cleanedEtag,
      PartNumber: partNumber,
    };
  };