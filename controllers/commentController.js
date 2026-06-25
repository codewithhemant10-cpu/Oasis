import Comment from "../models/CommentModel.js";

// ✅ Public — comment submit karo
export const createComment = async (req, res) => {
  try {
    const { blogId, name, email, topic, message } = req.body;
    if (!blogId || !name || !email || !message)
      return res.status(400).json({ message: "All fields are required" });

    const comment = await Comment.create({ blogId, name, email, topic, message });
    res.status(201).json({ message: "Comment submitted successfully", comment });
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin — sab comments dekho
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("blogId", "title slug")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin — ek blog ke comments
export const getCommentsByBlog = async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin — status update (approve/reject)
export const updateCommentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Status updated", comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin — delete comment
export const deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};