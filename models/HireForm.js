import mongoose from "mongoose";

const hireFormSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    developer: { type: String, required: true }, // selected subcategory
    hiringModel: { type: String, enum: ["full_time", "hourly"], default: "full_time" },
  },
  { timestamps: true }
);

export default mongoose.model("HireForm", hireFormSchema);
