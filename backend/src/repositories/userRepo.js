import User from "../models/user.js";

const findByUserId = ({ _id }) => User.findById(_id, { password: -1 });

const createUser = ({ email, name, password }) =>
  User.create({
    name: name,
    email: email,
    password: password,
  });

const findByEmail = ({ email }) => User.findOne({ email });

const getInCompleteUpload = ({ _id }) =>
  User.findById(_id)
    .select("name email")
    .populate({
      path: "uploadedFile",
      match: {
        status: "UPLOADING",
      },
      select: "-_id",
    })
    .lean();

const addRefreshToken = ({ _id, refreshToken }) =>
  User.findByIdAndUpdate(
    _id,
    {
      $set: {
        refreshToken: refreshToken,
      },
    },
    { returnDocument: "after" },
  );

const addUploadingFile = ({ _id, fileId }) =>
  User.findByIdAndUpdate(
    _id,
    {
      $push: {
        uploadedFile: fileId,
      },
    },
    { returnDocument: "after" },
  );

const getAllUploads = ({ _id }) =>
  User.findById(_id)
    .select("email name")
    .populate({
      path: "uploadedFile",
      select: "-uploadedParts -failedParts",
    })
    .lean();

const getCompletedUploads = ({ _id }) =>
  User.findById(_id)
    .select("")
    .populate({
      path: "uploadedFile",
      match: {
        status: "COMPLETED",
      },
      select: "-_id",
    });

export default {
  findByUserId,
  createUser,
  getInCompleteUpload,
  findByEmail,
  addRefreshToken,
  addUploadingFile,
  getAllUploads,
  getCompletedUploads,
};
