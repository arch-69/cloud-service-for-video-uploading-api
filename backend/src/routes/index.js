import express from "express";
import fileRoutes from "./fileRoutes.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

router.use("/file", fileRoutes);
router.use("/auth", authRoutes);
router.use("/profile", userRoutes);

export default router;
