import {
  readStorage,
  writeStorage,
} from "./storage.utils";

const RECORDS_KEY = "cloud_upload_records";
const ACTIVITY_KEY = "cloud_upload_activity";

export const getUploadRecords = () =>
  readStorage(RECORDS_KEY, []);

export const saveUploadRecords = (records) =>
  writeStorage(RECORDS_KEY, records);

export const upsertUploadRecord = (record) => {
  const records = getUploadRecords();
  const index = records.findIndex((item) => item.id === record.id);

  if (index >= 0) {
    records[index] = {
      ...records[index],
      ...record,
      updatedAt: new Date().toISOString(),
    };
  } else {
    records.unshift({
      ...record,
      updatedAt: new Date().toISOString(),
    });
  }

  saveUploadRecords(records);
  return records;
};

export const removeUploadRecord = (recordId) => {
  const records = getUploadRecords().filter(
    (record) => record.id !== recordId
  );
  saveUploadRecords(records);
  return records;
};

export const getUploadActivities = () =>
  readStorage(ACTIVITY_KEY, []);

export const addUploadActivity = (activity) => {
  const activities = getUploadActivities();
  const next = [
    {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...activity,
    },
    ...activities,
  ].slice(0, 50);

  writeStorage(ACTIVITY_KEY, next);
  return next;
};
