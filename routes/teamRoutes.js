import express from "express";
import multer from "multer";
import { protect , verifyAdmin } from "../middleware/authMiddleware.js";
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/teamController.js";

const router = express.Router();

// ✅ Multer setup (temporary storage for Cloudinary upload)
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Public route
router.get("/", getTeamMembers);

// Admin routes
router.post("/", protect , verifyAdmin, upload.single("image"), createTeamMember);
router.put("/:id", protect , verifyAdmin, upload.single("image"), updateTeamMember);
router.delete("/:id", protect , verifyAdmin, deleteTeamMember);

export default router;
