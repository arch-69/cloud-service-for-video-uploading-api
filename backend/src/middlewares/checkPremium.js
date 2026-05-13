import ApiError from "../utils/ApiError.js";
import userRepo from "../repositories/userRepo.js";
import v2fileRepo from "../repositories/v2fileRepo.js";

const checkUserSubscribed = async (req, res, next) => {
  const _id = req.user._id;
  try {
    console.log("request from middleware ", _id, req.user);
    if (!_id) return next(new ApiError(401, "invalid credentials", null));
    const uploads = await userRepo.getCompletedUploads({ _id });
    const response = await v2fileRepo.getCompletedUploads({ _id });
    console.log("uploaded data ", response);
    console.log("total uploads ", uploads.uploadedFile.length);
    if (uploads.uploadedFile.length >= 3)
      return next(
        new ApiError(
          429,
          "your free plan is expired or reached usage limit",
          null,
        ),
      );
    next();
  } catch (error) {
    throw next(new ApiError(500, error.message, error.errors));
  }
};

export default checkUserSubscribed;
