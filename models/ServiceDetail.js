// import mongoose from "mongoose";
// import slugify from "slugify";

// const ServiceDetailSchema = new mongoose.Schema(
//   {
//     subCategory: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ServiceSubCategory",
//       required: true
//     },
//     slug: { type: String, unique: true, sparse: true },

//     heroSection: {
//       title: { type: String, required: true },
//       description: { type: String },
//       image: {
//         type: {
//           url: { type: String },
//           public_id: { type: String },
//         },
//         default: null,  
//         required: false
//       },
//     },

//     titleDescriptionSections: [
//       {
//         title: String,
//         descriptions: [String],
//       },
//     ],

//     developmentProcess: {
//       title: String,
//       cards: [
//         {
//           title: String,
//           description: String,
//           icon: {
//             type: {
//               url: String,
//               public_id: String,
//             },
//             default: null,  
//             required: false
//           },
//           listItems: [String],
//           duration: String,
//         },
//       ],
//     },

//     developmentProcessTitle: { type: String },

//     servicesSection: {
//       title: String,
//       cards: [
//         {
//           icon: {
//             type: {
//               url: String,
//               public_id: String,
//             },
//             default: null,  // ✅ KEY FIX: Allow null
//             required: false
//           },
//           title: String,
//           description: String,
//         },
//       ],
//     },

//     whyChooseUsSection: {
//       title: String,
//       points: [
//         {
//           heading: String,
//           description: String,
//         },
//       ],
//     },

//     pricingSection: {
//       title: { type: String },
//       plans: [
//         {
//           planName: { type: String },
//           price: { type: String },
//           duration: { type: String },
//           features: [{ type: String }],
//         }
//       ],
//     },
//   },
//   { timestamps: true }
// );

// // ✅ Auto-generate slug before saving
// ServiceDetailSchema.pre("save", async function (next) {
//   if (!this.slug && this.subCategory) {
//     const sub = await mongoose.model("ServiceSubCategory").findById(this.subCategory);
//     if (sub && sub.slug) {
//       this.slug = `${sub.slug}-${Date.now()}`;
//     } else {
//       this.slug = `detail-${Date.now()}`;
//     }
//   }
//   next();
// });

// export default mongoose.model("ServiceDetail", ServiceDetailSchema);











import mongoose from "mongoose";
import slugify from "slugify";

const ServiceDetailSchema = new mongoose.Schema(
  {
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceSubCategory",
      required: true,
    },
    slug: { type: String, unique: true, sparse: true },

    heroSection: {
      title: { type: String, required: true },
      description: { type: String },
      image: {
        type: {
          url: { type: String },
          public_id: { type: String },
        },
        default: null,
        required: false,
      },
    },

    titleDescriptionSections: [
      {
        title: String,
        descriptions: [String],
      },
    ],

    developmentProcess: {
      title: String,
      cards: [
        {
          title: String,
          description: String,
          icon: {
            type: {
              url: String,
              public_id: String,
            },
            default: null,
            required: false,
          },
          listItems: [String],
          duration: String,
        },
      ],
    },

    developmentProcessTitle: { type: String },

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
            required: false,
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

    pricingSection: {
      title: { type: String },
      plans: [
        {
          planName: { type: String },
          price: { type: String },
          duration: { type: String },
          features: [{ type: String }],
        },
      ],
    },

    // ✅ NEW: FAQ Section - per-service dynamic FAQs
    faqSection: {
      title: { type: String, default: "Frequently Asked Questions" },
      subtitle: { type: String, default: "" },
      faqs: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true },
          order: { type: Number, default: 0 },
        },
      ],
    },
  },
  { timestamps: true }
);

// ✅ Auto-generate slug before saving
ServiceDetailSchema.pre("save", async function (next) {
  if (!this.slug && this.subCategory) {
    const sub = await mongoose
      .model("ServiceSubCategory")
      .findById(this.subCategory);
    if (sub && sub.slug) {
      this.slug = `${sub.slug}-${Date.now()}`;
    } else {
      this.slug = `detail-${Date.now()}`;
    }
  }
  next();
});

export default mongoose.model("ServiceDetail", ServiceDetailSchema);