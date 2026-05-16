import adminRepo from "../repositories/adminRepo.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const getPlans = asyncHandler(async (req, res) => {
  const plans = await adminRepo.getPlan();
  return res
    .status(200)
    .json(new ApiResponse(200, "plans fetched successfully", plans));
});

export default {
  getPlans,
};
