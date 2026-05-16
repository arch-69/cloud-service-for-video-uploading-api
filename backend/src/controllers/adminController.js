import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import adminService from "../services/adminService.js";

const createPlan = asyncHandler(async (req, res) => {
  console.log("Admin-plna creation body: ", req.body);
  const response = await adminService.createPlan(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "plan created successfully", response));
});

export default {
  createPlan,
};
