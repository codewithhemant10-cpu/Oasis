// import mongoose from "mongoose";
// import ServiceCategory from "../models/ServiceCategory.js";
// import ServiceSubCategory from "../models/ServiceSubCategory.js";
// import ServiceDetail from "../models/ServiceDetail.js";
// import slugify from "slugify";
// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";

// dotenv.config();

// // 🧠 Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // 🔧 Helper: Delete old image from Cloudinary
// const deleteCloudImage = async (publicId) => {
//   if (publicId) {
//     try {
//       await cloudinary.uploader.destroy(publicId);
//     } catch (err) {
//       console.error("Cloudinary delete error:", err);
//     }
//   }
// };



// // ---------------- CATEGORY CRUD ----------------
// export const createCategory = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ message: "Name is required" });

//     const slug = slugify(name, { lower: true, strict: true });
//     let image = null;

//     if (req.file) {
//       const upload = await cloudinary.uploader.upload(req.file.path, {
//         folder: "services/categories",
//       });
//       image = {
//         url: upload.secure_url,
//         public_id: upload.public_id,
//       };
//     }

//     const category = new ServiceCategory({ name, slug, image });
//     await category.save();

//     res.status(201).json(category);
//   } catch (err) {
//     console.error("❌ Create Category Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };



// // 🟢 Get all categories
// export const getCategories = async (req, res) => {
//   try {
//     const categories = await ServiceCategory.find().sort({ createdAt: -1 });
//     res.json(categories);
//   } catch (err) {
//     console.error("❌ Get Categories Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // 🟡 Update category
// export const updateCategory = async (req, res) => {
//   try {
//     const { name } = req.body;
//     const category = await ServiceCategory.findById(req.params.id);
//     if (!category) return res.status(404).json({ message: "Category not found" });

//     const slug = slugify(name || category.name, { lower: true, strict: true });

//     // extract current image
//     let image = category.image;

//     if (req.file) {
//       // delete old image if exists
//       if (image?.public_id) {
//         await deleteCloudImage(image.public_id);
//       }

//       // upload new image
//       const upload = await cloudinary.uploader.upload(req.file.path, {
//         folder: "services/categories",
//       });

//       image = {
//         url: upload.secure_url,
//         public_id: upload.public_id,
//       };
//     }

//     // update fields
//     category.name = name || category.name;
//     category.slug = slug;
//     category.image = image;

//     await category.save();
//     res.json(category);
//   } catch (err) {
//     console.error("❌ Update Category Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// // 🔴 Delete category
// export const deleteCategory = async (req, res) => {
//   try {
//     const category = await ServiceCategory.findByIdAndDelete(req.params.id);
//     if (!category) return res.status(404).json({ message: "Category not found" });

//     // delete image from cloudinary
//     if (category.publicId) await deleteCloudImage(category.publicId);

//     // delete related subcategories & details
//     await ServiceSubCategory.deleteMany({ category: category._id });
//     await ServiceDetail.deleteMany({ category: category._id });

//     res.json({ message: "Category deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete Category Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ---------------- SUBCATEGORY CRUD ----------------
// export const createSubCategory = async (req, res) => {
//   try {
//     const { name, category } = req.body;
//     if (!name || !category)
//       return res.status(400).json({ message: "All fields required" });

//     const categoryExists = await ServiceCategory.findById(category);
//     if (!categoryExists)
//       return res.status(400).json({ message: "Category not found" });

//     const slug = slugify(name, { lower: true, strict: true });

//     let image = null;
//     let publicId = null;

//     if (req.file) {
//       const upload = await cloudinary.uploader.upload(req.file.path, {
//         folder: "services/subcategories",
//       });
//       image = upload.secure_url;
//       publicId = upload.public_id;
//     }

//     const subCategory = new ServiceSubCategory({ name, category, slug, image, publicId });
//     await subCategory.save();
//     res.status(201).json(subCategory);
//   } catch (err) {
//     console.error("❌ Create SubCategory Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getSubCategories = async (req, res) => {
//   try {
//     const subs = await ServiceSubCategory.find()
//       .populate("category")
//       .sort({ createdAt: -1 });
//     res.json(subs);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const updateSubCategory = async (req, res) => {
//   try {
//     const { name, category } = req.body;
//     const subCategory = await ServiceSubCategory.findById(req.params.id);
//     if (!subCategory)
//       return res.status(404).json({ message: "Subcategory not found" });

//     const slug = slugify(name || subCategory.name, { lower: true, strict: true });
//     let image = subCategory.image;
//     let publicId = subCategory.publicId;

//     if (req.file) {
//       await deleteCloudImage(publicId);
//       const upload = await cloudinary.uploader.upload(req.file.path, {
//         folder: "services/subcategories",
//       });
//       image = upload.secure_url;
//       publicId = upload.public_id;
//     }

//     subCategory.name = name || subCategory.name;
//     subCategory.category = category || subCategory.category;
//     subCategory.slug = slug;
//     subCategory.image = image;
//     subCategory.publicId = publicId;

//     await subCategory.save();
//     res.json(subCategory);
//   } catch (err) {
//     console.error("❌ Update SubCategory Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// export const deleteSubCategory = async (req, res) => {
//   try {
//     const sub = await ServiceSubCategory.findByIdAndDelete(req.params.id);
//     if (!sub)
//       return res.status(404).json({ message: "Subcategory not found" });

//     await deleteCloudImage(sub.publicId);
//     await ServiceDetail.deleteMany({ subCategory: sub._id });

//     res.json({ message: "Subcategory deleted" });
//   } catch (err) {
//     console.error("❌ Delete SubCategory Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ---------------- SERVICE DETAIL CRUD ----------------

// export const createServiceDetail = async (req, res) => {
//   try {
//     const {
//       subCategory,
//       heroSection,
//       titleDescriptionSections,
//       servicesSection,
//       whyChooseUsSection,
//       developmentProcess,
//       pricingSection,
//     } = req.body;

//     const heroData = JSON.parse(heroSection);
//     const titleDescData = JSON.parse(titleDescriptionSections);
//     const servicesData = JSON.parse(servicesSection);
//     const whyData = JSON.parse(whyChooseUsSection);
//     const processData = JSON.parse(developmentProcess);
//     const pricingData = JSON.parse(pricingSection);

//     // 🟢 Handle file uploads
//     const uploadToCloudinary = async (file, folder) => {
//       const result = await cloudinary.uploader.upload(file.path, { folder });
//       return { url: result.secure_url, public_id: result.public_id };
//     };

//     // Hero Image
//     const heroFile = req.files.find(f => f.fieldname === "heroSection[image]");
//     if (heroFile) heroData.image = await uploadToCloudinary(heroFile, "services/details/hero");

//     // Service Cards Icons
//     for (let i = 0; i < servicesData.cards.length; i++) {
//       const file = req.files.find(f => f.fieldname === `servicesSection[cards][${i}][icon]`);
//       if (file) {
//         servicesData.cards[i].icon = await uploadToCloudinary(file, "services/details/cards");
//       }
//     }

//     // Development Process Icons
//     for (let i = 0; i < processData.cards.length; i++) {
//       const file = req.files.find(f => f.fieldname === `developmentProcess[cards][${i}][icon]`);
//       if (file) {
//         processData.cards[i].icon = await uploadToCloudinary(file, "services/details/process");
//       }
//     }

//     // 🟢 Save document
//     const newDetail = await ServiceDetail.create({
//       subCategory,
//       heroSection: heroData,
//       titleDescriptionSections: titleDescData,
//       servicesSection: servicesData,
//       whyChooseUsSection: whyData,
//       developmentProcess: processData,
//       pricingSection: pricingData,
//     });

//     res.status(201).json({ success: true, data: newDetail });
//   } catch (err) {
//     console.error("Create Service Detail Error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// export const updateServiceDetail = async (req, res) => {
//   try {
//     const detail = await ServiceDetail.findById(req.params.id);
//     if (!detail) return res.status(404).json({ message: "Detail not found" });

//     const {
//       subCategory,
//       heroSection,
//       titleDescriptionSections,
//       servicesSection,
//       whyChooseUsSection,
//       developmentProcess,
//       pricingSection,
//     } = req.body;

//     // Parse JSON with error handling
//     let heroData, titleDescData, servicesData, whyData, processData, pricingData;
    
//     try {
//       heroData = heroSection ? JSON.parse(heroSection) : {};
//       titleDescData = titleDescriptionSections ? JSON.parse(titleDescriptionSections) : [];
//       servicesData = servicesSection ? JSON.parse(servicesSection) : { title: "", cards: [] };
//       whyData = whyChooseUsSection ? JSON.parse(whyChooseUsSection) : { title: "", points: [] };
//       processData = developmentProcess ? JSON.parse(developmentProcess) : { title: "", cards: [] };
//       pricingData = pricingSection ? JSON.parse(pricingSection) : { title: "", plans: [] };
//     } catch (parseErr) {
//       console.error("JSON Parse Error:", parseErr);
//       return res.status(400).json({ message: "Invalid JSON format", error: parseErr.message });
//     }

//     const files = req.files || [];

//     // 🟢 HERO SECTION - Complete Fix
//     const heroFile = files.find(f => f.fieldname === "heroSection[image]");
    
//     if (heroFile) {
//       // New file uploaded - delete old and upload new
//       if (detail.heroSection?.image?.public_id) {
//         await deleteCloudImage(detail.heroSection.image.public_id);
//       }
      
//       const upload = await cloudinary.uploader.upload(heroFile.path, {
//         folder: "services/details/hero",
//       });
      
//       heroData.image = {
//         url: upload.secure_url,
//         public_id: upload.public_id,
//       };
//     } else {
//       // No new file - keep existing image or set to null
//       heroData.image = detail.heroSection?.image || null;
//     }

//     // 🟢 SERVICE CARDS - Complete Fix
//     if (servicesData.cards && servicesData.cards.length > 0) {
//       for (let i = 0; i < servicesData.cards.length; i++) {
//         const file = files.find(f => f.fieldname === `servicesSection[cards][${i}][icon]`);
        
//         if (file) {
//           // New file uploaded
//           if (detail.servicesSection?.cards?.[i]?.icon?.public_id) {
//             await deleteCloudImage(detail.servicesSection.cards[i].icon.public_id);
//           }
          
//           const upload = await cloudinary.uploader.upload(file.path, {
//             folder: "services/details/cards",
//           });
          
//           servicesData.cards[i].icon = {
//             url: upload.secure_url,
//             public_id: upload.public_id,
//           };
//         } else {
//           // No new file - keep existing or set to null
//           servicesData.cards[i].icon = detail.servicesSection?.cards?.[i]?.icon || null;
//         }
//       }
//     }

//     // 🟢 DEVELOPMENT PROCESS - Complete Fix
//     if (processData.cards && processData.cards.length > 0) {
//       for (let i = 0; i < processData.cards.length; i++) {
//         const file = files.find(f => f.fieldname === `developmentProcess[cards][${i}][icon]`);
        
//         if (file) {
//           // New file uploaded
//           if (detail.developmentProcess?.cards?.[i]?.icon?.public_id) {
//             await deleteCloudImage(detail.developmentProcess.cards[i].icon.public_id);
//           }
          
//           const upload = await cloudinary.uploader.upload(file.path, {
//             folder: "services/details/process",
//           });
          
//           processData.cards[i].icon = {
//             url: upload.secure_url,
//             public_id: upload.public_id,
//           };
//         } else {
//           // No new file - keep existing or set to null
//           processData.cards[i].icon = detail.developmentProcess?.cards?.[i]?.icon || null;
//         }
//       }
//     }

//     // 🟢 UPDATE ALL FIELDS - Explicitly set each field to avoid undefined
//     detail.subCategory = subCategory || detail.subCategory;
    
//     detail.heroSection = {
//       title: heroData.title || detail.heroSection?.title || "",
//       description: heroData.description || detail.heroSection?.description || "",
//       image: heroData.image
//     };
    
//     detail.titleDescriptionSections = titleDescData;
//     detail.servicesSection = servicesData;
//     detail.whyChooseUsSection = whyData;
//     detail.developmentProcess = processData;
//     detail.pricingSection = pricingData;

//     // Validate before saving
//     const validationError = detail.validateSync();
//     if (validationError) {
//       console.error("Validation Error:", validationError);
//       return res.status(400).json({ 
//         message: "Validation failed", 
//         errors: Object.keys(validationError.errors).map(key => ({
//           field: key,
//           message: validationError.errors[key].message
//         }))
//       });
//     }

//     // Save
//     await detail.save();
    
//     console.log("✅ Detail updated successfully!");
//     res.status(200).json({ success: true, data: detail });
    
//   } catch (err) {
//     console.error("❌ Update ServiceDetail Error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: err.message,
//       stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// };


// export const deleteServiceDetail = async (req, res) => {
//   try {
//     const detail = await ServiceDetail.findById(req.params.id);
//     if (!detail) return res.status(404).json({ message: "Detail not found" });

//     if (detail.heroSection?.image?.public_id)
//       await deleteCloudImage(detail.heroSection.image.public_id);

//     for (const card of detail.servicesSection.cards || []) {
//       if (card.icon?.public_id) await deleteCloudImage(card.icon.public_id);
//     }

//     for (const card of detail.developmentProcess.cards || []) {
//       if (card.icon?.public_id) await deleteCloudImage(card.icon.public_id);
//     }

//     await ServiceDetail.findByIdAndDelete(req.params.id);
//     res.json({ message: "Service detail deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete ServiceDetail Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// export const getAllDetails = async (req, res) => {
//   try {
//     const details = await ServiceDetail.find()
//       .populate({ path: "subCategory", populate: { path: "category" } })
//       .sort({ createdAt: -1 });
//     res.json(details);
//   } catch (err) {
//     console.error("❌ Get All Details Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getDetailBySubCategorySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const subCategory = await ServiceSubCategory.findOne({ slug });
//     if (!subCategory)
//       return res.status(404).json({ message: "SubCategory not found" });

//     const detail = await ServiceDetail.findOne({ subCategory: subCategory._id }).populate({
//       path: "subCategory",
//       populate: { path: "category" },
//     });

//     if (!detail) return res.status(404).json({ message: "Detail not found" });

//     res.json(detail);
//   } catch (err) {
//     console.error("❌ Get Detail By Slug Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// // ---------------- PUBLIC MENU ----------------
// export const getMenuStructure = async (req, res) => {
//   try {
//     // 👇 pehle wali (sabse purani) categories sabse upar aayengi
//     const categories = await ServiceCategory.find().sort({ createdAt: 1 });

//     const menu = await Promise.all(
//       categories.map(async (cat) => {
//         const subcategories = await ServiceSubCategory
//           .find({ category: cat._id })
//           .sort({ createdAt: 1 }); // same order for subcategories

//         return {
//           _id: cat._id,
//           name: cat.name,
//           slug: cat.slug,
//           image: cat.image,
//           subcategories: subcategories.map((sub) => ({
//             _id: sub._id,
//             name: sub.name,
//             slug: sub.slug,
//             image: sub.image,
//           })),
//         };
//       })
//     );

//     res.status(200).json(menu);
//   } catch (error) {
//     console.error("❌ Error fetching menu:", error);
//     res.status(500).json({
//       message: "Failed to fetch menu",
//       error: error.message,
//     });
//   }
// };






import mongoose from "mongoose";
import ServiceCategory from "../models/ServiceCategory.js";
import ServiceSubCategory from "../models/ServiceSubCategory.js";
import ServiceDetail from "../models/ServiceDetail.js";
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
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Cloudinary delete error:", err);
    }
  }
};

// ---------------- CATEGORY CRUD ----------------
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const slug = slugify(name, { lower: true, strict: true });
    let image = null;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "services/categories",
      });
      image = { url: upload.secure_url, public_id: upload.public_id };
    }

    const category = new ServiceCategory({ name, slug, image });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error("❌ Create Category Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await ServiceCategory.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const slug = slugify(name || category.name, { lower: true, strict: true });
    let image = category.image;

    if (req.file) {
      if (image?.public_id) await deleteCloudImage(image.public_id);
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "services/categories",
      });
      image = { url: upload.secure_url, public_id: upload.public_id };
    }

    category.name = name || category.name;
    category.slug = slug;
    category.image = image;
    await category.save();
    res.json(category);
  } catch (err) {
    console.error("❌ Update Category Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (category.publicId) await deleteCloudImage(category.publicId);
    await ServiceSubCategory.deleteMany({ category: category._id });
    await ServiceDetail.deleteMany({ category: category._id });

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- SUBCATEGORY CRUD ----------------
export const createSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category)
      return res.status(400).json({ message: "All fields required" });

    const categoryExists = await ServiceCategory.findById(category);
    if (!categoryExists)
      return res.status(400).json({ message: "Category not found" });

    const slug = slugify(name, { lower: true, strict: true });
    let image = null;
    let publicId = null;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "services/subcategories",
      });
      image = upload.secure_url;
      publicId = upload.public_id;
    }

    const subCategory = new ServiceSubCategory({
      name, category, slug, image, publicId,
    });
    await subCategory.save();
    res.status(201).json(subCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const subs = await ServiceSubCategory.find()
      .populate("category")
      .sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;
    const subCategory = await ServiceSubCategory.findById(req.params.id);
    if (!subCategory)
      return res.status(404).json({ message: "Subcategory not found" });

    const slug = slugify(name || subCategory.name, { lower: true, strict: true });
    let image = subCategory.image;
    let publicId = subCategory.publicId;

    if (req.file) {
      await deleteCloudImage(publicId);
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "services/subcategories",
      });
      image = upload.secure_url;
      publicId = upload.public_id;
    }

    subCategory.name = name || subCategory.name;
    subCategory.category = category || subCategory.category;
    subCategory.slug = slug;
    subCategory.image = image;
    subCategory.publicId = publicId;
    await subCategory.save();
    res.json(subCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const sub = await ServiceSubCategory.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });

    await deleteCloudImage(sub.publicId);
    await ServiceDetail.deleteMany({ subCategory: sub._id });
    res.json({ message: "Subcategory deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- SERVICE DETAIL CRUD ----------------

export const createServiceDetail = async (req, res) => {
  try {
    const {
      subCategory,
      heroSection,
      titleDescriptionSections,
      servicesSection,
      whyChooseUsSection,
      developmentProcess,
      pricingSection,
      faqSection,           // ✅ NEW
    } = req.body;

    const heroData        = JSON.parse(heroSection);
    const titleDescData   = JSON.parse(titleDescriptionSections);
    const servicesData    = JSON.parse(servicesSection);
    const whyData         = JSON.parse(whyChooseUsSection);
    const processData     = JSON.parse(developmentProcess);
    const pricingData     = JSON.parse(pricingSection);
    // ✅ Parse faqSection — fall back to empty structure if not sent
    const faqData         = faqSection
      ? JSON.parse(faqSection)
      : { title: "Frequently Asked Questions", subtitle: "", faqs: [] };

    const uploadToCloudinary = async (file, folder) => {
      const result = await cloudinary.uploader.upload(file.path, { folder });
      return { url: result.secure_url, public_id: result.public_id };
    };

    // Hero image
    const heroFile = req.files.find(
      (f) => f.fieldname === "heroSection[image]"
    );
    if (heroFile)
      heroData.image = await uploadToCloudinary(
        heroFile,
        "services/details/hero"
      );

    // Service card icons
    for (let i = 0; i < servicesData.cards.length; i++) {
      const file = req.files.find(
        (f) => f.fieldname === `servicesSection[cards][${i}][icon]`
      );
      if (file)
        servicesData.cards[i].icon = await uploadToCloudinary(
          file,
          "services/details/cards"
        );
    }

    // Development process icons
    for (let i = 0; i < processData.cards.length; i++) {
      const file = req.files.find(
        (f) => f.fieldname === `developmentProcess[cards][${i}][icon]`
      );
      if (file)
        processData.cards[i].icon = await uploadToCloudinary(
          file,
          "services/details/process"
        );
    }

    const newDetail = await ServiceDetail.create({
      subCategory,
      heroSection:              heroData,
      titleDescriptionSections: titleDescData,
      servicesSection:          servicesData,
      whyChooseUsSection:       whyData,
      developmentProcess:       processData,
      pricingSection:           pricingData,
      faqSection:               faqData,   // ✅ NEW
    });

    res.status(201).json({ success: true, data: newDetail });
  } catch (err) {
    console.error("Create Service Detail Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateServiceDetail = async (req, res) => {
  try {
    const detail = await ServiceDetail.findById(req.params.id);
    if (!detail) return res.status(404).json({ message: "Detail not found" });

    const {
      subCategory,
      heroSection,
      titleDescriptionSections,
      servicesSection,
      whyChooseUsSection,
      developmentProcess,
      pricingSection,
      faqSection,           // ✅ NEW
    } = req.body;

    let heroData, titleDescData, servicesData, whyData, processData,
        pricingData, faqData;

    try {
      heroData      = heroSection              ? JSON.parse(heroSection)              : {};
      titleDescData = titleDescriptionSections ? JSON.parse(titleDescriptionSections) : [];
      servicesData  = servicesSection          ? JSON.parse(servicesSection)          : { title: "", cards: [] };
      whyData       = whyChooseUsSection       ? JSON.parse(whyChooseUsSection)       : { title: "", points: [] };
      processData   = developmentProcess       ? JSON.parse(developmentProcess)       : { title: "", cards: [] };
      pricingData   = pricingSection           ? JSON.parse(pricingSection)           : { title: "", plans: [] };
      // ✅ Parse faqSection — keep existing data if not sent
      faqData       = faqSection
        ? JSON.parse(faqSection)
        : detail.faqSection || { title: "Frequently Asked Questions", subtitle: "", faqs: [] };
    } catch (parseErr) {
      return res.status(400).json({
        message: "Invalid JSON format",
        error: parseErr.message,
      });
    }

    const files = req.files || [];

    // Hero image
    const heroFile = files.find((f) => f.fieldname === "heroSection[image]");
    if (heroFile) {
      if (detail.heroSection?.image?.public_id)
        await deleteCloudImage(detail.heroSection.image.public_id);
      const upload = await cloudinary.uploader.upload(heroFile.path, {
        folder: "services/details/hero",
      });
      heroData.image = { url: upload.secure_url, public_id: upload.public_id };
    } else {
      heroData.image = detail.heroSection?.image || null;
    }

    // Service card icons
    if (servicesData.cards?.length) {
      for (let i = 0; i < servicesData.cards.length; i++) {
        const file = files.find(
          (f) => f.fieldname === `servicesSection[cards][${i}][icon]`
        );
        if (file) {
          if (detail.servicesSection?.cards?.[i]?.icon?.public_id)
            await deleteCloudImage(
              detail.servicesSection.cards[i].icon.public_id
            );
          const upload = await cloudinary.uploader.upload(file.path, {
            folder: "services/details/cards",
          });
          servicesData.cards[i].icon = {
            url: upload.secure_url,
            public_id: upload.public_id,
          };
        } else {
          servicesData.cards[i].icon =
            detail.servicesSection?.cards?.[i]?.icon || null;
        }
      }
    }

    // Development process icons
    if (processData.cards?.length) {
      for (let i = 0; i < processData.cards.length; i++) {
        const file = files.find(
          (f) => f.fieldname === `developmentProcess[cards][${i}][icon]`
        );
        if (file) {
          if (detail.developmentProcess?.cards?.[i]?.icon?.public_id)
            await deleteCloudImage(
              detail.developmentProcess.cards[i].icon.public_id
            );
          const upload = await cloudinary.uploader.upload(file.path, {
            folder: "services/details/process",
          });
          processData.cards[i].icon = {
            url: upload.secure_url,
            public_id: upload.public_id,
          };
        } else {
          processData.cards[i].icon =
            detail.developmentProcess?.cards?.[i]?.icon || null;
        }
      }
    }

    // ✅ Sort FAQs by order field before saving
    if (faqData.faqs?.length) {
      faqData.faqs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    // Update all fields
    detail.subCategory            = subCategory || detail.subCategory;
    detail.heroSection            = {
      title:       heroData.title       || detail.heroSection?.title       || "",
      description: heroData.description || detail.heroSection?.description || "",
      image:       heroData.image,
    };
    detail.titleDescriptionSections = titleDescData;
    detail.servicesSection          = servicesData;
    detail.whyChooseUsSection       = whyData;
    detail.developmentProcess       = processData;
    detail.pricingSection           = pricingData;
    detail.faqSection               = faqData;   // ✅ NEW

    const validationError = detail.validateSync();
    if (validationError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.keys(validationError.errors).map((key) => ({
          field: key,
          message: validationError.errors[key].message,
        })),
      });
    }

    await detail.save();
    res.status(200).json({ success: true, data: detail });
  } catch (err) {
    console.error("❌ Update ServiceDetail Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};


export const deleteServiceDetail = async (req, res) => {
  try {
    const detail = await ServiceDetail.findById(req.params.id);
    if (!detail) return res.status(404).json({ message: "Detail not found" });

    if (detail.heroSection?.image?.public_id)
      await deleteCloudImage(detail.heroSection.image.public_id);

    for (const card of detail.servicesSection.cards || []) {
      if (card.icon?.public_id) await deleteCloudImage(card.icon.public_id);
    }
    for (const card of detail.developmentProcess.cards || []) {
      if (card.icon?.public_id) await deleteCloudImage(card.icon.public_id);
    }

    // faqSection has no images so nothing extra to clean up

    await ServiceDetail.findByIdAndDelete(req.params.id);
    res.json({ message: "Service detail deleted successfully" });
  } catch (err) {
    console.error("❌ Delete ServiceDetail Error:", err);
    res.status(500).json({ message: err.message });
  }
};


export const getAllDetails = async (req, res) => {
  try {
    const details = await ServiceDetail.find()
      .populate({ path: "subCategory", populate: { path: "category" } })
      .sort({ createdAt: -1 });
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDetailBySubCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const subCategory = await ServiceSubCategory.findOne({ slug });
    if (!subCategory)
      return res.status(404).json({ message: "SubCategory not found" });

    const detail = await ServiceDetail.findOne({
      subCategory: subCategory._id,
    }).populate({ path: "subCategory", populate: { path: "category" } });

    if (!detail) return res.status(404).json({ message: "Detail not found" });
    res.json(detail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ NEW: Get only the FAQ section for a subcategory (lightweight endpoint)
export const getFaqBySubCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const subCategory = await ServiceSubCategory.findOne({ slug });
    if (!subCategory)
      return res.status(404).json({ message: "SubCategory not found" });

    const detail = await ServiceDetail.findOne(
      { subCategory: subCategory._id },
      { faqSection: 1 }   // only return faqSection field
    );

    if (!detail) return res.status(404).json({ message: "Detail not found" });
    res.json(detail.faqSection || { title: "", subtitle: "", faqs: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- PUBLIC MENU ----------------
export const getMenuStructure = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ createdAt: 1 });

    const menu = await Promise.all(
      categories.map(async (cat) => {
        const subcategories = await ServiceSubCategory.find({
          category: cat._id,
        }).sort({ createdAt: 1 });

        return {
          _id:  cat._id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          subcategories: subcategories.map((sub) => ({
            _id:   sub._id,
            name:  sub.name,
            slug:  sub.slug,
            image: sub.image,
          })),
        };
      })
    );

    res.status(200).json(menu);
  } catch (error) {
    console.error("❌ Error fetching menu:", error);
    res.status(500).json({ message: "Failed to fetch menu", error: error.message });
  }
};