import StartupPitch from "../models/StartupPitch.js";
import path from "path";

// ✅ POST /api/startup-pitch  — Submit form
export const createPitch = async (req, res) => {
  try {
    const {
      fullName, email, phone, college, yearCourse,
      ideaName, ideaDescription, ideaStage, targetMarket, uniqueValue,
      teamSize, teamDetails,
      supportType, fundingDetails,
      demoLink,
    } = req.body;

    // Build pitch object
    const pitchData = {
      fullName, email, phone, college, yearCourse,
      ideaName, ideaDescription, ideaStage, targetMarket, uniqueValue,
      teamSize, teamDetails,
      supportType, fundingDetails,
      demoLink,
    };

    // Agar file upload hua ho
    if (req.file) {
      pitchData.pitchDeck = {
        url: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
      };
    }

    const pitch = await StartupPitch.create(pitchData);

    res.status(201).json({ success: true, message: "Application submitted!", data: pitch });
  } catch (err) {
    console.error("Pitch submit error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET /api/admin/startup-pitch  — All submissions
export const getAllPitches = async (req, res) => {
  try {
    const pitches = await StartupPitch.find().sort({ createdAt: -1 });
    res.status(200).json(pitches);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE /api/admin/startup-pitch/:id
export const deletePitch = async (req, res) => {
  try {
    const pitch = await StartupPitch.findByIdAndDelete(req.params.id);
    if (!pitch) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};