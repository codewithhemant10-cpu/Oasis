import mongoose from "mongoose";
import slugify from "slugify";

const ServiceSubCategorySchema = new mongoose.Schema(
  {
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "ServiceCategory", 
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

ServiceSubCategorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("ServiceSubCategory", ServiceSubCategorySchema);
