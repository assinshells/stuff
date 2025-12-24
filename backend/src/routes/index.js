import { Router } from "express";
import healthRoutes from "./health.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

// Health check endpoint
router.use("/health", healthRoutes);

// API routes
router.use("/users", userRoutes);

export default router;
