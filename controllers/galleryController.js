import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Gallery from "../models/galleryModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Build public URL from filename ───────────────────────────
const fileUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/uploads/${filename}`;

// ── Safely delete file from /uploads ─────────────────────────
const deleteFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, "..", "uploads", filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete file:", filename, err.message);
    }
  });
};

// ─────────────────────────────────────────────────────────────
//  PUBLIC CONTROLLERS
// ─────────────────────────────────────────────────────────────

// GET /api/gallery
export const getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });

    const data = galleries.map((g) => ({
      id: g._id,
      title: g.title,
      description: g.description,
      thumb: g.thumb?.url || g.images[0]?.url || "",
      imageCount: g.images.length,
      createdAt: g.createdAt,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/gallery/:id
export const getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery)
      return res
        .status(404)
        .json({ success: false, message: "Gallery not found" });

    res.json({ success: true, data: gallery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────────

// POST /api/admin/gallery
// Form fields : title, description
// Files       : thumb (single), images[] (multiple)
export const createGallery = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });

    // Build images array from uploaded files
    const uploadedImages = (req.files?.images || []).map((file) => ({
      filename: file.filename,
      url: fileUrl(req, file.filename),
    }));

    // Thumb — use uploaded thumb, else fallback to first image
    let thumb = {};
    if (req.files?.thumb?.[0]) {
      const t = req.files.thumb[0];
      thumb = { filename: t.filename, url: fileUrl(req, t.filename) };
    } else if (uploadedImages.length > 0) {
      thumb = {
        filename: uploadedImages[0].filename,
        url: uploadedImages[0].url,
      };
    }

    const gallery = await Gallery.create({
      title,
      description: description || "",
      thumb,
      images: uploadedImages,
    });

    res.status(201).json({ success: true, data: gallery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔥 NEW: POST /api/admin/gallery/:id/images
// Add SINGLE or MULTIPLE images to existing gallery (Frontend "Add Image" button)
export const addImages = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery)
      return res
        .status(404)
        .json({ success: false, message: "Gallery not found" });

    // 🔥 Handle SINGLE image (from "Add This Image Now" button)
    // OR MULTIPLE images (from form submit)
    const newImages = (req.files?.images || req.files || []).map((file) => ({
      filename: file.filename,
      url: fileUrl(req, file.filename),
    }));

    if (newImages.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });

    // Add new images to gallery
    gallery.images.push(...newImages);

    // Auto-set thumb if gallery had none
    if (!gallery.thumb?.url && newImages.length > 0) {
      gallery.thumb = {
        filename: newImages[0].filename,
        url: newImages[0].url,
      };
    }

    await gallery.save();
    
    res.json({ 
      success: true, 
      message: `${newImages.length} image(s) added successfully!`,
      data: gallery 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/gallery/:id
// Update title / description / thumb (Frontend form submit)
export const updateGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery)
      return res
        .status(404)
        .json({ success: false, message: "Gallery not found" });

    const { title, description } = req.body;
    if (title !== undefined) gallery.title = title;
    if (description !== undefined) gallery.description = description;

    // New thumb uploaded?
    if (req.files?.thumb?.[0]) {
      // Delete old thumb file only if it is NOT also a gallery image
      if (gallery.thumb?.filename) {
        const usedAsImage = gallery.images.some(
          (img) => img.filename === gallery.thumb.filename
        );
        if (!usedAsImage) deleteFile(gallery.thumb.filename);
      }
      const t = req.files.thumb[0];
      gallery.thumb = { filename: t.filename, url: fileUrl(req, t.filename) };
    }

    // 🔥 Also handle images from form submit (multiple images)
    if (req.files?.images && req.files.images.length > 0) {
      const newImages = req.files.images.map((file) => ({
        filename: file.filename,
        url: fileUrl(req, file.filename),
      }));
      gallery.images.push(...newImages);
    }

    await gallery.save();
    res.json({ success: true, data: gallery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/gallery/:id
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery)
      return res
        .status(404)
        .json({ success: false, message: "Gallery not found" });

    // Delete all image files
    gallery.images.forEach((img) => deleteFile(img.filename));

    // Delete thumb if it is separate from images
    if (gallery.thumb?.filename) {
      const usedAsImage = gallery.images.some(
        (i) => i.filename === gallery.thumb.filename
      );
      if (!usedAsImage) deleteFile(gallery.thumb.filename);
    }

    await gallery.deleteOne();
    res.json({ success: true, message: "Gallery deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/gallery/:id/images/:imageId
export const deleteImage = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery)
      return res
        .status(404)
        .json({ success: false, message: "Gallery not found" });

    const imageIndex = gallery.images.findIndex(
      (img) => img._id.toString() === req.params.imageId
    );
    if (imageIndex === -1)
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });

    const [removed] = gallery.images.splice(imageIndex, 1);
    deleteFile(removed.filename);

    // If removed image was the thumb → reset thumb to first remaining image
    if (gallery.thumb?.filename === removed.filename) {
      if (gallery.images.length > 0) {
        gallery.thumb = {
          filename: gallery.images[0].filename,
          url: gallery.images[0].url,
        };
      } else {
        gallery.thumb = { url: "", filename: "" };
      }
    }

    await gallery.save();
    res.json({ success: true, data: gallery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
