import { decode } from "zod/v4/core";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const authenticate = async (req, res, next) => {
  const header = req.headers?.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthenticated: No token provided"));
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      return next(new ApiError(401, "Invalid token payload"));
    }

    req.user = decoded;
    next(); // Properly call next()
  } catch (err) {
    console.error("Authentication Error:", err.message);
    // Handle expired vs invalid tokens specifically if needed
    const message =
      err.name === "TokenExpiredError"
        ? "Token expired"
        : "Authentication failed";
    return next(new ApiError(401, message, err.message));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          "Forbidden: You do not have the required permissions",
        ),
      );
    }

    next();
  };
};

export default { authenticate, authorize };
