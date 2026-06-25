import Testimonial from "../models/Testimonial.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ------------------- Get All -------------------
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------- Create -------------------
export const createTestimonial = async (req, res) => {
  try {
    const { title, description, name, position, company, stars } = req.body;
    let avatarUrl = "";

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "testimonials",
      });
      avatarUrl = uploaded.secure_url;
    }

    const newTestimonial = new Testimonial({
      title,
      description,
      name,
      position,
      company,
      stars,
      avatar: avatarUrl,
    });

    await newTestimonial.save();
    res.status(201).json(newTestimonial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------- Update -------------------
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) return res.status(404).json({ message: "Not found" });

    const { title, description, name, position, company, stars } = req.body;

    testimonial.title = title || testimonial.title;
    testimonial.description = description || testimonial.description;
    testimonial.name = name || testimonial.name;
    testimonial.position = position || testimonial.position;
    testimonial.company = company || testimonial.company;
    testimonial.stars = stars || testimonial.stars;

    if (req.file) {
      // delete old Cloudinary image if exists
      if (testimonial.avatar) {
        const publicId = testimonial.avatar
          .split("/")
          .pop()
          .split(".")[0];
        await cloudinary.uploader.destroy(`testimonials/${publicId}`);
      }

      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "testimonials",
      });
      testimonial.avatar = uploaded.secure_url;
    }

    await testimonial.save();
    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------- Delete -------------------
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) return res.status(404).json({ message: "Not found" });

    if (testimonial.avatar) {
      const publicId = testimonial.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`testimonials/${publicId}`);
    }

    await testimonial.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
