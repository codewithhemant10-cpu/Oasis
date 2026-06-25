import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
  createDetail,
  getAllDetails,
  updateDetail,
  deleteDetail,
  getDetailBySubCategorySlug,
  getMenuStructure,
} from "../controllers/hireController.js";

import {protect , verifyAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js"; // ✅ Cloudinary Multer Storage

const router = express.Router();

// -------------------- ADMIN ROUTES --------------------
router.post("/admin/category", protect , verifyAdmin, createCategory);
router.put("/admin/category/:id", protect , verifyAdmin, updateCategory);
router.delete("/admin/category/:id", protect , verifyAdmin, deleteCategory);

router.post("/admin/subcategory", protect , verifyAdmin, createSubCategory);
router.put("/admin/subcategory/:id", protect , verifyAdmin, updateSubCategory);
router.delete("/admin/subcategory/:id", protect , verifyAdmin, deleteSubCategory);

// ✅ Now uploads go directly to Cloudinary
router.post("/admin/detail",  protect , verifyAdmin, upload.any(), createDetail);
router.put("/admin/detail/:id", protect , verifyAdmin, upload.any(), updateDetail);
router.delete("/admin/detail/:id", protect , verifyAdmin, deleteDetail);

// -------------------- PUBLIC ROUTES --------------------
router.get("/categories", getCategories);
router.get("/subcategories", getSubCategories);
router.get("/details", getAllDetails);
router.get("/menu", getMenuStructure);
router.get("/detail/:slug", getDetailBySubCategorySlug);

export default router;
