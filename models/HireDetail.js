import mongoose from "mongoose";

const HireDetailSchema = new mongoose.Schema(
  {
    subCategory: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "HireSubCategory", 
      required: true 
    },
    slug: { type: String, unique: true, sparse: true },

    heroSection: {
      title: String,
      description: String,
      icon: {
        type: {                    
          url: String,
          public_id: String,
        },
        default: null,             
        required: false            
      },
      features: [
        {
          number: String,
          title: String,
          subtitle: String,
        },
      ],
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
            type: {                
              url: String,
              public_id: String,
            },
            default: null,         
            required: false        
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

    benefitsSection: {
      title: { type: String, default: "Benefits" },
      points: [String],
    },

    codeQualitySection: {
      title: { type: String, default: "How Our Developers Ensure Code Quality" },
      cards: [
        {
          header: String,
          points: [String],
        },
      ],
    },
  },
  { timestamps: true }
);

HireDetailSchema.pre("save", async function (next) {
  if (!this.slug && this.subCategory) {
    const sub = await mongoose.model("HireSubCategory").findById(this.subCategory);
    this.slug = sub?.slug ? `${sub.slug}-${Date.now()}` : `detail-${Date.now()}`;
  }
  next();
});

export default mongoose.model("HireDetail", HireDetailSchema);