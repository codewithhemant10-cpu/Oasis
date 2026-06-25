import express from "express";
import { createPitch, getAllPitches, deletePitch } from "../controllers/startupPitchController.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Local storage for pitch deck (PDF/DOC)
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  ext ? cb(null, true) : cb(new Error("Only PDF/DOC files allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// ── Public Router ──────────────────────────────────────
export const publicPitchRouter = express.Router();

// POST /api/startup-pitch
publicPitchRouter.post("/", upload.single("pitchDeck"), createPitch);

// ── Admin Router ───────────────────────────────────────
export const adminPitchRouter = express.Router();
adminPitchRouter.use(protect, verifyAdmin);

// GET    /api/admin/startup-pitch
adminPitchRouter.get("/",protect , verifyAdmin, getAllPitches);

// DELETE /api/admin/startup-pitch/:id
adminPitchRouter.delete("/:id",protect , verifyAdmin, deletePitch);