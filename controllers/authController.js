import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ---------------- Register ----------------
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password, role, category } = req.body;

    if (!firstName || !email || !mobile || !password || !category) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or Mobile already exists" });
    }

    const user = await User.create({
      firstName,
      lastName: lastName || "",
      email: email.toLowerCase(),
      mobile,
      password,
      role: role || "user",
      category,        // ← save category
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created",
      token,
      user: {
        id: user._id,
        name: user.firstName,
        email: user.email,
        mobile: user.mobile,
        category: user.category, // you can include category if needed
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- Login ----------------
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      isAdmin: user.role === "admin",
      user: {
        id: user._id,
        name: user.firstName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        category: user.category, // include category
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login", error: err.message });
  }
};

// ---------------- AllUsers ----------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// ---------------- Forgot Password OTP ----------------
export const forgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP",
      message: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Verify OTP ----------------
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  const user = await User.findOne({
    email,
    resetOTP: otp,
    resetOTPExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

  user.resetOTP = undefined;
  user.resetOTPExpires = undefined;
  await user.save();

  res.json({ message: "OTP verified successfully" });
};

// ---------------- Reset Password with OTP ----------------
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // ❌ Basic validations
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 🔥 Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Set new password (pre('save') hook will hash it automatically)
    user.password = password;

    // ❌ Clear OTP fields
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;

    await user.save(); // ✅ password gets hashed here

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// --------- Admin: Delete user ----------
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------- User: Get own profile ----------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// ---------------- User: Update profile with Cloudinary ----------------
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, mobile, category } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (mobile) user.mobile = mobile;
     if (category)  user.category  = category;

    // Update profile image (multer-storage-cloudinary already uploaded)
    if (req.file && req.file.path) {
      user.profileImage = req.file.path; // this is Cloudinary URL
    }

    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      message: "Server error during profile update",
      error: error.message,
    });
  }
};
