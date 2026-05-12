import express from "express";
const userRoutes = express.Router();
import auth from "../middlewares/auth.js";
import userCtr from "../controllers/userController.js";

userRoutes.get(
  "/incomplete-upload",
  auth.authenticate,
  auth.authorize("user", "admin"),
  userCtr.getIncompleteUpload,
);

userRoutes.get(
  "/get-all-uploads",
  auth.authenticate,
  auth.authorize("user", "admin"),
  userCtr.getAllUploads,
);

export default userRoutes;
