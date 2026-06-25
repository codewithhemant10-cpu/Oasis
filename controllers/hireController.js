// import mongoose from "mongoose";
// import HireCategory from "../models/HireCategory.js";
// import HireSubCategory from "../models/HireSubCategory.js";
// import HireDetail from "../models/HireDetail.js";
// import slugify from "slugify";
// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";

// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const deleteCloudImage = async (publicId) => {
//   if (!publicId) return;
//   try {
//     await cloudinary.uploader.destroy(publicId);
//   } catch (err) {
//     console.error("Cloudinary delete error:", err);
//   }
// };

// // ✅ add this right below imports
// const asyncHandler = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };
// // Safe JSON parse helper
// const safeParse = (data) => {
//   try {
//     return typeof data === "string" ? JSON.parse(data) : data;
//   } catch {
//     return {};
//   }
// };

// // ---------------- CATEGORY CRUD ----------------
// export const createCategory = async (req, res) => {
//   try {
//     const category = new HireCategory(req.body);
//     await category.save();
//     res.status(201).json(category);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getCategories = async (req, res) => {
//   try {
//     const categories = await HireCategory.find();
//     res.json(categories);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const updateCategory = async (req, res) => {
//   try {
//     const category = await HireCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!category) return res.status(404).json({ message: "Category not found" });
//     res.json(category);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const deleteCategory = async (req, res) => {
//   try {
//     await HireCategory.findByIdAndDelete(req.params.id);
//     res.json({ message: "Category deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ---------------- SUBCATEGORY CRUD ----------------
// export const createSubCategory = async (req, res) => {
//   try {
//     const { name, category } = req.body;
//     if (!name || !category) return res.status(400).json({ message: "Name and category are required" });

//     const slug = slugify(name, { lower: true, strict: true });
//     const subCategory = new HireSubCategory({ name, category, slug });
//     await subCategory.save();
//     res.status(201).json(subCategory);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getSubCategories = async (req, res) => {
//   try {
//     const subs = await HireSubCategory.find().populate("category");
//     res.json(subs);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const updateSubCategory = async (req, res) => {
//   try {
//     const { name, category } = req.body;
//     if (!name || !category) return res.status(400).json({ message: "Name and category are required" });

//     const slug = slugify(name, { lower: true, strict: true });
//     const sub = await HireSubCategory.findByIdAndUpdate(
//       req.params.id,
//       { name, category, slug },
//       { new: true }
//     );

//     if (!sub) return res.status(404).json({ message: "Subcategory not found" });
//     res.json(sub);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const deleteSubCategory = async (req, res) => {
//   try {
//     await HireSubCategory.findByIdAndDelete(req.params.id);
//     res.json({ message: "Subcategory deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// <<<<<<< HEAD
// // Helper function to parse FormData arrays
// const parseFormDataArray = (body, fieldPattern) => {
//   const result = [];
//   const keys = Object.keys(body).filter(key => key.startsWith(fieldPattern));

//   // Extract indices
//   const indices = new Set();
//   keys.forEach(key => {
//     const match = key.match(/\[(\d+)\]/);
//     if (match) indices.add(parseInt(match[1]));
//   });

//   return Array.from(indices).sort((a, b) => a - b);
// };

// // ---------------- DETAILS CRUD ----------------
// export const createDetail = async (req, res) => {
//   try {
//     // Basic validation
//     const { subCategory } = req.body;
//     if (!subCategory || !mongoose.Types.ObjectId.isValid(subCategory)) {
//       return res.status(400).json({ message: "Valid SubCategory is required" });
//     }
//     const existingSub = await HireSubCategory.findById(subCategory);
//     if (!existingSub) return res.status(400).json({ message: "SubCategory not found" });

//     // Helper: try to parse JSON string fields to objects (if they come as strings from FormData)
//     const tryParse = (val) => {
//       if (!val) return null;
//       if (typeof val === "object") return val;
//       if (typeof val === "string") {
//         try { return JSON.parse(val); } catch (e) { return null; }
//       }
//       return null;
//     };

//     // Parse possible sections
//     let heroSection = tryParse(req.body.heroSection) || {};
//     let TitleDescriptionSection = tryParse(req.body.TitleDescriptionSection) || {};
//     let servicesSection = tryParse(req.body.servicesSection) || { title: "", cards: [] };
//     let whyChooseUsSection = tryParse(req.body.whyChooseUsSection) || { title: "", points: [] };
//     let benefitsSection = tryParse(req.body.benefitsSection) || { title: "Benefits", points: [] };
//     let codeQualitySection = tryParse(req.body.codeQualitySection) || { title: "How Our Developers Ensure Code Quality", cards: [] };

//     // If those weren't provided as grouped JSON but as flat keys (like heroSection[title]) try to read them
//     // (This preserves backwards compatibility with your older parsing approach)
//     if (!heroSection.title && req.body["heroSection[title]"]) {
//       heroSection.title = req.body["heroSection[title]"] || "";
//       heroSection.description = req.body["heroSection[description]"] || "";
//     }
//     if (!TitleDescriptionSection.title && req.body["TitleDescriptionSection[title]"]) {
//       TitleDescriptionSection.title = req.body["TitleDescriptionSection[title]"] || "";
//       TitleDescriptionSection.description = req.body["TitleDescriptionSection[description]"] || "";
//     }
//     if ((!servicesSection || !Array.isArray(servicesSection.cards) || servicesSection.cards.length === 0)
//         && req.body["servicesSection[title]"]) {
//       servicesSection = servicesSection || {};
//       servicesSection.title = req.body["servicesSection[title]"] || "";
//       // try to reconstruct cards from flat keys
//       const cards = [];
//       Object.keys(req.body).forEach(k => {
//         const m = k.match(/^servicesSection\[cards\]\[(\d+)\]\[(title|description)\]$/);
//         if (m) {
//           const i = Number(m[1]);
//           cards[i] = cards[i] || { title: "", description: "" };
//           cards[i][m[2]] = req.body[k];
//         }
//       });
//       servicesSection.cards = cards.filter(Boolean);
//     }

//     // Handle files: multer typically provides req.files as an array
//     // Files may have fieldnames like: "heroSection[icon]", "servicesSection[cards][0][icon]" OR custom "serviceIcon_0"
//     const files = req.files || [];

//     // Hero icon
//     const heroFile = files.find(f => f.fieldname === "heroSection[icon]" || f.fieldname === "heroIcon");
//     if (heroFile) heroSection.icon = heroFile.filename;
//     // If heroSection.icon isn't set, it will remain undefined (you can set a default later)

//     // Service cards icons: handle both patterns
//     // - pattern A: fieldname === `servicesSection[cards][${idx}][icon]`
//     // - pattern B: fieldname === `serviceIcon_${idx}` (what your logs showed)
//     files.forEach(file => {
//       // pattern A
//       const mA = file.fieldname.match(/^servicesSection\[cards\]\[(\d+)\]\[icon\]$/);
//       if (mA) {
//         const idx = Number(mA[1]);
//         servicesSection.cards = servicesSection.cards || [];
//         servicesSection.cards[idx] = servicesSection.cards[idx] || {};
//         servicesSection.cards[idx].icon = file.filename;
//         return;
//       }
//       // pattern B
//       const mB = file.fieldname.match(/^serviceIcon_(\d+)$/);
//       if (mB) {
//         const idx = Number(mB[1]);
//         servicesSection.cards = servicesSection.cards || [];
//         servicesSection.cards[idx] = servicesSection.cards[idx] || {};
//         servicesSection.cards[idx].icon = file.filename;
//         return;
//       }
//       // other possible patterns: keep as-is (no-op)
//     });

//     // Ensure service cards exist at least as empty objects
//     servicesSection.cards = (servicesSection.cards || []).map(c => ({
//       title: c.title || "",
//       description: c.description || "",
//       icon: c.icon || ""
//     }));

//     // If any sections are still strings accidentally, coerce to expected shape
//     heroSection = {
//       title: heroSection.title || "",
//       description: heroSection.description || "",
//       icon: heroSection.icon || "",
//       features: Array.isArray(heroSection.features) ? heroSection.features : (heroSection.features ? [heroSection.features] : [])
//     };

//     TitleDescriptionSection = {
//       title: TitleDescriptionSection.title || "",
//       description: TitleDescriptionSection.description || ""
//     };

//     whyChooseUsSection = {
//       title: whyChooseUsSection.title || "",
//       points: Array.isArray(whyChooseUsSection.points) ? whyChooseUsSection.points : []
//     };

//     benefitsSection = {
//       title: benefitsSection.title || "Benefits",
//       points: Array.isArray(benefitsSection.points) ? benefitsSection.points : []
//     };

//     codeQualitySection = {
//       title: codeQualitySection.title || "How Our Developers Ensure Code Quality",
//       cards: Array.isArray(codeQualitySection.cards) ? codeQualitySection.cards : []
//     };

//     // Build final detail object
//     const detailData = {
//       subCategory,
//       heroSection,
//       TitleDescriptionSection,
//       servicesSection,
//       whyChooseUsSection,
//       benefitsSection,
//       codeQualitySection,
//     };

//     // Save
//     const detail = new HireDetail(detailData);
//     await detail.save();

//     return res.status(201).json(detail);
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
// =======
// // ---------------- CREATE DETAIL ----------------
// export const createDetail = async (req, res) => {
//   try {
//     const heroSection = safeParse(req.body.heroSection) || {};
//     const TitleDescriptionSection = safeParse(req.body.TitleDescriptionSection) || {};
//     const servicesSection = safeParse(req.body.servicesSection) || {};
//     const whyChooseUsSection = safeParse(req.body.whyChooseUsSection) || {};
//     const benefitsSection = safeParse(req.body.benefitsSection) || {};
//     const codeQualitySection = safeParse(req.body.codeQualitySection) || {};
//     const files = req.files || [];

//     console.log("📥 Files received:", files.map(f => f.fieldname));

//     // ✅ HERO ICON
//     const heroIconFile = files.find(f => f.fieldname === "heroIcon");
//     if (heroIconFile) {
//       const upload = await cloudinary.uploader.upload(heroIconFile.path, { 
//         folder: "hire/details/hero" 
//       });
//       heroSection.icon = { url: upload.secure_url, public_id: upload.public_id };
//       console.log("✅ Hero icon uploaded:", upload.secure_url);
//     }

//     // ✅ SERVICE ICONS
//     if (Array.isArray(servicesSection.cards)) {
//       for (let i = 0; i < servicesSection.cards.length; i++) {
//         const file = files.find(f => f.fieldname === `serviceIcon_${i}`);
//         if (file) {
//           const upload = await cloudinary.uploader.upload(file.path, { 
//             folder: "hire/details/services" 
//           });
//           servicesSection.cards[i].icon = { 
//             url: upload.secure_url, 
//             public_id: upload.public_id 
//           };
//           console.log(`✅ Service icon ${i} uploaded:`, upload.secure_url);
//         }
//       }
//     }

//     const detail = await HireDetail.create({
//       subCategory: req.body.subCategory,
//       heroSection,
//       TitleDescriptionSection,
//       servicesSection,
//       whyChooseUsSection,
//       benefitsSection,
//       codeQualitySection,
//     });

//     console.log("✅ Detail created successfully:", detail._id);
//     res.status(201).json({ success: true, data: detail });
//   } catch (err) {
//     console.error("❌ Create Detail Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ---------------- UPDATE DETAIL - FIXED ----------------
// export const updateDetail = asyncHandler(async (req, res) => {
//   const detail = await HireDetail.findById(req.params.id);
//   if (!detail) return res.status(404).json({ message: "Detail not found" });

//   const files = req.files || [];

//   // Parse JSON safely
//   let heroSection = safeParse(req.body.heroSection) || {};
//   let TitleDescriptionSection = safeParse(req.body.TitleDescriptionSection) || {};
//   let servicesSection = safeParse(req.body.servicesSection) || {};
//   let whyChooseUsSection = safeParse(req.body.whyChooseUsSection) || {};
//   let benefitsSection = safeParse(req.body.benefitsSection) || {};
//   let codeQualitySection = safeParse(req.body.codeQualitySection) || {};

//   // 🟢 HERO ICON
//   heroSection.icon = detail.heroSection?.icon || null; // First preserve existing
  
//   const heroIconFile = files.find(f => f.fieldname === "heroIcon");
//   if (heroIconFile) {
//     if (detail.heroSection?.icon?.public_id) {
//       await deleteCloudImage(detail.heroSection.icon.public_id);
//     }
//     const upload = await cloudinary.uploader.upload(heroIconFile.path, { 
//       folder: "hire/details/hero" 
//     });
//     heroSection.icon = { url: upload.secure_url, public_id: upload.public_id };
//   }

//   // 🟢 SERVICE ICONS
//   if (Array.isArray(servicesSection.cards)) {
//     for (let i = 0; i < servicesSection.cards.length; i++) {
//       // First preserve existing icon
//       servicesSection.cards[i].icon = detail.servicesSection?.cards?.[i]?.icon || null;
      
//       const file = files.find(f => f.fieldname === `serviceIcon_${i}`);
//       if (file) {
//         if (detail.servicesSection?.cards?.[i]?.icon?.public_id) {
//           await deleteCloudImage(detail.servicesSection.cards[i].icon.public_id);
//         }
//         const upload = await cloudinary.uploader.upload(file.path, { 
//           folder: "hire/details/services" 
//         });
//         servicesSection.cards[i].icon = { 
//           url: upload.secure_url, 
//           public_id: upload.public_id 
//         };
//       }
//     }
// >>>>>>> b950eb9 (Save local changes before pull)
//   }

// <<<<<<< HEAD

// export const updateDetail = async (req, res) => {
//   try {

// =======
//   // Update all fields
//   detail.subCategory = req.body.subCategory || detail.subCategory;
//   detail.heroSection = heroSection;
//   detail.TitleDescriptionSection = TitleDescriptionSection;
//   detail.servicesSection = servicesSection;
//   detail.whyChooseUsSection = whyChooseUsSection;
//   detail.benefitsSection = benefitsSection;
//   detail.codeQualitySection = codeQualitySection;
// >>>>>>> b950eb9 (Save local changes before pull)

//   await detail.save();
//   res.status(200).json({ success: true, data: detail });
// });

// <<<<<<< HEAD
//     let {
//       heroSection,
//       TitleDescriptionSection,
//       servicesSection,
//       whyChooseUsSection,
//       benefitsSection,
//       codeQualitySection,
//       subCategory,
//     } = req.body;

//     // 🧠 Parse incoming JSON strings if needed
//     try {
//       if (typeof heroSection === "string") heroSection = JSON.parse(heroSection);
//       if (typeof TitleDescriptionSection === "string") TitleDescriptionSection = JSON.parse(TitleDescriptionSection);
//       if (typeof servicesSection === "string") servicesSection = JSON.parse(servicesSection);
//       if (typeof whyChooseUsSection === "string") whyChooseUsSection = JSON.parse(whyChooseUsSection);
//       if (typeof benefitsSection === "string") benefitsSection = JSON.parse(benefitsSection);
//       if (typeof codeQualitySection === "string") codeQualitySection = JSON.parse(codeQualitySection);
//     } catch (err) {
//       console.error("❌ JSON parse error:", err);
//       return res.status(400).json({ message: "Invalid JSON data received" });
//     }

//     // 🖼️ Update Hero Icon if new file uploaded
//     const heroIcon = req.files?.find((f) => f.fieldname === "heroIcon");
//     if (heroIcon) {
//       heroSection.icon = heroIcon.filename;
//     } else {
//       heroSection.icon = existingDetail.heroSection?.icon || "";
//     }

//     // 🧩 Update service icons (flat array structure)
//     if (Array.isArray(req.files) && req.files.length > 0) {
//       req.files.forEach((file) => {
//         if (file.fieldname.startsWith("serviceIcon_")) {
//           const idx = parseInt(file.fieldname.split("_")[1]);
//           if (servicesSection.cards && servicesSection.cards[idx]) {
//             servicesSection.cards[idx].icon = file.filename;
//           }
//         }
//       });
//     }

//     // Preserve old service icons if not updated
//     if (existingDetail.servicesSection?.cards?.length) {
//       servicesSection.cards = servicesSection.cards.map((card, idx) => ({
//         ...card,
//         icon: card.icon || existingDetail.servicesSection.cards[idx]?.icon || "",
//       }));
//     }

//     // 🧾 Merge updated data safely (avoid full overwrite)
//     const updateData = {
//       subCategory: subCategory || existingDetail.subCategory,
//       heroSection: {
//         ...existingDetail.heroSection,
//         ...heroSection,
//       },
//       TitleDescriptionSection: {
//         ...existingDetail.TitleDescriptionSection,
//         ...TitleDescriptionSection,
//       },
//       servicesSection: {
//         ...existingDetail.servicesSection,
//         ...servicesSection,
//       },
//       whyChooseUsSection: {
//         ...existingDetail.whyChooseUsSection,
//         ...whyChooseUsSection,
//       },
//       benefitsSection: {
//         ...existingDetail.benefitsSection,
//         ...benefitsSection,
//       },
//       codeQualitySection: {
//         ...existingDetail.codeQualitySection,
//         ...codeQualitySection,
//       },
//     };

//     const updated = await HireDetail.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     console.log("✅ Detail updated successfully:", updated._id);

//     res.json({ message: "✅ Hire detail updated successfully", data: updated });
//   } catch (error) {
//     console.error("❌ Error updating detail:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



// =======


// // ---------------- DELETE DETAIL ----------------
// >>>>>>> b950eb9 (Save local changes before pull)
// export const deleteDetail = async (req, res) => {
//   try {
//     const detail = await HireDetail.findById(req.params.id);
//     if (!detail) return res.status(404).json({ message: "Detail not found" });

//     // Delete hero icon from Cloudinary
//     if (detail.heroSection?.icon?.public_id) {
//       await deleteCloudImage(detail.heroSection.icon.public_id);
//       console.log("🗑️ Hero icon deleted");
//     }

//     // Delete all service icons from Cloudinary
//     for (const card of detail.servicesSection?.cards || []) {
//       if (card.icon?.public_id) {
//         await deleteCloudImage(card.icon.public_id);
//         console.log("🗑️ Service icon deleted:", card.icon.public_id);
//       }
//     }

//     await HireDetail.findByIdAndDelete(req.params.id);
//     console.log("✅ Detail deleted successfully");
//     res.json({ message: "Detail deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete Detail Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ---------------- USER SIDE ----------------
// export const getAllDetails = async (req, res) => {
//   try {
//     const details = await HireDetail.find().populate({
//       path: "subCategory",
//       populate: "category",
//     });
//     res.json(details);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getDetailBySubCategorySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const subCategory = await HireSubCategory.findOne({ slug });
//     if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });

//     const detail = await HireDetail.findOne({ subCategory: subCategory._id });
//     if (!detail) return res.status(404).json({ message: "Detail not found" });

//     res.json(detail);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ---------------- PUBLIC MENU ----------------
// export const getMenuStructure = async (req, res) => {
//   try {
//     const categories = await HireCategory.find();

//     const menu = await Promise.all(
//       categories.map(async (cat) => {
//         const subcategories = await HireSubCategory.find({ category: cat._id });
//         return {
//           _id: cat._id,
//           name: cat.name,
//           subcategories: subcategories.map((sub) => ({
//             _id: sub._id,
//             name: sub.name,
//             slug: sub.slug,
//           })),
//         };
//       })
//     );

//     res.status(200).json(menu);
//   } catch (error) {
//     console.error("❌ Error fetching menu:", error);
//     res.status(500).json({ message: "Failed to fetch menu", error: error.message });
//   }
// };



import mongoose from "mongoose";
import HireCategory from "../models/HireCategory.js";
import HireSubCategory from "../models/HireSubCategory.js";
import HireDetail from "../models/HireDetail.js";
import slugify from "slugify";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteCloudImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const safeParse = (data) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return {};
  }
};

// ---------------- CATEGORY CRUD ----------------
export const createCategory = async (req, res) => {
  try {
    const category = new HireCategory(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await HireCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await HireCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await HireCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- SUBCATEGORY CRUD ----------------
export const createSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) return res.status(400).json({ message: "Name and category are required" });

    const slug = slugify(name, { lower: true, strict: true });
    const subCategory = new HireSubCategory({ name, category, slug });
    await subCategory.save();
    res.status(201).json(subCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const subs = await HireSubCategory.find().populate("category");
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) return res.status(400).json({ message: "Name and category are required" });

    const slug = slugify(name, { lower: true, strict: true });
    const sub = await HireSubCategory.findByIdAndUpdate(
      req.params.id,
      { name, category, slug },
      { new: true }
    );

    if (!sub) return res.status(404).json({ message: "Subcategory not found" });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    await HireSubCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Subcategory deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- CREATE DETAIL ----------------
export const createDetail = async (req, res) => {
  try {
    const heroSection = safeParse(req.body.heroSection) || {};
    const TitleDescriptionSection = safeParse(req.body.TitleDescriptionSection) || {};
    const servicesSection = safeParse(req.body.servicesSection) || {};
    const whyChooseUsSection = safeParse(req.body.whyChooseUsSection) || {};
    const benefitsSection = safeParse(req.body.benefitsSection) || {};
    const codeQualitySection = safeParse(req.body.codeQualitySection) || {};
    const files = req.files || [];

    // HERO ICON
    const heroIconFile = files.find(f => f.fieldname === "heroIcon");
    if (heroIconFile) {
      const upload = await cloudinary.uploader.upload(heroIconFile.path, { folder: "hire/details/hero" });
      heroSection.icon = { url: upload.secure_url, public_id: upload.public_id };
    }

    // SERVICE ICONS
    if (Array.isArray(servicesSection.cards)) {
      for (let i = 0; i < servicesSection.cards.length; i++) {
        const file = files.find(f => f.fieldname === `serviceIcon_${i}`);
        if (file) {
          const upload = await cloudinary.uploader.upload(file.path, { folder: "hire/details/services" });
          servicesSection.cards[i].icon = { url: upload.secure_url, public_id: upload.public_id };
        }
      }
    }

    const detail = await HireDetail.create({
      subCategory: req.body.subCategory,
      heroSection,
      TitleDescriptionSection,
      servicesSection,
      whyChooseUsSection,
      benefitsSection,
      codeQualitySection,
    });

    res.status(201).json({ success: true, data: detail });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- UPDATE DETAIL ----------------
export const updateDetail = asyncHandler(async (req, res) => {
  const detail = await HireDetail.findById(req.params.id);
  if (!detail) return res.status(404).json({ message: "Detail not found" });

  const files = req.files || [];

  let heroSection = safeParse(req.body.heroSection) || {};
  let TitleDescriptionSection = safeParse(req.body.TitleDescriptionSection) || {};
  let servicesSection = safeParse(req.body.servicesSection) || {};
  let whyChooseUsSection = safeParse(req.body.whyChooseUsSection) || {};
  let benefitsSection = safeParse(req.body.benefitsSection) || {};
  let codeQualitySection = safeParse(req.body.codeQualitySection) || {};

  // HERO ICON UPDATE
  heroSection.icon = detail.heroSection?.icon || null;
  const heroIconFile = files.find(f => f.fieldname === "heroIcon");

  if (heroIconFile) {
    if (detail.heroSection?.icon?.public_id) {
      await deleteCloudImage(detail.heroSection.icon.public_id);
    }
    const upload = await cloudinary.uploader.upload(heroIconFile.path, { folder: "hire/details/hero" });
    heroSection.icon = { url: upload.secure_url, public_id: upload.public_id };
  }

  // SERVICE ICONS UPDATE
  if (Array.isArray(servicesSection.cards)) {
    for (let i = 0; i < servicesSection.cards.length; i++) {
      servicesSection.cards[i].icon = detail.servicesSection?.cards?.[i]?.icon || null;

      const file = files.find(f => f.fieldname === `serviceIcon_${i}`);
      if (file) {
        if (detail.servicesSection?.cards?.[i]?.icon?.public_id) {
          await deleteCloudImage(detail.servicesSection.cards[i].icon.public_id);
        }
        const upload = await cloudinary.uploader.upload(file.path, { folder: "hire/details/services" });
        servicesSection.cards[i].icon = { url: upload.secure_url, public_id: upload.public_id };
      }
    }
  }

  detail.subCategory = req.body.subCategory || detail.subCategory;
  detail.heroSection = heroSection;
  detail.TitleDescriptionSection = TitleDescriptionSection;
  detail.servicesSection = servicesSection;
  detail.whyChooseUsSection = whyChooseUsSection;
  detail.benefitsSection = benefitsSection;
  detail.codeQualitySection = codeQualitySection;

  await detail.save();
  res.status(200).json({ success: true, data: detail });
});

// ---------------- DELETE DETAIL ----------------
export const deleteDetail = async (req, res) => {
  try {
    const detail = await HireDetail.findById(req.params.id);
    if (!detail) return res.status(404).json({ message: "Detail not found" });

    if (detail.heroSection?.icon?.public_id) {
      await deleteCloudImage(detail.heroSection.icon.public_id);
    }

    for (const card of detail.servicesSection?.cards || []) {
      if (card.icon?.public_id) {
        await deleteCloudImage(card.icon.public_id);
      }
    }

    await HireDetail.findByIdAndDelete(req.params.id);
    res.json({ message: "Detail deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- USER SIDE ----------------
export const getAllDetails = async (req, res) => {
  try {
    const details = await HireDetail.find().populate({
      path: "subCategory",
      populate: "category",
    });
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDetailBySubCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const subCategory = await HireSubCategory.findOne({ slug });
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });

    const detail = await HireDetail.findOne({ subCategory: subCategory._id });
    if (!detail) return res.status(404).json({ message: "Detail not found" });

    res.json(detail);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- PUBLIC MENU ----------------
export const getMenuStructure = async (req, res) => {
  try {
    const categories = await HireCategory.find();

    const menu = await Promise.all(
      categories.map(async (cat) => {
        const subcategories = await HireSubCategory.find({ category: cat._id });
        return {
          _id: cat._id,
          name: cat.name,
          subcategories: subcategories.map((sub) => ({
            _id: sub._id,
            name: sub.name,
            slug: sub.slug,
          })),
        };
      })
    );

    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch menu" });
  }
};
