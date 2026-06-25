import { cloudinary } from "../middleware/upload.js";

export const deleteFromCloudinary = async (req, res) => {
  try {
    const { publicId } = req.body; // from DB
    if (!publicId) return res.status(400).json({ message: "publicId required" });

    const result = await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Cloudinary Delete Error:", err);
    res.status(500).json({ message: err.message });
  }
};
