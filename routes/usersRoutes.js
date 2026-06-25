import express from "express";
import multer from "multer";
import path from "path";
import {
  getAllUsers,
  deleteUser,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ---------------- User routes ----------------
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profileImage"), updateProfile);

// ---------------- Admin routes ----------------
router.get("/", protect, verifyAdmin, getAllUsers);
router.delete("/:id", protect, verifyAdmin, deleteUser);

export default router;

