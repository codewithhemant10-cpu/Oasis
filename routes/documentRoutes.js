import express from "express";
import multer from "multer";
import path, { join, dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import DocumentSubmission from "../models/DocumentSubmission.js";
import { protect } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ✅ ES Module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Absolute upload path
const uploadDir = join(__dirname, "..", "uploads", "startup_documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer Local Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ✅ Upload fields — partners ke liye up to 5
const uploadFields = upload.fields([
  { name: "identityProof", maxCount: 10 },
  { name: "panCard", maxCount: 10 },
  { name: "photo", maxCount: 10 },
  { name: "founderAddressProof", maxCount: 10 },
  { name: "officeAddressProof", maxCount: 10 },
  { name: "rentAgreement", maxCount: 10 },
  { name: "noc", maxCount: 10 },
  { name: "partners[0][idProof]", maxCount: 10 },
  { name: "partners[0][addressProof]", maxCount: 10 },
  { name: "partners[1][idProof]", maxCount: 10 },
  { name: "partners[1][addressProof]", maxCount: 10 },
  { name: "partners[2][idProof]", maxCount: 10 },
  { name: "partners[2][addressProof]", maxCount: 10 },
  { name: "partners[3][idProof]", maxCount: 10 },
  { name: "partners[3][addressProof]", maxCount: 10 },
  { name: "partners[4][idProof]", maxCount: 10 },
  { name: "partners[4][addressProof]", maxCount: 10 },
]);

// ✅ Multer error wrapper
const uploadMiddleware = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ✅ File object banana — local URL ke saath
const fileToObject = (file) => {
  const BASE_URL = process.env.BASE_URL || "https://api.technocratoasis.com";
  return {
    url: `${BASE_URL}/uploads/startup_documents/${file.filename}`,
    public_id: file.filename,
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
  };
};

// ✅ FIXED: Partners body se parse karo — dono multer formats handle karta hai
// Format 1 (flat): body["partners[0][name]"] = "Ali"
// Format 2 (nested): body.partners = [{name: "Ali"}]
const parsePartnersFromBody = (body, files) => {
  const partners = [];
  let i = 0;

  while (true) {
    let name;

    // ✅ Pehle nested object format check karo (multer kabhi kabhi yeh karta hai)
    if (body.partners && Array.isArray(body.partners) && body.partners[i] !== undefined) {
      name = body.partners[i]?.name;
    }
    // ✅ Phir flat bracket string format check karo
    else if (body[`partners[${i}][name]`] !== undefined) {
      name = body[`partners[${i}][name]`];
    }
    // ✅ Koi format match nahi — loop band karo
    else {
      break;
    }

    const idProofFiles = files[`partners[${i}][idProof]`] || [];
    const addressProofFiles = files[`partners[${i}][addressProof]`] || [];

    partners.push({
      name: name || "",
      idProof: idProofFiles.map(fileToObject),
      addressProof: addressProofFiles.map(fileToObject),
    });

    i++;
  }

  return partners;
};

/* ---------------------------
   POST Submit / Update Submission
--------------------------- */
router.post("/submit", protect, uploadMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const files = req.files || {};
    const body = req.body;

    console.log("📥 Submission from user:", userId);
    console.log("📋 Full Body:", JSON.stringify(body, null, 2));
    console.log("📁 File Keys:", Object.keys(files));

    const arrayFields = [
      "identityProof", "panCard", "photo",
      "founderAddressProof", "officeAddressProof",
      "rentAgreement", "noc",
    ];

    // ✅ Main document fields — naye uploaded files
    const uploadedDocs = {};
    arrayFields.forEach((field) => {
      if (files[field]?.length > 0) {
        uploadedDocs[field] = files[field].map(fileToObject);
      }
    });

    // ✅ Partners parse karo — FIXED
    const partners = parsePartnersFromBody(body, files);
    console.log("👥 Parsed partners:", JSON.stringify(
      partners.map(p => ({ name: p.name, idProofCount: p.idProof.length, addressProofCount: p.addressProof.length }))
    ));

    const entrepreneurType = body.entrepreneurType || "";
    const hasPartners = body.hasPartners === "true";
    const businessName = body.businessName || "";
    const businessType = body.businessType || "";
    const businessActivity = body.businessActivity || "";

    // ✅ Existing submission update karo
    let existing = await DocumentSubmission.findOne({ user: userId });

    if (existing) {
      console.log("♻️ Updating existing submission");

      // ✅ Naye files existing mein append karo
      arrayFields.forEach((field) => {
        if (uploadedDocs[field]) {
          existing[field] = [...(existing[field] || []), ...uploadedDocs[field]];
        }
      });

      // ✅ FIXED: Partners hamesha update karo — chahe files ho ya na ho
      if (partners.length > 0) {
        const mergedPartners = partners.map((newPartner, idx) => {
          const existingPartner = existing.partners?.[idx];
          if (existingPartner) {
            return {
              name: newPartner.name || existingPartner.name,
              idProof: [
                ...(existingPartner.idProof || []),
                ...newPartner.idProof,
              ],
              addressProof: [
                ...(existingPartner.addressProof || []),
                ...newPartner.addressProof,
              ],
            };
          }
          return newPartner;
        });

        // ✅ Existing mein zyada partners hain to unhe bhi rakho
        if (existing.partners?.length > partners.length) {
          for (let j = partners.length; j < existing.partners.length; j++) {
            mergedPartners.push(existing.partners[j]);
          }
        }

        existing.partners = mergedPartners;
      } else {
        // ✅ User ne "No Partners" select kiya — clear karo
        existing.partners = [];
      }

      // ✅ Text fields update
      existing.entrepreneurType = entrepreneurType;
      existing.hasPartners = hasPartners;
      if (businessName) existing.businessName = businessName;
      if (businessType) existing.businessType = businessType;
      if (businessActivity) existing.businessActivity = businessActivity;

      await existing.save();
      return res.json({
        success: true,
        message: "Documents updated successfully",
        submission: existing,
      });
    }

    // ✅ Naya submission banao
    console.log("✨ Creating new submission");
    const submission = new DocumentSubmission({
      user: userId,
      ...uploadedDocs,
      partners,
      entrepreneurType,
      hasPartners,
      businessName,
      businessType,
      businessActivity,
    });

    await submission.save();

    res.json({
      success: true,
      message: "Documents submitted successfully",
      submission,
    });
  } catch (err) {
    console.error("❌ Submit Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

/* ---------------------------
   GET My Submission
--------------------------- */
router.get("/my-submission", protect, async (req, res) => {
  try {
    const submission = await DocumentSubmission.findOne({ user: req.user._id });
    if (!submission) {
      return res.status(404).json({ success: false, message: "No submission found" });
    }
    res.json({ success: true, submission });
  } catch (e) {
    console.error("My submission error:", e);
    res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
});

/* ---------------------------
   GET Submission by User ID (Admin)
--------------------------- */
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const submission = await DocumentSubmission.findOne({ user: req.params.userId }).populate(
      "user", "firstName lastName email mobile"
    );
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    if (req.user.role !== "admin" && submission.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    res.json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

/* ---------------------------
   GET All Submissions (Admin)
--------------------------- */
router.get("/all-submissions", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const submissions = await DocumentSubmission.find()
      .populate("user", "firstName lastName email mobile role profileImage")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: submissions.length, submissions });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
});

/* ---------------------------
   PATCH Update Submission Status (Admin)
--------------------------- */
router.patch("/update-status/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const submission = await DocumentSubmission.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    res.json({ success: true, message: `Status updated to ${status}`, submission });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
});

/* ---------------------------
   DELETE Submission
--------------------------- */
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    const submission = await DocumentSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    const isOwner = submission.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // ✅ Local files delete karo
    const arrayFields = ["identityProof", "panCard", "photo", "founderAddressProof", "officeAddressProof", "rentAgreement", "noc"];
    arrayFields.forEach((field) => {
      (submission[field] || []).forEach((f) => {
        const filePath = join(uploadDir, f.public_id);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    });

    submission.partners?.forEach((partner) => {
      ["idProof", "addressProof"].forEach((field) => {
        (partner[field] || []).forEach((f) => {
          const filePath = join(uploadDir, f.public_id);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      });
    });

    await DocumentSubmission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Submission deleted successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
});

export default router;