import mongoose from "mongoose";
import slugify from "slugify";

const HireSubCategorySchema = new mongoose.Schema(
  {
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "HireCategory", 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    slug: { 
      type: String, 
      unique: true 
    },
  },
  { timestamps: true }
);

// ✅ Automatically generate slug before saving
HireSubCategorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("HireSubCategory", HireSubCategorySchema);
