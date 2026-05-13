import authService from "../services/authService.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const signup = asyncHandler(async (req, res) => {
  console.log(req.body);
  const response = await authService.register(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "user registered successfully", response));
});

const login = asyncHandler(async (req, res) => {
  const response = await authService.login(req.body);

  const options = {
    httpOnly: true,
    secure: true, // Note: usually requires HTTPS in production
    sameSite: "None", // Often required if frontend/backend are on different domains
  };

  console.log(response);
  console.log(response.accessToken);

  return (
    res
      .status(200)
      // Correct syntax: .cookie("cookieName", value, options)
      .cookie("accessToken", response.accessToken, options)
      .cookie("refreshToken", response.refreshToken, options)
      .json(
        new ApiResponse(200, "User logged in successfully", {
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken, // Optional: if you also want it in the body
        }),
      )
  );
});

const refresh = asyncHandler(async (req, res) => {
  const response = await authService.refresh(req.body);
  return res.status(200).json(
    new ApiResponse(200, "token generated successfully", {
      accessToken: response,
    }),
  );
});

const singInWithGoogle = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const { idToken } = req.body;
  const { accessToken, refreshToken, user } =
    await authService.singInWithGoogle(idToken);

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      }),
    );
});

export default {
  signup,
  login,
  refresh,
  singInWithGoogle,
};
