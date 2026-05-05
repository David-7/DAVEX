import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { SkillBattle } from "../models/SkillBattle.js";
import { Submission } from "../models/Submission.js";
import { Points } from "../models/Points.js";
import { User } from "../models/User.js";

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
    const user = (req as any).user;
    const { answer } = req.body;
    const sub = await Submission.create({ battle: battle._id, user: user._id, answer, status: 'pending' });
    // emit realtime submission event
    try {
      const io = (req as any).app.get('io');
      if (io) io.emit('battle:submission', { submissionId: sub._id, battle: battle._id, user: { _id: user._id, name: user.name } });
    } catch (e) { }
    res.status(201).json({ message: 'Submission received. Await mentor evaluation.', submissionId: sub._id });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: list submissions for a battle
router.get('/:id/submissions', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const subs = await Submission.find({ battle: req.params.id }).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(subs);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// Admin: list recent submissions across all battles
router.get('/submissions', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const subs = await Submission.find().populate('user', 'name email').populate('battle', 'title').sort({ createdAt: -1 }).limit(100);
    res.json(subs);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// Student: list my submissions
router.get('/my-submissions', protect, async (req, res) => {
  try {
    const user = (req as any).user;
    const subs = await Submission.find({ user: user._id }).populate('battle', 'title startAt expireAt points').sort({ createdAt: -1 });
    res.json(subs);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// Admin: evaluate a submission (accept/reject). If accepted, award points.
router.post('/:id/submissions/:sid/evaluate', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const sub = await Submission.findById(req.params.sid);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    if (sub.status !== 'pending') return res.status(400).json({ message: 'Submission already evaluated' });
    if (action === 'accept') {
      sub.status = 'accepted';
      sub.evaluatedBy = (req as any).user._id;
      sub.evaluatedAt = new Date();
      await sub.save();

      const battle = await SkillBattle.findById(req.params.id);
      const award = (battle && battle.points && battle.points > 0) ? battle.points : 5;
      await Points.create({ user: sub.user, points: award, reason: 'skill-battle-win' });
      await User.findByIdAndUpdate(sub.user, { $inc: { points: award } });
      // emit realtime accepted event
      try {
        const io = (req as any).app.get('io');
        if (io) io.emit('battle:accepted', { submissionId: sub._id, battle: req.params.id, user: sub.user, points: award });
      } catch (e) { }

      return res.json({ message: 'Submission accepted and points awarded', points: award });
    } else {
      sub.status = 'rejected';
      sub.evaluatedBy = (req as any).user._id;
      sub.evaluatedAt = new Date();
      await sub.save();
      return res.json({ message: 'Submission rejected' });
    }
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

export default router;
