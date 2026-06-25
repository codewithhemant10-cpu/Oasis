// // // middleware/upload.js
// // import { v2 as cloudinary } from "cloudinary";
// // import { CloudinaryStorage } from "multer-storage-cloudinary";
// // import multer from "multer";
// // import dotenv from "dotenv";

// // dotenv.config();

// // cloudinary.config({
// //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //   api_key: process.env.CLOUDINARY_API_KEY,
// //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // });

// // const storage = new CloudinaryStorage({
// //   cloudinary,
// //   params: {
// //     folder: "technocratoasis", // Cloudinary folder name
// //     allowed_formats: ["jpg", "jpeg", "png", "webp"],
// //   },
// // });

// // const upload = multer({ storage });

// // export default upload;
// // export { cloudinary };

// // middleware/upload.js
// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import multer from "multer";
// import dotenv from "dotenv";

// dotenv.config();

// // --------------------------------------------------
// // CLOUDINARY CONFIG
// // --------------------------------------------------
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // --------------------------------------------------
// // MULTER + CLOUDINARY STORAGE (FOR NORMAL FILE UPLOADS)
// // --------------------------------------------------
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "technocratoasis/documents",
//     resource_type: "auto", // images + pdf + doc + svg + videos
//   },
// });

// const upload = multer({ storage });

// // --------------------------------------------------
// // BASE64 UPLOAD HELPER (FOR React BASE64 documents)
// // --------------------------------------------------
// export const uploadBase64 = async (file) => {
//   if (!file || !file.data) return null;

//   try {
//     const uploadResult = await cloudinary.uploader.upload(
//       `data:${file.type};base64,${file.data}`,
//       {
//         folder: "technocratoasis/documents",
//         resource_type: "auto",
//       }
//     );

//     return {
//       url: uploadResult.secure_url,
//       public_id: uploadResult.public_id,
//       name: file.name,
//       type: file.type,
//       size: file.size,
//     };
//   } catch (err) {
//     console.error("Base64 upload error =>", err);
//     return null;
//   }
// };

// export { cloudinary };
// export default upload;



// middleware/upload.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// CLOUDINARY CONFIG (same as before)
// --------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --------------------------------------------------
// LOCAL STORAGE — images only (/uploads folder)
// --------------------------------------------------
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// ✅ Use this for image uploads → saves to /uploads folder
const upload = multer({
  storage: localStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// --------------------------------------------------
// CLOUDINARY STORAGE — documents/videos (same as before)
// --------------------------------------------------
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "technocratoasis/documents",
    resource_type: "auto", // pdf + doc + svg + videos
  },
});

// ✅ Use this for non-image uploads → goes to Cloudinary
export const uploadToCloudinary = multer({ storage: cloudinaryStorage });

// --------------------------------------------------
// BASE64 UPLOAD HELPER (same as before)
// --------------------------------------------------
export const uploadBase64 = async (file) => {
  if (!file || !file.data) return null;

  try {
    const uploadResult = await cloudinary.uploader.upload(
      `data:${file.type};base64,${file.data}`,
      {
        folder: "technocratoasis/documents",
        resource_type: "auto",
      }
    );

    return {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      name: file.name,
      type: file.type,
      size: file.size,
    };
  } catch (err) {
    console.error("Base64 upload error =>", err);
    return null;
  }
};

export { cloudinary };
export default upload; // ← default = local image upload