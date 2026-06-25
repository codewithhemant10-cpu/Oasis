import mongoose from "mongoose";
import IndustryCategory from "../models/IndustryCategory.js";
import IndustryDetail from "../models/IndustryDetail.js";
import slugify from "slugify";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Delete image from Cloudinary
const deleteCloudImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("🗑️ Image deleted from Cloudinary:", publicId);
  } catch (err) {
    console.error("❌ Cloudinary delete error:", err);
  }
};

// Helper: Safe JSON parse with validation
const safeParse = (data) => {
  try {
    if (!data || data === "" || data === "undefined" || data === "null") {
      return null;
    }
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    // Return null if empty object
    return parsed && Object.keys(parsed).length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

// ---------------- CATEGORY CRUD ----------------

// Create Category
export const createIndustryCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    // Trim name and generate slug
    const trimmedName = name.trim();
    const slug = slugify(trimmedName, { lower: true, strict: true });

    // Upload image to Cloudinary
    let imageData = {};
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "industry/categories",
      });
      imageData = { url: upload.secure_url, public_id: upload.public_id };
      console.log("✅ Category image uploaded:", upload.secure_url);
    } else {
      return res.status(400).json({ message: "Image is required" });
    }

    const category = new IndustryCategory({ 
      name: trimmedName, 
      image: imageData, 
      slug 
    });
    await category.save();

    console.log("✅ Category created with slug:", slug);
    res.status(201).json(category);
  } catch (err) {
    console.error("❌ Error creating category:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get All Categories
export const getIndustryCategories = async (req, res) => {
  try {
    const categories = await IndustryCategory.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Category
export const updateIndustryCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await IndustryCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const updateData = {};
    
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary
      if (category.image?.public_id) {
        await deleteCloudImage(category.image.public_id);
      }
      // Upload new image
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "industry/categories",
      });
      updateData.image = { url: upload.secure_url, public_id: upload.public_id };
      console.log("✅ Category image updated:", upload.secure_url);
    }

    const updatedCategory = await IndustryCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedCategory);
  } catch (err) {
    console.error("❌ Update category error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete Category
export const deleteIndustryCategory = async (req, res) => {
  try {
    const category = await IndustryCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Delete image from Cloudinary
    if (category.image?.public_id) {
      await deleteCloudImage(category.image.public_id);
    }

    await IndustryCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("❌ Delete category error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ---------------- DETAIL CRUD ----------------

// Create Detail
export const createIndustryDetail = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Valid Category is required" });
    }

    const existingCategory = await IndustryCategory.findById(category);
    if (!existingCategory) return res.status(400).json({ message: "Category not found" });

    // Parse sections from request body
    const heroSection = safeParse(req.body.heroSection) || {};
    const TitleDescriptionSection = safeParse(req.body.TitleDescriptionSection) || {};
    const servicesSection = safeParse(req.body.servicesSection) || {};
    const whyChooseUsSection = safeParse(req.body.whyChooseUsSection) || {};
    const files = req.files || [];

    console.log("📥 Files received:", files.map(f => f.fieldname));

    // Upload Hero Icon
    const heroIconFile = files.find(f => f.fieldname === "heroIcon");
    if (heroIconFile) {
      const upload = await cloudinary.uploader.upload(heroIconFile.path, {
        folder: "industry/details/hero",
      });
      heroSection.icon = { url: upload.secure_url, public_id: upload.public_id };
      console.log("✅ Hero icon uploaded:", upload.secure_url);
    }

    // Upload Service Icons
    if (Array.isArray(servicesSection.cards)) {
      for (let i = 0; i < servicesSection.cards.length; i++) {
        const file = files.find(f => f.fieldname === `serviceIcon_${i}`);
        if (file) {
          const upload = await cloudinary.uploader.upload(file.path, {
            folder: "industry/details/services",
          });
          servicesSection.cards[i].icon = {
            url: upload.secure_url,
            public_id: upload.public_id,
          };
          console.log(`✅ Service icon ${i} uploaded:`, upload.secure_url);
        }
      }
    }

    const detail = new IndustryDetail({
      category,
      heroSection,
      TitleDescriptionSection,
      servicesSection,
      whyChooseUsSection,
    });

    await detail.save();
    console.log("✅ Industry detail created:", detail._id);
    res.status(201).json(detail);
  } catch (err) {
    console.error("❌ Error creating detail:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get All Details
export const getAllIndustryDetails = async (req, res) => {
  try {
    const details = await IndustryDetail.find().populate("category");
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Detail by Category Slug
export const getIndustryDetailBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await IndustryCategory.findOne({ slug });
    if (!category) return res.status(404).json({ message: "Category not found" });

    const detail = await IndustryDetail.findOne({ category: category._id }).populate("category");
    if (!detail) return res.status(404).json({ message: "Detail not found" });

    res.json(detail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update Detail - ULTIMATE FIX
export const updateIndustryDetail = async (req, res) => {
  try {
    const existingDetail = await IndustryDetail.findById(req.params.id);
    if (!existingDetail) return res.status(404).json({ message: "Detail not found" });

    const files = req.files || [];
    console.log("📥 Update - Files received:", files.map(f => f.fieldname));
    console.log("📥 Request body:", JSON.stringify(req.body, null, 2));

    // Parse incoming sections
    let incomingHero = safeParse(req.body.heroSection);
    let incomingTitleDesc = safeParse(req.body.TitleDescriptionSection);
    let incomingServices = safeParse(req.body.servicesSection);
    let incomingWhyChoose = safeParse(req.body.whyChooseUsSection);

    // Skip sections with only empty strings
    if (incomingHero && !incomingHero.title && !incomingHero.description && !files.find(f => f.fieldname === "heroIcon")) {
      incomingHero = null;
      console.log("⚠️ Skipping empty heroSection");
    }

    console.log("📥 Parsed hero:", incomingHero);

    // ============ HERO SECTION ============
    if (incomingHero) {
      const heroIconFile = files.find(f => f.fieldname === "heroIcon");
      
      // Start with existing hero section
      const updatedHero = { ...existingDetail.heroSection.toObject() };
      
      if (heroIconFile) {
        // Delete old and upload new
        if (existingDetail.heroSection?.icon?.public_id) {
          await deleteCloudImage(existingDetail.heroSection.icon.public_id);
        }
        const upload = await cloudinary.uploader.upload(heroIconFile.path, {
          folder: "industry/details/hero",
        });
        updatedHero.icon = { url: upload.secure_url, public_id: upload.public_id };
        console.log("✅ Hero icon updated");
      }
      // If no new icon file, keep existing icon (already in updatedHero)
      
      // Update other hero fields (but preserve icon if not being updated)
      Object.keys(incomingHero).forEach(key => {
        if (key !== 'icon' && incomingHero[key] !== undefined) {
          updatedHero[key] = incomingHero[key];
        }
      });
      
      existingDetail.heroSection = updatedHero;
      console.log("✅ Hero section updated");
    }

    // ============ TITLE DESCRIPTION SECTION ============
    if (incomingTitleDesc) {
      existingDetail.TitleDescriptionSection = {
        ...existingDetail.TitleDescriptionSection.toObject(),
        ...incomingTitleDesc,
      };
      console.log("✅ Title-Description updated");
    }

    // ============ SERVICES SECTION ============
    if (incomingServices) {
      // Start with existing services section
      const updatedServices = { ...existingDetail.servicesSection.toObject() };
      
      if (Array.isArray(incomingServices.cards)) {
        updatedServices.cards = [];
        
        for (let i = 0; i < incomingServices.cards.length; i++) {
          const file = files.find(f => f.fieldname === `serviceIcon_${i}`);
          const existingCard = existingDetail.servicesSection?.cards?.[i];
          
          // Start with incoming card data
          const updatedCard = { ...incomingServices.cards[i] };
          
          if (file) {
            // Delete old and upload new
            if (existingCard?.icon?.public_id) {
              await deleteCloudImage(existingCard.icon.public_id);
            }
            const upload = await cloudinary.uploader.upload(file.path, {
              folder: "industry/details/services",
            });
            updatedCard.icon = {
              url: upload.secure_url,
              public_id: upload.public_id,
            };
            console.log(`✅ Service icon ${i} updated`);
          } else if (existingCard?.icon) {
            // Preserve existing icon
            updatedCard.icon = existingCard.icon;
          }
          
          updatedServices.cards.push(updatedCard);
        }
      }
      
      // Merge other service properties
      Object.keys(incomingServices).forEach(key => {
        if (key !== 'cards' && incomingServices[key] !== undefined) {
          updatedServices[key] = incomingServices[key];
        }
      });
      
      existingDetail.servicesSection = updatedServices;
      console.log("✅ Services section updated");
    }

    // ============ WHY CHOOSE US SECTION ============
    if (incomingWhyChoose) {
      existingDetail.whyChooseUsSection = {
        ...existingDetail.whyChooseUsSection.toObject(),
        ...incomingWhyChoose,
      };
      console.log("✅ Why Choose Us updated");
    }

    // ============ UPDATE CATEGORY ============
    if (req.body.category && mongoose.Types.ObjectId.isValid(req.body.category)) {
      existingDetail.category = req.body.category;
    }

    // Mark modified
    existingDetail.markModified('heroSection');
    existingDetail.markModified('servicesSection');
    existingDetail.markModified('TitleDescriptionSection');
    existingDetail.markModified('whyChooseUsSection');

    await existingDetail.save();
    console.log("✅ Industry detail saved successfully");
    res.json(existingDetail);
  } catch (err) {
    console.error("❌ Update Detail Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Delete Detail
export const deleteIndustryDetail = async (req, res) => {
  try {
    const detail = await IndustryDetail.findById(req.params.id);
    if (!detail) return res.status(404).json({ message: "Detail not found" });

    // Delete hero icon
    if (detail.heroSection?.icon?.public_id) {
      await deleteCloudImage(detail.heroSection.icon.public_id);
    }

    // Delete all service icons
    for (const card of detail.servicesSection?.cards || []) {
      if (card.icon?.public_id) {
        await deleteCloudImage(card.icon.public_id);
      }
    }

    await IndustryDetail.findByIdAndDelete(req.params.id);
    console.log("✅ Industry detail deleted");
    res.json({ message: "Detail deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Detail Error:", err);
    res.status(500).json({ message: err.message });
  }
};