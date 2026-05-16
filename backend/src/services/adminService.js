import adminRepo from "../repositories/adminRepo.js";
import ApiError from "../utils/ApiError.js";

const createPlan = async (data) => {
  try {
    const isExist = await adminRepo.findByName({ name: data.name });
    if (isExist)
      throw new ApiError(409, "plan already exist with this name", null);
    const plan = await adminRepo.createPlan(data);
    return plan;
  } catch (error) {
    throw new ApiError(500, error.message, error.errors);
  }
};

const getPlans = async () => {
  return await adminRepo.getPlans();
};

export default {
  createPlan,
  getPlans,
};
