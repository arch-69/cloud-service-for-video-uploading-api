import { useState } from "react";

import {
  createChunks,
} from "../utils/chunk.utils";

import {
  uploadChunksInParallel,
} from "../utils/parallelUpload.utils";

import {
  startMultipartUploadApi,
  completeMultipartUploadApi,
  abortMultipartUploadApi,
} from "../api/upload.api";

export const useMultipartUpload =
  () => {

    const [progress, setProgress] =
      useState(0);

    const [status, setStatus] =
      useState("IDLE");

    const [uploadedParts,
      setUploadedParts] =
      useState([]);

    const uploadFile =
      async (file) => {
        try {

          setStatus("STARTING");

          const chunks =
            createChunks(file);

          const {
            uploadId,
            key,
          } =
            await startMultipartUploadApi({
              fileName:
                file.name,

              fileSize:
                file.size,

              fileType:
                file.type,

              totalParts:
                chunks.length,
            });

          console.log(uploadId, key);

          let uploadedCount = 0;

          const parts =
            await uploadChunksInParallel({
              chunks,
              uploadId,
              key,

              fileType:
                file.type,

              onProgress:
                () => {

                  uploadedCount++;

                  setProgress(
                    Math.round(
                      (
                        uploadedCount /
                        chunks.length
                      ) * 100
                    )
                  );
                },
            });

          setUploadedParts(parts);

          if (
            parts.length !==
            chunks.length
          ) {

            setStatus(
              "PARTIAL"
            );

            throw new Error(
              "Partial upload"
            );
          }

          setStatus(
            "COMPLETING"
          );

          await completeMultipartUploadApi({
            uploadId,
            key,
            parts,
          });

          setStatus(
            "COMPLETED"
          );

        } catch (error) {

          console.log(error);

          setStatus("FAILED");
        }
      };

    return {
      progress,
      status,
      uploadedParts,
      uploadFile,
    };
  };