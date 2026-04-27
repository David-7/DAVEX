import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["STUDENT", "MENTOR", "ADMIN"], 
    default: "STUDENT" 
  },
  studentId: { type: String, unique: true, sparse: true },
  admissionNumber: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\d{3}[A-Z]\/\d{4}$/, "Please use format like 025J/1600"]
  },
  profilePhoto: { type: String, default: "" },
  package: { 
    type: String, 
    enum: ["BASIC", "PREMIUM"], 
    default: "BASIC" 
  },
  paymentStatus: { 
    type: String, 
    enum: ["PENDING", "COMPLETED", "NONE"], 
    default: "NONE" 
  },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  totalPoints: { type: Number, default: 0 },
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  isSuspended: { type: Boolean, default: false }
});

// Hash password before saving
userSchema.pre("save", async function(next: any) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
