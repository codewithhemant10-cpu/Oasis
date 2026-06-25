import mongoose from "mongoose";

const startupPitchSchema = new mongoose.Schema(
  {
    // Section 1 - Personal Info (required)
    fullName:   { type: String, required: true },
    email:      { type: String, required: true },
    phone:      { type: String },
    college:    { type: String, required: true },
    yearCourse: { type: String, required: true },

    // Section 2 - Startup / Idea Details
    ideaName:        { type: String },
    ideaDescription: { type: String },
    ideaStage:       { type: String },
    targetMarket:    { type: String },
    uniqueValue:     { type: String },

    // Section 3 - Team Info
    teamSize:    { type: Number },
    teamDetails: { type: String },

    // Section 4 - Funding / Support
    supportType:    { type: String },
    fundingDetails: { type: String },

    // Section 5 - Attachments
    pitchDeck: {
      url:          { type: String },
      originalName: { type: String },
    },
    demoLink: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("StartupPitch", startupPitchSchema);