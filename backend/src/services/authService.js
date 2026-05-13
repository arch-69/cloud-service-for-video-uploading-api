import User from "../models/user.js";
import userRepo from "../repositories/userRepo.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import verifyGoogleToken from "../utils/verifyGoogleToken.js";

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
  const user = await userRepo.findByEmail({ email });
  if (!user) throw new ApiError(404, "Invalid credentials", null);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials", null);

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  await userRepo.addRefreshToken({ _id: user._id, refreshToken });

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

const singInWithGoogle = async (token) => {
  try {
    const use = {
      email: "m.abrarhusayn@gmail.com",
      email_verified: true,
      name: "Abrar",
      picture:
        "https://lh3.googleusercontent.com/a/ACg8ocKy__V6MArqXvLM_PHPn0EeVcwUlL1tk9EIVRYwZWoMSUX4K68=s96-c",
    };
    const { email, name, picture } = await verifyGoogleToken(token);

    const user = await userRepo.findByEmail({ email });

    if (user) {
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();

      return { accessToken, refreshToken, user };
    }

    const genUser = await User.create({
      email,
      name,
      pfp: picture,
    });

    const accessToken = await genUser.generateAccessToken();
    const refreshToken = await genUser.generateRefreshToken();

    return { accessToken, refreshToken, user: genUser };
  } catch (error) {
    throw new ApiError(500, error.message, error.errors);
  }
};

export default {
  register,
  login,
  refresh,
  singInWithGoogle,
};
