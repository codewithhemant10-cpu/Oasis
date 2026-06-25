// models/BlogModel.js
import mongoose from "mongoose";
import slugify from "slugify";

const BlogSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true, trim: true },
    content: { type: String, default: "" }, // WYSIWYG HTML content
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-generate slug from title
BlogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Blog", BlogSchema);