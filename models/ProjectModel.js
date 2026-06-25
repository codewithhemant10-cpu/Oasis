import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // Cloudinary image URL
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
