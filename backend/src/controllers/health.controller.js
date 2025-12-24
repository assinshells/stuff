import mongoose from "mongoose";
import { ENV } from "../config/env.js";

class HealthController {
  async check(req, res) {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    const healthStatus = {
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: ENV.NODE_ENV,
      database: {
        status: dbStatus,
        name: mongoose.connection.name,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        total:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
      },
    };

    res.status(200).json(healthStatus);
  }
}

export const healthController = new HealthController();
export default healthController;
