import mongoose from "mongoose";
import TechnologyCategory from "../models/TechnologyCategory.js";
import TechnologySubCategory from "../models/TechnologySubCategory.js";
import TechnologyDetail from "../models/TechnologyDetail.js";
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

// Safe JSON parse helper
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
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const slug = slugify(name, { lower: true, strict: true });
    let image = null;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "technology/categories",
      });
      image = { url: upload.secure_url, public_id: upload.public_id };
    }

    const category = new TechnologyCategory({ name, slug, image });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error("❌ Create Category Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await TechnologyCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await TechnologyCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const slug = slugify(name || category.name, { lower: true, strict: true });
    let image = category.image;

    if (req.file) {
      if (image?.public_id) await deleteCloudImage(image.public_id);
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "technology/categories",
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
    const category = await TechnologyCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    if (category.image?.public_id) await deleteCloudImage(category.image.public_id);
    await TechnologySubCategory.deleteMany({ category: category._id });
    await TechnologyDetail.deleteMany({ category: category._id });

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Category Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ---------------- SUBCATEGORY CRUD ----------------
export const createSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) return res.status(400).json({ message: "All fields required" });

    const categoryExists = await TechnologyCategory.findById(category);
    if (!categoryExists) return res.status(400).json({ message: "Category not found" });

    const slug = slugify(name, { lower: true, strict: true });

    let image = null;
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "technology/subcategories",
      });
      image = { url: upload.secure_url, public_id: upload.public_id };
    }

    const subCategory = new TechnologySubCategory({ name, category, slug, image });
    await subCategory.save();
    res.status(201).json(subCategory);
  } catch (err) {
    console.error("❌ Create SubCategory Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const subs = await TechnologySubCategory.find()
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
    const subCategory = await TechnologySubCategory.findById(req.params.id);
    if (!subCategory) return res.status(404).json({ message: "Subcategory not found" });

    const slug = slugify(name || subCategory.name, { lower: true, strict: true });
    let image = subCategory.image;

    if (req.file) {
      if (image?.public_id) await deleteCloudImage(image.public_id);
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "technology/subcategories",
      });
      image = { url: upload.secure_url, public_id: upload.public_id };
    }

    subCategory.name = name || subCategory.name;
    subCategory.category = category || subCategory.category;
    subCategory.slug = slug;
    subCategory.image = image;

    await subCategory.save();
    res.json(subCategory);
  } catch (err) {
    console.error("❌ Update SubCategory Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const sub = await TechnologySubCategory.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });

    if (sub.image?.public_id) await deleteCloudImage(sub.image.public_id);
    await TechnologyDetail.deleteMany({ subCategory: sub._id });

    res.json({ message: "Subcategory deleted successfully" });
  } catch (err) {
    console.error("❌ Delete SubCategory Error:", err);
    res.status(500).json({ message: err.message });
  }
};



// ---------------- TECHNOLOGY DETAIL CRUD ----------------


// ---------------------- CREATE DETAIL ----------------------
export const createDetail = async (req, res) => {
  try {
    const heroSection = safeParse(req.body.heroSection) || {};
    const TitleDescriptionSection = safeParse(req.body.TitleDescriptionSection) || {};
    const servicesSection = safeParse(req.body.servicesSection) || {};
    const whyChooseUsSection = safeParse(req.body.whyChooseUsSection) || {};
    const files = req.files || [];

    // ✅ HERO SECTION ICON UPLOAD
    const heroIconFile = files.find(f => f.fieldname === "heroSection[icon]");
    if (heroIconFile) {
      const upload = await cloudinary.uploader.upload(heroIconFile.path, {
        folder: "technology/details/hero",
      });
      heroSection.icon = { url: upload.secure_url, public_id: upload.public_id };
    } else {
      heroSection.icon = heroSection.icon || {};
    }

    // ✅ SERVICE SECTION ICON UPLOAD
    if (Array.isArray(servicesSection.cards)) {
      for (let i = 0; i < servicesSection.cards.length; i++) {
        const file = files.find(f => f.fieldname === `servicesSection[cards][${i}][icon]`);
        if (file) {
          const upload = await cloudinary.uploader.upload(file.path, {
            folder: "technology/details/cards",
          });
          servicesSection.cards[i].icon = { url: upload.secure_url, public_id: upload.public_id };
        } else {
          servicesSection.cards[i].icon = servicesSection.cards[i].icon || {};
        }
      }
    }

    const detail = await TechnologyDetail.create({
      subCategory: req.body.subCategory,
      heroSection,
      TitleDescriptionSection,
      servicesSection,
      whyChooseUsSection,
    });

    res.status(201).json({ success: true, data: detail });
  } catch (err) {
    console.error("❌ Create Detail Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- UPDATE DETAIL ----------------------
export const updateDetail = async (req, res) => {
  try {
    const detail = await TechnologyDetail.findById(req.params.id);
    if (!detail) return res.status(404).json({ message: "Detail not found" });

    const heroSection = safeParse(req.body.heroSection) || {};
    const TitleDescriptionSection = safeParse(req.body.TitleDescriptionSection) || {};
    const servicesSection = safeParse(req.body.servicesSection) || {};
    const whyChooseUsSection = safeParse(req.body.whyChooseUsSection) || {};
    const files = req.files || [];

    // HERO ICON
    const heroIconFile = files.find(f => f.fieldname === "heroSection[icon]");
    if (heroIconFile) {
      if (detail.heroSection?.icon?.public_id) {
        await deleteCloudImage(detail.heroSection.icon.public_id);
      }
      const upload = await cloudinary.uploader.upload(heroIconFile.path, {
        folder: "technology/details/hero",
      });
      heroSection.icon = { url: upload.secure_url, public_id: upload.public_id };
    }

    // SERVICE ICONS
    if (Array.isArray(servicesSection.cards)) {
      for (let i = 0; i < servicesSection.cards.length; i++) {
        const file = files.find(f => f.fieldname === `servicesSection[cards][${i}][icon]`);
        if (file) {
          if (detail.servicesSection?.cards?.[i]?.icon?.public_id) {
            await deleteCloudImage(detail.servicesSection.cards[i].icon.public_id);
          }
          const upload = await cloudinary.uploader.upload(file.path, {
            folder: "technology/details/cards",
          });
          servicesSection.cards[i].icon = { url: upload.secure_url, public_id: upload.public_id };
        }
      }
    }

    // 🔥 Merge data safely (don’t erase old fields)
    detail.subCategory = req.body.subCategory || detail.subCategory;
    detail.heroSection = { ...detail.heroSection, ...heroSection };
    detail.TitleDescriptionSection = { ...detail.TitleDescriptionSection, ...TitleDescriptionSection };
    detail.servicesSection = { ...detail.servicesSection, ...servicesSection };
    detail.whyChooseUsSection = { ...detail.whyChooseUsSection, ...whyChooseUsSection };

    await detail.save();
    res.status(200).json({ success: true, data: detail });
  } catch (err) {
    console.error("❌ Update Detail Error:", err);
    res.status(500).json({ message: err.message });
  }
};



// ---------------------- DELETE DETAIL (FIXED) ----------------------
export const deleteDetail = async (req, res) => {
  try {
    const detail = await TechnologyDetail.findById(req.params.id);
    if (!detail) return res.status(404).json({ message: "Detail not found" });

    // Delete hero icon from Cloudinary
    if (detail.heroSection?.icon?.public_id) {
      await deleteCloudImage(detail.heroSection.icon.public_id);
    }

    // Delete service icons from Cloudinary
    for (const card of detail.servicesSection?.cards || []) {
      if (card.icon?.public_id) {
        await deleteCloudImage(card.icon.public_id);
      }
    }

    await TechnologyDetail.findByIdAndDelete(req.params.id);
    res.json({ message: "Detail deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Detail Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all details
export const getAllDetails = async (req, res) => {
  try {
    const details = await TechnologyDetail.find()
      .populate({ path: "subCategory", populate: { path: "category" } })
      .sort({ createdAt: -1 });
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get detail by subCategory slug
export const getDetailBySubCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const subCategory = await TechnologySubCategory.findOne({ slug });
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });

    const detail = await TechnologyDetail.findOne({ subCategory: subCategory._id }).populate({
      path: "subCategory",
      populate: { path: "category" },
    });

    if (!detail) return res.status(404).json({ message: "Detail not found" });
    res.json(detail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- MENU ----------------
export const getMenuStructure = async (req, res) => {
  try {
    const categories = await TechnologyCategory.find().sort({ createdAt: 1 });

    const menu = await Promise.all(
      categories.map(async (cat) => {
        const subcategories = await TechnologySubCategory.find({ category: cat._id }).sort({
          createdAt: 1,
        });
        return {
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          subcategories: subcategories.map((sub) => ({
            _id: sub._id,
            name: sub.name,
            slug: sub.slug,
            image: sub.image,
          })),
        };
      })
    );

    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
