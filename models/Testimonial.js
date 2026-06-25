import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    avatar: { type: String }, // stores Cloudinary URL
    name: { type: String, required: true },
    position: { type: String, required: true },
    company: { type: String },
    stars: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", TestimonialSchema);
