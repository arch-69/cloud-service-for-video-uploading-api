import express from "express";
import fileRoutes from "./fileRoutes.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import adminRoutes from "./adminRoutes.js";
import publicRoutes from "./publicRoutes.js";

const router = express.Router();

router.use("/file", fileRoutes);
router.use("/auth", authRoutes);
router.use("/profile", userRoutes);
router.use("/admin", adminRoutes);
router.use("/public", publicRoutes);

export default router;
