import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    category: { type: String, enum: ["Business", "Startup", "Individual"] },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profileImage: { type: String, default: "" },
    // OTP fields
    resetOTP: { type: String },
    resetOTPExpires: { type: Date },
  },
  { timestamps: true }
);

// password hash
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


const User = mongoose.model("User", UserSchema);
export default User;
