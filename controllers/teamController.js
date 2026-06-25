import TeamMember from "../models/TeamMember.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all team members (public)
export const getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create team member (admin)
export const createTeamMember = async (req, res) => {
  try {
    const { name, position, socials } = req.body;
    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "team_members",
      });
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const member = new TeamMember({
      name,
      position,
      image: imageUrl,
      imagePublicId,
      socials: socials ? JSON.parse(socials) : {},
    });

    await member.save();
    res.status(201).json(member);
  } catch (err) {
    console.error("Error creating member:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update team member (admin)
export const updateTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const { name, position, socials } = req.body;

    member.name = name || member.name;
    member.position = position || member.position;
    if (socials) member.socials = JSON.parse(socials);

    // ✅ If new image uploaded
    if (req.file) {
      if (member.imagePublicId) {
        await cloudinary.uploader.destroy(member.imagePublicId);
      }

      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "team_members",
      });

      member.image = uploadResult.secure_url;
      member.imagePublicId = uploadResult.public_id;
    }

    await member.save();
    res.json(member);
  } catch (err) {
    console.error("Error updating member:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete team member (admin)
export const deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    if (member.imagePublicId) {
      await cloudinary.uploader.destroy(member.imagePublicId);
    }

    await member.deleteOne();
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    console.error("Error deleting member:", err);
    res.status(500).json({ message: err.message });
  }
};
