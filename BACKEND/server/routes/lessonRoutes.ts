import express from "express";
import { LessonUnit } from "../models/LessonUnit.ts";
import { protect, authorize } from "../middleware/auth.ts";

const router = express.Router();

// Get all lessons (for students and admins)
router.get("/", protect, async (req, res) => {
  try {
    const lessons = await LessonUnit.find().sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lessons" });
  }
});

// Create a lesson (Admin only)
router.post("/", protect, authorize("ADMIN"), async (req, res) => {
  const { title, content, order } = req.body;
  try {
    const lesson = await LessonUnit.create({ title, content, order });
    res.status(201).json(lesson);
  } catch (error) {
    res.status(400).json({ message: "Error creating lesson" });
  }
});

// Mark lesson as complete (Admin only)
router.patch("/:id/complete", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const lesson = await LessonUnit.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (error) {
    res.status(400).json({ message: "Error updating lesson status" });
  }
});

// Delete lesson (Admin only)
router.delete("/:id", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const lesson = await LessonUnit.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ message: "Lesson deleted" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting lesson" });
  }
});

export default router;
