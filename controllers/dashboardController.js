import Contact from "../models/Contact.js";
import User from "../models/User.js";
import ProjectModel from "../models/ProjectModel.js";
import ServiceCategory from "../models/ServiceCategory.js";
import BlogModel from "../models/BlogModel.js";
import UserSubmission from "../models/UserSubmission.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalQueries = await Contact.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProjects = await ProjectModel.countDocuments();
    const totalServices = await ServiceCategory.countDocuments();
    const totalBlogs = await BlogModel.countDocuments();
    const totalServiceForms = await UserSubmission.countDocuments();

    res.json({
      totalQueries,
      totalUsers,
      totalProjects,
      totalServices,
      totalBlogs,
      totalServiceForms,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
