import express from "express";
import userCtr from "../controllers/authController.js";
import validate from "../middlewares/validate.js";
import userSchema from "../validations/userSchema.js";
const authRoutes = express.Router();

authRoutes.post(
  "/register",
  validate(userSchema.registrationSchema),
  userCtr.signup,
);

authRoutes.post("/login", validate(userSchema.loginSchema), userCtr.login);

authRoutes.post("/refresh", userCtr.refresh);

authRoutes.post("/google", userCtr.singInWithGoogle);

export default authRoutes;
