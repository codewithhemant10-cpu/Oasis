
// ================== IndustryDetail.js ==================
import mongoose from "mongoose";

const IndustryDetailSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IndustryCategory",
      required: true,
    },

    slug: { type: String, unique: true, sparse: true },

    heroSection: {
      title: String,
      description: String,
      icon: {
        url: String,
        public_id: String,
      },
    },

    TitleDescriptionSection: {
      title: String,
      description: String,
    },

    servicesSection: {
      title: String,
      cards: [
        {
          icon: {
            url: String,
            public_id: String,
          },
          title: String,
          description: String,
        },
      ],
    },

    whyChooseUsSection: {
      title: String,
      points: [
        {
          heading: String,
          description: String,
        },
      ],
    },
  },
  { timestamps: true }
);

// Auto-generate slug using category slug
IndustryDetailSchema.pre("save", async function (next) {
  if (!this.slug && this.category) {
    const cat = await mongoose.model("IndustryCategory").findById(this.category);
    if (cat && cat.slug) {
      this.slug = `${cat.slug}-${Date.now()}`;
    } else {
      this.slug = `industry-detail-${Date.now()}`;
    }
  }
  next();
});

export default mongoose.model("IndustryDetail", IndustryDetailSchema);