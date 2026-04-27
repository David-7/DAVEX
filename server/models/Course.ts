import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  modules: [{
    title: String,
    content: String, // Simplified content or link
    order: Number
  }],
  materials: [{
    title: String,
    url: String,
    type: { type: String, enum: ["PDF", "LINK", "NOTE"] },
    isPremium: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const Course = mongoose.model("Course", courseSchema);
