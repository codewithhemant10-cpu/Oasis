import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, verifyAdmin, getDashboardStats);

export default router;
