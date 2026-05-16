import express from "express";
import publicController from "../controllers/publicController.js";
const publicRoutes = express.Router();

publicRoutes.get("/get-plans", publicController.getPlans);

export default publicRoutes;
