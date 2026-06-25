import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const diskUpload = multer({
  storage: diskStorage,
  fileFilter: (req, file, cb) => {
    // ✅ Sirf mimetype check karo — startsWith se
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── Public Routes ──
router.get("/", getBlogs);

// ── Editor Image Upload ──
router.post(
  "/upload-image",
  protect,
  verifyAdmin,
  diskUpload.single("image"),
  (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No image provided" });

      // ✅ req se URL banao
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url: imageUrl });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Image upload failed", error: err.message });
    }
  }
);
// ── Slug Route ──
router.get("/:slug", getBlogBySlug);

// ── Admin Routes ──
router.post("/", protect, verifyAdmin, diskUpload.single("image"), createBlog);
router.put("/:id", protect, verifyAdmin, diskUpload.single("image"), updateBlog);
router.delete("/:id", protect, verifyAdmin, deleteBlog);

export default router;