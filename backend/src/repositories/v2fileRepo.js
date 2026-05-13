import Upload from "../models/uploadFile.js";

const createUpload = (data) => Upload.create(data);

const findByUploadId = ({ uploadId }) => Upload.findOne({ uploadId });

const addUploadedPart = ({ uploadId, part }) =>
  Upload.findOneAndUpdate(
    { uploadId },

    {
      $push: {
        uploadedParts: part,
      },
    },

    {
      returnDocument: "after",
    },
  );

const addFailedPart = ({ uploadId, part }) =>
  Upload.findOneAndUpdate(
    { uploadId },
    {
      $push: {
        failedParts: part,
      },
      $inc: {
        uploadProgress: 1,
      },
    },
    { returnDocument: "after" },
  );

const removeFailedPart = (uploadId, partNumber) =>
  Upload.findOneAndUpdate(
    { uploadId },
    {
      $pull: {
        failedParts: {
          partNumber,
        },
      },
    },
    { returnDocument: "after" },
  );

const changeStatus = ({ uploadId, status }) =>
  Upload.findOneAndUpdate(
    { uploadId },
    {
      $set: {
        status: status,
      },
    },
    { returnDocument: "after" },
  );

const getUploadStatus = (uploadId) => {
  return Upload.findOne(
    { uploadId },

    {
      uploadedParts: 1,

      failedParts: 1,

      totalParts: 1,

      uploadProgress: 1,

      uploadedBytes: 1,

      status: 1,

      _id: 0,
    },
  );
};

const updateProgress = (uploadId, progress) =>
  Upload.findOneAndUpdate(
    { uploadId },
    {
      $set: {
        uploadProgress: progress,
      },
    },
    { returnDocument: "after" },
  );

const markAsCompleted = ({ uploadId, finalUrl }) =>
  Upload.findOneAndUpdate(
    { uploadId },
    {
      $set: {
        status: "COMPLETED",
        fileUrl: finalUrl,
      },
    },
    { returnDocument: "after" },
  );

const getCompletedUploads = ({ _id }) =>
  Upload.find({ uploadedBy: _id, status: "COMPLETED" });

export default {
  createUpload,
  findByUploadId,
  addUploadedPart,
  addFailedPart,
  removeFailedPart,
  changeStatus,
  getUploadStatus,
  updateProgress,
  markAsCompleted,
  getCompletedUploads,
};
