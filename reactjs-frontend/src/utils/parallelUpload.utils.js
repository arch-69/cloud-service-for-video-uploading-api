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

        try {

          const uploadedPart =
            await uploadChunkService({
              chunk:
                currentChunk.chunk,

              partNumber:
                currentChunk.partNumber,

              uploadId,
              key,
              fileType,
              onProgress,
            });

          uploadedParts.push(
            uploadedPart
          );

        } catch (error) {

          console.log(error);
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