// UserSubmission.js (Model)
import mongoose from "mongoose";

const UserSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryName: {  // ✅ Category name (slug se)
      type: String,
      required: true,
    },
    serviceName: {  // ✅ Service name (selected service)
      type: String,
      required: true,
    },
    stepData: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Review", "In Process", "Completed"],
      default: "Pending"
    }

  },
  { timestamps: true }
);

export default mongoose.model("UserSubmission", UserSubmissionSchema);