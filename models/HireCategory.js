import mongoose from "mongoose";

const HireCategorySchema = new mongoose.Schema(
  {
  name: { type: String, required: true, unique: true },
},
{ timestamps: true }
);

export default mongoose.model("HireCategory", HireCategorySchema);
