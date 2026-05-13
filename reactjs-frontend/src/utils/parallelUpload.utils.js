import {
  MAX_PARALLEL_UPLOADS,
} from "../constants/upload.constants";

import {
  uploadChunkService,
} from "../services/upload.service";

export const uploadChunksInParallel =
  async ({
    chunks,
    uploadId,
    key,
    fileType,
    onProgress,
    onPartComplete,
    onPartError,
    getIsPaused,
    waitForResume,  
    signal,
    loadChunk,
  }) => {

    const uploadedParts = [];

    let index = 0;

    const worker = async () => {

      while (
        index < chunks.length
      ) {

        const currentIndex =
          index++;

        const currentChunk =
          chunks[currentIndex];

        if (signal?.aborted) {
          return;
        }

        if (getIsPaused?.()) {
          await waitForResume?.();
        }

        try {
          const chunkBlob =
            currentChunk.chunk
              ? currentChunk.chunk
              : await loadChunk?.(
                  currentChunk.partNumber
                );

          if (!chunkBlob) {
            throw new Error("Chunk not found");
          }

          const uploadedPart =
            await uploadChunkService({
              chunk: chunkBlob,
              partNumber:
                currentChunk.partNumber,
              uploadId,
              key,
              fileType,
              onProgress,
              signal,
            });

          uploadedParts.push(uploadedPart);
          onPartComplete?.(
            uploadedPart,
            currentChunk
          );

        } catch (error) {
          onPartError?.(error, currentChunk);

          if (signal?.aborted) {
            return;
          }
        }
      }
    };

    const workers = Array(
      MAX_PARALLEL_UPLOADS
    )
      .fill(null)
      .map(() => worker());

    await Promise.all(workers);

    return uploadedParts.sort(
      (a, b) =>
        a.PartNumber -
        b.PartNumber
    );
  };