const DB_NAME = "cloud_upload_cache";
const CHUNK_STORE = "chunks";
const PART_STORE = "parts";
const DB_VERSION = 2;

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CHUNK_STORE)) {
        db.createObjectStore(CHUNK_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PART_STORE)) {
        db.createObjectStore(PART_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async (storeName, mode, callback) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = callback(store);

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
  });
};

const chunkId = (uploadId, partNumber) =>
  `${uploadId}:${partNumber}`;

export const saveChunk = async (uploadId, partNumber, chunk) => {
  const record = {
    id: chunkId(uploadId, partNumber),
    uploadId,
    partNumber,
    chunk,
    size: chunk?.size || 0,
  };
  await withStore(CHUNK_STORE, "readwrite", (store) => store.put(record));
  return record;
};

export const getChunk = async (uploadId, partNumber) =>
  withStore(CHUNK_STORE, "readonly", (store) =>
    store.get(chunkId(uploadId, partNumber))
  );

export const deleteChunk = async (uploadId, partNumber) =>
  withStore(CHUNK_STORE, "readwrite", (store) =>
    store.delete(chunkId(uploadId, partNumber))
  );

export const listChunks = async (uploadId) => {
  const records = await withStore(CHUNK_STORE, "readonly", (store) =>
    store.getAll()
  );
  const safeRecords = Array.isArray(records) ? records : [];
  return safeRecords
    .filter((record) => record.uploadId === uploadId)
    .map((record) => ({
      partNumber: record.partNumber,
      size: record.size || 0,
    }))
    .sort((a, b) => a.partNumber - b.partNumber);
};

export const saveUploadedPart = async (uploadId, part) => {
  const record = {
    id: chunkId(uploadId, part.PartNumber),
    uploadId,
    PartNumber: part.PartNumber,
    ETag: part.ETag,
    Size: part.Size || 0,
    LastModified: part.LastModified || new Date().toISOString(),
  };
  await withStore(PART_STORE, "readwrite", (store) => store.put(record));
  return record;
};

export const getUploadedPartsCache = async (uploadId) => {
  const records = await withStore(PART_STORE, "readonly", (store) =>
    store.getAll()
  );
  return records.filter((record) => record.uploadId === uploadId);
};

export const clearUploadCache = async (uploadId) => {
  const chunks = await withStore(CHUNK_STORE, "readonly", (store) =>
    store.getAll()
  );
  const parts = await withStore(PART_STORE, "readonly", (store) =>
    store.getAll()
  );

  await withStore(CHUNK_STORE, "readwrite", (store) => {
    chunks
      .filter((record) => record.uploadId === uploadId)
      .forEach((record) => store.delete(record.id));
  });

  await withStore(PART_STORE, "readwrite", (store) => {
    parts
      .filter((record) => record.uploadId === uploadId)
      .forEach((record) => store.delete(record.id));
  });
};

export const clearAllUploadCache = async () => {
  await withStore(CHUNK_STORE, "readwrite", (store) => store.clear());
  await withStore(PART_STORE, "readwrite", (store) => store.clear());
};
