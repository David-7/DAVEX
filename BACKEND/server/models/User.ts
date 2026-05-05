import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "TEACHER", "STUDENT"], default: "STUDENT" },
  access: { type: Boolean, default: true },
  points: { type: Number, default: 0 },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LessonUnit' }],
  courseEnrolled: { type: String, default: '' },
  instructorName: { type: String, default: '' },
  admissionNumber: { type: String },
  package: { type: String, enum: ["BASIC", "PREMIUM"], default: "BASIC" }
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
