import express from "express";
import multer from "multer";
import { protect , verifyAdmin } from "../middleware/authMiddleware.js";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();

// Multer config for temporary upload before Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ---------- Public ----------
router.get("/", getTestimonials);

// ---------- Admin ----------
router.post("/", protect , verifyAdmin, upload.single("avatar"), createTestimonial);
router.put("/:id", protect , verifyAdmin, upload.single("avatar"), updateTestimonial);
router.delete("/:id", protect , verifyAdmin, deleteTestimonial);

export default router;
