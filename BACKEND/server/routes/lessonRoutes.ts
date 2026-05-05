import express from "express";
import { LessonUnit } from "../models/LessonUnit.js";
import { protect, authorize } from "../middleware/auth.js";

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

// Student: mark lesson completed for themselves
router.post('/:id/complete', protect, async (req: any, res) => {
  try {
    const lessonId = req.params.id;
    const user = req.user;
    if (!lessonId) return res.status(400).json({ message: 'lesson id required' });
    // ensure lesson exists
    const lesson = await LessonUnit.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    // add if not present
    const already = (user.completedLessons || []).some((id: any) => id.toString() === lessonId.toString());
    if (!already) {
      await (await import('../models/User.js')).User.findByIdAndUpdate(user._id, { $push: { completedLessons: lesson._id } });
    }
    // compute progress
    const total = await LessonUnit.countDocuments();
    const u = await (await import('../models/User.js')).User.findById(user._id).select('completedLessons');
    const progress = total === 0 ? 0 : Math.round(((u.completedLessons?.length || 0) / total) * 100);
    res.json({ message: 'Marked completed', progress });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
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
