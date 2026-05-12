import userRepo from "../repositories/userRepo.js";
import ApiError from "../utils/ApiError.js";

const getIncompleteUpload = async ({ _id }) => {
  try {
    const response = await userRepo.getInCompleteUpload({ _id });

    return response;
  } catch (err) {
    throw new ApiError(500, err.message, err.errors);
  }
};

const getAllUploads = async ({ _id }) => {
  try {
    const response = await userRepo.getAllUploads({ _id });

    return response;
  } catch (err) {
    throw new ApiError(500, err.message, err.errors);
  }
};

export default {
  getIncompleteUpload,
  getAllUploads,
};
