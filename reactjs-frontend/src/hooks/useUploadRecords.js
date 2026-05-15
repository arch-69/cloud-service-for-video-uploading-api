import { useCallback, useEffect, useState } from "react";
import {
  addUploadActivity,
  getUploadActivities,
  upsertUploadRecord,
} from "../utils/uploadRecords.utils";
import { getAllUploadsApi } from "../api/profile.api";

const mapUploadRecord = (upload) => ({
  id: upload._id,
  fileName: upload.fileName,
  fileSize: upload.fileSize,
  fileType: upload.fileType,
  totalParts: upload.totalParts,
  progress: upload.uploadProgress ?? 0,
  status: upload.status || "PENDING",
  uploadId: upload.uploadId,
  key: upload.key,
  uploadedParts: upload.uploadedParts || [],
  ownerId: upload.ownerId || "server",
  updatedAt: upload.updatedAt,
  startedAt: upload.startedAt,
  fileUrl: upload.fileUrl,
});

const mapUploadActivity = (upload) => ({
  id: upload._id,
  timestamp: upload.updatedAt || upload.startedAt,
  message: `${upload.fileName} • ${upload.status || "PENDING"}`,
  label: upload.status || "PENDING",
  status: upload.status || "PENDING",
  ownerId: upload.ownerId || "server",
});

export const useUploadRecords = () => {
  const [records, setRecords] = useState([]);
  const [activities, setActivities] = useState(() => getUploadActivities());
  const [isLoading, setIsLoading] = useState(false);

  const fetchUploads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllUploadsApi();
      if (response?.success) {
        const uploads =
          response.data?.uploadedFile || [];
  setRecords(uploads.map(mapUploadRecord));
  setActivities(uploads.map(mapUploadActivity));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUploads();
    }, 0);

    // listen for logout so we can clear in-memory records/activities
    const onLogout = () => {
      setRecords([]);
      setActivities([]);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:loggedout', onLogout);
    }

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:loggedout', onLogout);
      }
    };
  }, [fetchUploads]);

  const saveRecord = useCallback((record) => {
    const next = upsertUploadRecord(record);
    setRecords(next);
    return next;
  }, []);

  const logActivity = useCallback((activity) => {
    const next = addUploadActivity(activity);
    setActivities(next);
    return next;
  }, []);

  return {
    records,
    activities,
    saveRecord,
    logActivity,
    isLoading,
    refresh: fetchUploads,
  };
};
