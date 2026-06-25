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
  createServiceDetail,
  getAllDetails,
  updateServiceDetail,
  deleteServiceDetail,
  getDetailBySubCategorySlug,
  getMenuStructure,
} from "../controllers/servicesController.js";

import { protect , verifyAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* -------------------- PUBLIC ROUTES -------------------- */

// ✅ Get all categories
router.get("/categories", getCategories);

// ✅ Get all subcategories
router.get("/subcategories", getSubCategories);

// ✅ Get all service details
router.get("/details", getAllDetails);

// ✅ Get menu structure for frontend
router.get("/menu", getMenuStructure);

// ✅ Get single service detail by subcategory slug (for frontend service detail page)
router.get("/detail/:slug", getDetailBySubCategorySlug);


/* -------------------- ADMIN ROUTES -------------------- */

// ✅ Category CRUD (with single image upload)
router.post(
  "/category",
  protect , verifyAdmin,
  upload.single("image"),
  createCategory
);

router.put(
  "/category/:id",
  protect , verifyAdmin,
  upload.single("image"),
  updateCategory
);

router.delete(
  "/category/:id",
  protect , verifyAdmin,
  deleteCategory
);


// ✅ Subcategory CRUD (optional image field)
router.post(
  "/subcategory",
  protect , verifyAdmin,
  upload.single("image"),
  createSubCategory
);

router.put(
  "/subcategory/:id",
  protect , verifyAdmin,
  upload.single("image"),
  updateSubCategory
);

router.delete(
  "/subcategory/:id",
  protect , verifyAdmin,
  deleteSubCategory
);


// ✅ Service Details CRUD (multiple uploads supported)
router.post(
  "/detail",
  protect , verifyAdmin,
  upload.any(),
  createServiceDetail
);

router.put(
  "/detail/:id",
  protect , verifyAdmin,
  upload.any(),
  updateServiceDetail
);

router.delete(
  "/detail/:id",
  protect , verifyAdmin,
  deleteServiceDetail
);

export default router;
