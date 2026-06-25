import express from "express";
import {
  createIndustryCategory,
  getIndustryCategories,
  updateIndustryCategory,
  deleteIndustryCategory,
  createIndustryDetail,
  getAllIndustryDetails,
  getIndustryDetailBySlug,
  updateIndustryDetail,
  deleteIndustryDetail,
} from "../controllers/industryController.js";

import { protect , verifyAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// -------------------- ADMIN ROUTES --------------------

// Industry Categories (Protected)
router.post("/admin/category", protect , verifyAdmin, upload.single("image"), createIndustryCategory);
router.put("/admin/category/:id", protect , verifyAdmin, upload.single("image"), updateIndustryCategory);
router.delete("/admin/category/:id", protect , verifyAdmin, deleteIndustryCategory);

// Industry Details (Protected)
router.post("/admin/detail", protect , verifyAdmin, upload.any(), createIndustryDetail);
router.put("/admin/detail/:id", protect , verifyAdmin, upload.any(), updateIndustryDetail);
router.delete("/admin/detail/:id", protect , verifyAdmin, deleteIndustryDetail);

// -------------------- PUBLIC ROUTES --------------------

// Get all categories and details
router.get("/categories", getIndustryCategories);
router.get("/details", getAllIndustryDetails);
router.get("/detail/:slug", getIndustryDetailBySlug);

export default router;