import express from "express";
import {
  getAllGalleries,
  getGallery,
  createGallery,
  addImages,
  updateGallery,
  deleteGallery,
  deleteImage,
} from "../controllers/galleryController.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

// ─────────────────────────────────────────────────────────────
//  PUBLIC ROUTER  →  /api/gallery/...
// ─────────────────────────────────────────────────────────────
export const publicGalleryRouter = express.Router();

// GET  /api/gallery
publicGalleryRouter.get("/", getAllGalleries);

// GET  /api/gallery/:id
publicGalleryRouter.get("/:id", getGallery);


// ─────────────────────────────────────────────────────────────
//  ADMIN ROUTER  →  /api/admin/gallery/...
// ─────────────────────────────────────────────────────────────
export const adminGalleryRouter = express.Router();

adminGalleryRouter.use(protect, verifyAdmin);

// POST   /api/admin/gallery
adminGalleryRouter.post(
  "/",
  upload.fields([
    { name: "thumb", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  createGallery
);

// POST   /api/admin/gallery/:id/images
adminGalleryRouter.post(
  "/:id/images",
  upload.array("images", 20),
  addImages
);

// ✅ PATCH  /api/admin/gallery/:id  → Update title / description / thumb / images
adminGalleryRouter.patch(
  "/:id",
  upload.fields([
    { name: "thumb", maxCount: 1 },
    { name: "images", maxCount: 20 }
  ]),
  updateGallery
);

// DELETE /api/admin/gallery/:id
adminGalleryRouter.delete("/:id", deleteGallery);

// DELETE /api/admin/gallery/:id/images/:imageId
adminGalleryRouter.delete("/:id/images/:imageId", deleteImage);