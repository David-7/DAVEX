import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { SkillBattle } from "../models/SkillBattle.js";

const router = express.Router();

// Create a skill battle (Admin)
router.post("/", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const { title, question, startAt, expireAt, points } = req.body;
    const user = (req as any).user;
    const sb = await SkillBattle.create({ title, question, startAt, expireAt, points, createdBy: user ? user._id : null });
    res.status(201).json(sb);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// List active battles
router.get("/active", protect, async (req, res) => {
  try {
    const now = new Date();
    const items = await SkillBattle.find({ startAt: { $lte: now }, expireAt: { $gt: now } }).sort({ startAt: -1 });
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Submit answer (students)
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const battle = await SkillBattle.findById(req.params.id);
    if (!battle) return res.status(404).json({ message: 'Battle not found' });
    const now = new Date();
    if (now < battle.startAt || now >= battle.expireAt) {
      return res.status(403).json({ message: 'This skill battle is not open for submissions' });
    }
    // Store submissions in a proper collection (omitted here) and notify admin for manual evaluation
    res.json({ message: 'Submission received. Await mentor evaluation.' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
