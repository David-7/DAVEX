import mongoose from "mongoose";

const lessonUnitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const LessonUnit = mongoose.model("LessonUnit", lessonUnitSchema);
