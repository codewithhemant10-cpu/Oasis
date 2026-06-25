// ================== IndustryCategory.js ==================
import mongoose from "mongoose";
import slugify from "slugify";

const IndustryCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    slug: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

// Auto-generate slug from name on create and update
IndustryCategorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Also handle findOneAndUpdate
IndustryCategorySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("IndustryCategory", IndustryCategorySchema);
