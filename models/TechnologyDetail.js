import mongoose from "mongoose";
import slugify from "slugify";

const TechnologyDetailSchema = new mongoose.Schema(
  {
    subCategory: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "TechnologySubCategory", 
      required: true 
    },

    slug: { type: String, unique: true, sparse: true }, // ✅ sparse prevents duplicate null errors

    heroSection: {
  title: String,
  description: String,
  icon: {
    url: { type: String, default: "" },
    public_id: { type: String, default: "" },
  },
},


    TitleDescriptionSection: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
    },

    servicesSection: {  
      title: { type: String, default: "" },
      cards: {
        type: [
          {
            icon: {
              url: { type: String, default: "" },
              public_id: { type: String, default: "" },
            },
            title: { type: String, default: "" },
            description: { type: String, default: "" },
          },
        ],
        default: [],
      },
    },

    whyChooseUsSection: {
      title: { type: String, default: "" },
      points: {
        type: [
          {
            heading: { type: String, default: "" },
            description: { type: String, default: "" },
          },
        ],
        default: [],
      },
    },
  },
  { timestamps: true }
);

// ✅ Auto-generate slug before saving
TechnologyDetailSchema.pre("save", async function (next) {
  if (!this.slug && this.subCategory) {
    const sub = await mongoose.model("TechnologySubCategory").findById(this.subCategory);
    if (sub && sub.slug) {
      // Use subCategory slug + timestamp to ensure uniqueness
      this.slug = `${sub.slug}-${Date.now()}`;
    } else {
      // fallback slug if subCategory slug not found
      this.slug = `detail-${Date.now()}`;
    }
  }
  next();
});

export default mongoose.model("TechnologyDetail", TechnologyDetailSchema);
