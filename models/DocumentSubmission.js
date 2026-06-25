import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  name: String,
  type: String,
  size: Number,
});

const PartnerSchema = new mongoose.Schema({
  name: String,
  // ✅ Multi-file support for partner documents
  idProof: [FileSchema],
  addressProof: [FileSchema],
});

const DocumentSubmissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    entrepreneurType: { type: String },
    hasPartners: { type: Boolean, default: false },

    // ✅ Multiple file support for all document fields
    identityProof: [FileSchema],
    panCard: [FileSchema],
    photo: [FileSchema],
    founderAddressProof: [FileSchema],
    officeAddressProof: [FileSchema],
    rentAgreement: [FileSchema],
    noc: [FileSchema],

    businessName: String,
    businessType: String,
    businessActivity: String,

    partners: [PartnerSchema],

    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("DocumentSubmission", DocumentSubmissionSchema);