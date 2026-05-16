import express from "express";
import adminSchema from "../validations/adminSchema.js";
import auth from "../middlewares/auth.js";
import adminController from "../controllers/adminController.js";
import validate from "../middlewares/validate.js";

const adminRoutes = express.Router();

adminRoutes.post(
  "/create-plan",
  validate(adminSchema.planSchema),
  auth.authenticate,
  auth.authorize("admin"),
  adminController.createPlan,
);

export default adminRoutes;
