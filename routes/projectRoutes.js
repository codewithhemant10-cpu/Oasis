import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

import {protect , verifyAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// -------------------- ADMIN ROUTES --------------------
router.post("/", protect , verifyAdmin, upload.single("image"), createProject);
router.put("/:id", protect , verifyAdmin, upload.single("image"), updateProject);
router.delete("/:id", protect , verifyAdmin, deleteProject);

// -------------------- PUBLIC ROUTES --------------------
router.get("/", getAllProjects);
router.get("/:id", getProjectById);

export default router;
