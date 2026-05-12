import User from "../models/user.js";
import userRepo from "../repositories/userRepo.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const register = async ({ email, name, password }) => {
  const isExist = await userRepo.findByEmail({ email });
  if (isExist)
    throw new ApiError(409, "user already exist with this email", null);

  const user = await userRepo.createUser({ email, name, password });

  if (!user)
    throw new ApiError(500, "something went wrong while registration", null);

  return User.findById(user._id).select("-password").lean();
};

const login = async ({ email, password }) => {
  // 1. Fetch user with password explicitly for comparison
  const user = await userRepo.findByEmail({ email });
  if (!user) throw new ApiError(404, "Invalid credentials", null);

  // 2. Compare
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials", null);

  // 3. Generate Tokens
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  // 4. Update DB (Consider using a separate Token schema in production)
  await userRepo.addRefreshToken({ _id: user._id, refreshToken });

  // 5. Secure Response Data
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  return {
    user: userResponse,
    refreshToken,
    accessToken,
  };
};

const refresh = async ({ refreshToken }) => {
  const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  if (!decode) throw new ApiError(409, "bad request");

  const user = await userRepo.findByUserId({ _id: decode._id });

  if (!user) throw new ApiError(401, "invalid credentials");

  const accessToken = await user.generateAccessToken();

  return accessToken;
};

export default {
  register,
  login,
  refresh,
};
