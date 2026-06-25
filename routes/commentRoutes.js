import express from "express";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";
import {
  createComment,
  getAllComments,
  getCommentsByBlog,
  updateCommentStatus,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// ✅ Public
router.post("/", createComment);

// ✅ Admin only
router.get("/", protect, verifyAdmin, getAllComments);
router.get("/blog/:blogId", protect, verifyAdmin, getCommentsByBlog);
router.put("/:id", protect, verifyAdmin, updateCommentStatus);
router.delete("/:id", protect, verifyAdmin, deleteComment);

export default router;