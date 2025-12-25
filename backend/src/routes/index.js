import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

// Health check endpoint
router.use("/health", healthRoutes);

// Auth endpoints
router.use("/auth", authRoutes);

// User endpoints
router.use("/users", userRoutes);

export default router;
