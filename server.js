import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import technologyRoutes from "./routes/technologyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import servicesRoutes from "./routes/servicesRoutes.js";
import hireRoutes from "./routes/hireRoutes.js";
import industryRoutes from "./routes/industryRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import hireFormRoutes from "./routes/hireFormRoutes.js";
import serviceFormRoutes from "./routes/serviceFormRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import { publicGalleryRouter, adminGalleryRouter } from "./routes/galleryRoutes.js";
import { publicPitchRouter, adminPitchRouter } from "./routes/startupPitchRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

import path from "path";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

app.get("/", (req, res) => {
  res.send("✅ API is running successfully on Render!");
});

app.use("/api/auth", authRoutes);
app.use("/api/technologies", technologyRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/hire", hireRoutes);
app.use("/api/industry", industryRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/hireform", hireFormRoutes);
app.use("/api/serviceform", serviceFormRoutes);
app.use("/api/servicesubmission", submissionRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/gallery", publicGalleryRouter);
app.use("/api/admin/gallery", adminGalleryRouter);
app.use("/api/startup-pitch", publicPitchRouter);
app.use("/api/admin/startup-pitch", adminPitchRouter);
app.use("/api/comments", commentRoutes);

const PORT = process.env.PORT || 5001;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log("=====================================================");
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log("MongoDB connected ✅");
  console.log("Your backend is live 🎉");
  console.log("=====================================================");
});