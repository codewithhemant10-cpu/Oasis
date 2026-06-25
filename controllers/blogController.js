import Blog from "../models/BlogModel.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import slugify from "slugify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { category, author, title, description, content } = req.body;

    if (!category || !author || !title || !description)
      return res.status(400).json({ message: "All fields are required" });

    let imageUrl = "";
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    let slug = slugify(title, { lower: true, strict: true });
    const exists = await Blog.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now()}`;

    const newBlog = await Blog.create({
      category, author, title, slug,
      description,
      content: content || "",
      image: imageUrl,
    });

    res.status(201).json(newBlog);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, author, title, description, content } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // ✅ Naya image aaya toh purana delete karo
    let imageUrl = blog.image;
    if (req.file) {
      if (blog.image) {
        const oldPath = path.join(__dirname, "..", "uploads", path.basename(blog.image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    // ✅ Slug sirf tab change karo jab title badla ho
    let newSlug = blog.slug;
    if (title !== blog.title) {
      newSlug = slugify(title, { lower: true, strict: true });
      const exists = await Blog.findOne({ slug: newSlug, _id: { $ne: id } });
      if (exists) newSlug = `${newSlug}-${Date.now()}`;
    }

    // ✅ findByIdAndUpdate — slug unique error nahi aayega
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        category, author, title,
        slug: newSlug,
        description,
        content: content || blog.content,
        image: imageUrl,
      },
      { new: true, runValidators: true }
    );

    res.json({ message: "Blog updated successfully", blog: updatedBlog });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ message: "Error updating blog", error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.image) {
      const imgPath = path.join(__dirname, "..", "uploads", path.basename(blog.image));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Blog.findByIdAndDelete(id);
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error });
  }
};