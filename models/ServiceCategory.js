import mongoose from "mongoose";

const ServiceCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },

    image: {
      url: { type: String },       
      public_id: { type: String }, 
    },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceCategory", ServiceCategorySchema);
