// import express from "express";
// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import { protect, verifyAdmin } from "../middleware/authMiddleware.js";
// import UserSubmission from "../models/UserSubmission.js";
// import streamifier from "streamifier";

// // ---------------- CLOUDINARY CONFIG ----------------
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ---------------- MULTER ----------------
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// const router = express.Router();

// // ✅ Upload helper - PDF alag, image alag handle
// const uploadToCloudinary = (fileBuffer, mimetype = "") => {
//   return new Promise((resolve, reject) => {
//     const isPDF = mimetype === "application/pdf";

//     const uploadOptions = {
//       folder: "services",
//       resource_type: isPDF ? "raw" : "auto", // PDF ke liye "raw" zaroori hai
//       ...(isPDF && { format: "pdf" }), // extension ensure karo
//     };

//     const stream = cloudinary.uploader.upload_stream(
//       uploadOptions,
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result.secure_url);
//       }
//     );
//     streamifier.createReadStream(fileBuffer).pipe(stream);
//   });
// };

// // ---------------- SUBMIT FORM ----------------
// router.post("/submit", protect, upload.any(), async (req, res) => {
//   try {
//     const { categoryName, serviceName, stepData } = req.body;

//     if (!categoryName || !serviceName)
//       return res.status(400).json({ message: "Category and Service are required" });

//     let stepDataParsed = {};
//     try {
//       stepDataParsed = JSON.parse(stepData || "{}");
//     } catch (err) {
//       return res.status(400).json({ message: "Invalid stepData JSON" });
//     }

//     // ✅ Files ko fieldname se group karo
//     const filesByField = {};
//     if (req.files?.length > 0) {
//       for (const file of req.files) {
//         if (!filesByField[file.fieldname]) {
//           filesByField[file.fieldname] = [];
//         }
//         filesByField[file.fieldname].push(file);
//       }
//     }

//     // ✅ Har field ki saari files upload karo - URLs array mein store
//     for (const fieldname in filesByField) {
//       const files = filesByField[fieldname];
//       const urls = [];

//       for (const file of files) {
//         try {
//           const url = await uploadToCloudinary(file.buffer, file.mimetype); // ✅ mimetype pass
//           urls.push(url);
//         } catch (err) {
//           console.error("Cloudinary upload failed:", err);
//           return res.status(500).json({ message: "File upload failed", error: err.message });
//         }
//       }

//       const label = stepDataParsed[fieldname]?.label || "File";
//       stepDataParsed[fieldname] = {
//         label,
//         value: urls, // ✅ Array of URLs ["url1", "url2"]
//       };
//     }

//     const submission = new UserSubmission({
//       userId: req.user.id,
//       categoryName,
//       serviceName,
//       stepData: stepDataParsed,
//     });

//     await submission.save();

//     res.status(201).json({
//       message: "Form submitted successfully",
//       submissionId: submission._id,
//     });
//   } catch (err) {
//     console.error("Submit Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ---------------- USER'S OWN SUBMISSIONS ----------------
// router.get("/mine", protect, async (req, res) => {
//   try {
//     const submissions = await UserSubmission.find({ userId: req.user.id })
//       .sort({ createdAt: -1 });
//     res.status(200).json(submissions);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ADMIN: GET ALL SUBMISSIONS
// router.get("/all", protect, verifyAdmin, async (req, res) => {
//   try {
//     const submissions = await UserSubmission.find()
//       .populate("userId", "firstName lastName email mobile")
//       .sort({ createdAt: -1 });

//     res.status(200).json(submissions);
//   } catch (err) {
//     console.error("Error fetching submissions:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // GET SINGLE SUBMISSION BY ID
// router.get("/:id", protect, verifyAdmin, async (req, res) => {
//   try {
//     const submission = await UserSubmission.findById(req.params.id)
//       .populate("userId", "firstName lastName email mobile");

//     if (!submission) {
//       return res.status(404).json({ message: "Submission not found" });
//     }

//     res.status(200).json(submission);
//   } catch (err) {
//     console.error("Error fetching submission:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ---------------- UPDATE SUBMISSION ----------------
// router.put("/update/:id", protect, upload.any(), async (req, res) => {
//   try {
//     const submission = await UserSubmission.findOne({
//       _id: req.params.id,
//       userId: req.user.id,
//     });

//     if (!submission)
//       return res.status(404).json({ message: "Submission not found" });

//     let updatedStepData = submission.stepData;

//     if (req.body.stepData) {
//       const newFields = JSON.parse(req.body.stepData);
//       updatedStepData = { ...updatedStepData, ...newFields };
//     }

//     // ✅ Update mein bhi multiple files handle
//     if (req.files?.length > 0) {
//       const filesByField = {};
//       for (const file of req.files) {
//         if (!filesByField[file.fieldname]) {
//           filesByField[file.fieldname] = [];
//         }
//         filesByField[file.fieldname].push(file);
//       }

//       for (const fieldname in filesByField) {
//         const files = filesByField[fieldname];
//         const urls = [];

//         for (const file of files) {
//           const url = await uploadToCloudinary(file.buffer, file.mimetype); // ✅ mimetype pass
//           urls.push(url);
//         }

//         updatedStepData[fieldname] = {
//           label: updatedStepData[fieldname]?.label || "File",
//           value: urls, // ✅ Array of URLs
//         };
//       }
//     }

//     submission.stepData = updatedStepData;
//     await submission.save();

//     res.json({ message: "Submission updated successfully", submission });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ---------------- DELETE SUBMISSION (ADMIN) ----------------
// router.delete("/delete/:id", protect, verifyAdmin, async (req, res) => {
//   try {
//     const submission = await UserSubmission.findByIdAndDelete(req.params.id);

//     if (!submission) {
//       return res.status(404).json({ message: "Submission not found" });
//     }

//     res.status(200).json({ message: "Submission deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting submission:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ADMIN: UPDATE ORDER STATUS
// router.put("/status/:id", protect, verifyAdmin, async (req, res) => {
//   try {
//     const { status } = req.body;

//     const submission = await UserSubmission.findById(req.params.id);
//     if (!submission) {
//       return res.status(404).json({ message: "Submission not found" });
//     }

//     submission.status = status;
//     await submission.save();

//     res.json({ message: "Status updated", submission });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// export default router;



import express from "express";
import multer from "multer";
import path, { join, dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";
import UserSubmission from "../models/UserSubmission.js";

const router = express.Router();

// ✅ ES Module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Absolute uploads path
const uploadDir = join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer - Absolute path with diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // ✅ Absolute path - no more crash
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

// ✅ File filter - allowed formats only
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and PDFs allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per file
});

// ✅ Multer error handler middleware
const uploadAny = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// ✅ File ka public URL banao
const getFileUrl = (req, filename) => {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};

// ---------------- SUBMIT FORM ----------------
router.post("/submit", protect, uploadAny, async (req, res) => {
  try {
    console.log("=== SUBMIT HIT ===");
    console.log("USER:", req.user?._id);
    console.log("BODY keys:", Object.keys(req.body));
    console.log("FILES count:", req.files?.length);

    const { categoryName, serviceName, stepData } = req.body;

    if (!categoryName || !serviceName) {
      return res.status(400).json({ message: "Category and Service are required" });
    }

    // ✅ stepData parse karo
    let stepDataParsed = {};
    try {
      stepDataParsed = JSON.parse(stepData || "{}");
    } catch (err) {
      return res.status(400).json({ message: "Invalid stepData JSON" });
    }

    // ✅ Files ko fieldname se group karo
    const filesByField = {};
    if (req.files?.length > 0) {
      for (const file of req.files) {
        if (!filesByField[file.fieldname]) {
          filesByField[file.fieldname] = [];
        }
        filesByField[file.fieldname].push(file);
      }
    }

    // ✅ Har field ki files ka public URL banao
    for (const fieldname in filesByField) {
      const files = filesByField[fieldname];
      const urls = files.map((file) => getFileUrl(req, file.filename));
      const label = stepDataParsed[fieldname]?.label || "File";
      stepDataParsed[fieldname] = {
        label,
        value: urls,
      };
    }

    // ✅ DB mein save karo
    const submission = new UserSubmission({
      userId: req.user._id,
      categoryName,
      serviceName,
      stepData: stepDataParsed,
    });

    await submission.save();

    res.status(201).json({
      message: "Form submitted successfully",
      submissionId: submission._id,
    });
  } catch (err) {
    console.error("Submit Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------- USER'S OWN SUBMISSIONS ----------------
router.get("/mine", protect, async (req, res) => {
  try {
    const submissions = await UserSubmission.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (err) {
    console.error("Mine Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------- ADMIN: GET ALL SUBMISSIONS ----------------
router.get("/all", protect, verifyAdmin, async (req, res) => {
  try {
    const submissions = await UserSubmission.find()
      .populate("userId", "firstName lastName email mobile")
      .sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (err) {
    console.error("All submissions Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------- GET SINGLE SUBMISSION BY ID ----------------
router.get("/:id", protect, verifyAdmin, async (req, res) => {
  try {
    const submission = await UserSubmission.findById(req.params.id).populate(
      "userId",
      "firstName lastName email mobile"
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.status(200).json(submission);
  } catch (err) {
    console.error("Get single Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------- UPDATE SUBMISSION ----------------
router.put("/update/:id", protect, uploadAny, async (req, res) => {
  try {
    const submission = await UserSubmission.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // ✅ Existing stepData copy karo
    let updatedStepData = { ...submission.stepData };

    // ✅ Text fields update karo
    if (req.body.stepData) {
      const newFields = JSON.parse(req.body.stepData);
      updatedStepData = { ...updatedStepData, ...newFields };
    }

    // ✅ New files handle karo
    if (req.files?.length > 0) {
      const filesByField = {};
      for (const file of req.files) {
        if (!filesByField[file.fieldname]) {
          filesByField[file.fieldname] = [];
        }
        filesByField[file.fieldname].push(file);
      }

      for (const fieldname in filesByField) {
        const files = filesByField[fieldname];
        const urls = files.map((file) => getFileUrl(req, file.filename));
        updatedStepData[fieldname] = {
          label: updatedStepData[fieldname]?.label || "File",
          value: urls,
        };
      }
    }

    submission.stepData = updatedStepData;
    await submission.save();

    res.json({ message: "Submission updated successfully", submission });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------- DELETE SUBMISSION (ADMIN) ----------------
router.delete("/delete/:id", protect, verifyAdmin, async (req, res) => {
  try {
    const submission = await UserSubmission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------- ADMIN: UPDATE ORDER STATUS ----------------
router.put("/status/:id", protect, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Pending", "In Review", "In Process", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const submission = await UserSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.status = status;
    await submission.save();

    res.json({ message: "Status updated", submission });
  } catch (err) {
    console.error("Status update Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;