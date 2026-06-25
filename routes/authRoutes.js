import express from "express";
import {
  registerUser,
  loginUser,
  forgotPasswordOTP,
  verifyOTP,
  resetPasswordWithOTP,
  getAllUsers,
  deleteUser
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password-otp", forgotPasswordOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password-otp", resetPasswordWithOTP);

// ⭐ Get all registered users
router.get("/users", getAllUsers);
router.delete("/delete-user/:id", deleteUser);

export default router;
