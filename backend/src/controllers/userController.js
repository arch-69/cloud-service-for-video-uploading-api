import asyncHandler from "../utils/asyncHandler.js";
import userService from "../services/userService.js";
import ApiResponse from "../utils/ApiResponse.js";

const getIncompleteUpload = asyncHandler(async (req, res) => {
  const response = await userService.getIncompleteUpload({ _id: req.user._id });
  return res
    .status(200)
    .json(new ApiResponse(200, "fetched successfully", response));
});

const getAllUploads = asyncHandler(async (req, res) => {
  const response = await userService.getAllUploads({ _id: req.user._id });
  return res
    .status(200)
    .json(new ApiResponse(200, "fetched successfully", response));
});

export default {
  getIncompleteUpload,
  getAllUploads,
};
