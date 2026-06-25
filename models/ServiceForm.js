import mongoose from "mongoose";

const serviceFormSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    service: { type: String, required: true }, 
  },
  { timestamps: true }
);

export default mongoose.model("ServiceForm", serviceFormSchema);
