import mongoose from "mongoose";

const TechnologyCategorySchema = new mongoose.Schema(
  {
  name: { type: String, required: true, unique: true },
},
{ timestamps: true }
);

export default mongoose.model("TechnologyCategory", TechnologyCategorySchema);
