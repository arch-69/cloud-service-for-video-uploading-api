import { useRef, useState } from "react";

import { createChunks } from "../utils/chunk.utils";

import { uploadChunksInParallel } from "../utils/parallelUpload.utils";

import {
  startMultipartUploadApi,
  completeMultipartUploadApi,
  abortMultipartUploadApi,
  getUploadedPartsApi,
} from "../api/upload.api";

export const useMultipartUpload = () => {
  const [progress, setProgress] = useState(0);

  const [status, setStatus] = useState("IDLE");

  const [error, setError] = useState(null);

  const [uploadedParts, setUploadedParts] = useState([]);

  const [isPaused, setIsPaused] = useState(false);

  const [currentUpload, setCurrentUpload] = useState(null);

  const abortControllerRef = useRef(null);

  const chunksRef = useRef([]);

  const completedPartsRef = useRef([]);

  const uploadMetaRef = useRef(null);

  const startUpload = async ({ chunks, uploadId, key, fileType }) => {
    abortControllerRef.current = new AbortController();

    // Prefer server-side uploaded parts to avoid inconsistencies across sessions
    let serverUploadedParts;
    try {
      serverUploadedParts = await getUploadedPartsApi(uploadId);
    } catch (e) {
      // If the server call fails, fall back to in-memory tracking
      console.warn('[useMultipartUpload] failed to fetch uploaded parts from server, falling back to local state', e?.message || e);
      serverUploadedParts = [];
    }

    // Merge server parts with local completed parts (dedupe by PartNumber)
    const partsByNumber = new Map();
    (serverUploadedParts || []).forEach((p) => {
      if (p && p.PartNumber != null) partsByNumber.set(p.PartNumber, p);
    });
    (completedPartsRef.current || []).forEach((p) => {
      if (p && p.PartNumber != null) partsByNumber.set(p.PartNumber, p);
    });

    const mergedCompletedParts = Array.from(partsByNumber.values()).sort((a, b) => a.PartNumber - b.PartNumber);
    completedPartsRef.current = mergedCompletedParts;
    setUploadedParts([...mergedCompletedParts]);

    const uploadedPartNumbers = new Set(mergedCompletedParts.map((part) => part.PartNumber));
    const remainingChunks = chunks.filter((chunk) => !uploadedPartNumbers.has(chunk.partNumber));

    await uploadChunksInParallel({
      chunks: remainingChunks,

      uploadId,

      key,

      fileType,

      signal: abortControllerRef.current.signal,

      onPartComplete: (part) => {
        completedPartsRef.current.push(part);

        setUploadedParts([...completedPartsRef.current]);

        const nextProgress = Math.round(
          (completedPartsRef.current.length / chunks.length) * 100,
        );

        setProgress(nextProgress);
      },
    });

    if (abortControllerRef.current.signal.aborted) {
      return;
    }

    setStatus("COMPLETING");

    await completeMultipartUploadApi({
      uploadId,

      key,

      parts: completedPartsRef.current.sort(
        (a, b) => a.PartNumber - b.PartNumber,
      ),
    });

    setProgress(100);

    setStatus("COMPLETED");
  };

  const uploadFile = async (file) => {
    try {
      setError(null);

      setProgress(0);

      setStatus("STARTING");

      setUploadedParts([]);

      completedPartsRef.current = [];

      const chunks = createChunks(file);

      chunksRef.current = chunks;

      const { uploadId, key } = await startMultipartUploadApi({
        fileName: file.name,

        fileType: file.type,

        fileSize: file.size,

        totalParts: chunks.length,
      });

      uploadMetaRef.current = {
        uploadId,
        key,
        fileType: file.type,
      };

      setCurrentUpload({
        uploadId,
        key,
        fileName: file.name,
      });

      setStatus("UPLOADING");

      await startUpload({
        chunks,

        uploadId,

        key,

        fileType: file.type,
      });
    } catch (err) {
      if (abortControllerRef.current?.signal?.aborted) {
        return;
      }

      console.error(err);

      setStatus("FAILED");

      // store the full error so UI can inspect status codes
      setError(err);
    }
  };

  const pauseUpload = () => {
    abortControllerRef.current?.abort();

    setIsPaused(true);

    setStatus("PAUSED");
  };

  const resumeUpload = async () => {
    try {
      if (!uploadMetaRef.current) {
        return;
      }

      setIsPaused(false);

      setStatus("UPLOADING");

      await startUpload({
        chunks: chunksRef.current,

        uploadId: uploadMetaRef.current.uploadId,

        key: uploadMetaRef.current.key,

        fileType: uploadMetaRef.current.fileType,
      });
    } catch (err) {
      console.error(err);

      setStatus("FAILED");

      setError(err);
    }
  };

  const cancelUpload = async () => {
    try {
      abortControllerRef.current?.abort();

      if (!uploadMetaRef.current) {
        return;
      }

      await abortMultipartUploadApi({
        uploadId: uploadMetaRef.current.uploadId,

        key: uploadMetaRef.current.key,
      });

      setStatus("CANCELLED");

      setProgress(0);

      completedPartsRef.current = [];

      chunksRef.current = [];
    } catch (err) {
      console.error(err);
    }
  };

  return {
    progress,

    status,

    error,

    uploadedParts,

    currentUpload,

    isPaused,

    uploadFile,

    pauseUpload,

    resumeUpload,

    cancelUpload,
  };
};
