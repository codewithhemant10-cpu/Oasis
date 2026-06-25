import Project from "../models/ProjectModel.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// 🧠 Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------- PROJECT CRUD ----------------

// ✅ Create Project (Admin)
export const createProject = async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: "Title, Category & Description are required" });
    }

    let imageUrl = "";

    // 🖼️ Upload image to Cloudinary
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "projects",
      });
      imageUrl = upload.secure_url;
    }

    const newProject = new Project({
      title,
      category,
      description,
      image: imageUrl,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    console.error("❌ Error creating project:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get All Projects (Public)
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Project by ID (Public)
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    console.error("❌ Error fetching project:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Project (Admin)
export const updateProject = async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    // 🖼️ If new image is uploaded, delete old one & upload new
    let imageUrl = project.image;
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (project.image) {
        const publicId = project.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`projects/${publicId}`);
      }

      // Upload new image
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "projects",
      });
      imageUrl = upload.secure_url;
    }

    project.title = title || project.title;
    project.category = category || project.category;
    project.description = description || project.description;
    project.image = imageUrl;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error("❌ Error updating project:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete Project (Admin)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // 🗑️ Delete Cloudinary image
    if (project.image) {
      const publicId = project.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`projects/${publicId}`);
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res.status(500).json({ message: err.message });
  }
};
