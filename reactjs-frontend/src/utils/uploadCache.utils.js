const DB_NAME = "cloud_upload_cache";
const STORE_NAME = "uploads";
const DB_VERSION = 1;

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "uploadId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async (mode, callback) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const result = callback(store);

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
  });
};

export const saveUploadCache = async (record) =>
  withStore("readwrite", (store) => store.put(record));

export const getUploadCache = async (uploadId) =>
  withStore("readonly", (store) => store.get(uploadId));

export const updateUploadCache = async (uploadId, patch) => {
  if (!uploadId) {
    return null;
  }

  const existing = await getUploadCache(uploadId);
  const next = existing
    ? { ...existing, ...patch, uploadId }
    : { uploadId, ...patch };
  await saveUploadCache(next);
  return next;
};

export const deleteUploadCache = async (uploadId) =>
  withStore("readwrite", (store) => store.delete(uploadId));
