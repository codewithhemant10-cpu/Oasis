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
} from "../controllers/technologyController.js";

import { protect , verifyAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// -------------------- ADMIN ROUTES --------------------

// Categories
router.post("/category", protect , verifyAdmin, createCategory);
router.put("/category/:id", protect , verifyAdmin, updateCategory);
router.delete("/category/:id", protect , verifyAdmin, deleteCategory);

// Subcategories
router.post("/subcategory", protect , verifyAdmin, createSubCategory);
router.put("/subcategory/:id", protect , verifyAdmin, updateSubCategory);
router.delete("/subcategory/:id", protect , verifyAdmin, deleteSubCategory);

// Details (Technology Detail) - with dynamic file upload
router.post("/detail", protect , verifyAdmin, upload.any(), createDetail);
router.put("/detail/:id", protect , verifyAdmin, upload.any(), updateDetail);
router.delete("/detail/:id", protect , verifyAdmin, deleteDetail);

// -------------------- PUBLIC ROUTES --------------------

// Get all categories/subcategories/details
router.get("/categories", getCategories);
router.get("/subcategories", getSubCategories);
router.get("/details", getAllDetails);
router.get("/menu", getMenuStructure); 

// Get single technology detail by slug (for frontend View button)
router.get("/detail/:slug", getDetailBySubCategorySlug);

export default router;
