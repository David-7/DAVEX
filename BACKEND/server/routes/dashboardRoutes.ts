import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Points } from "../models/Points.js";
import { User } from "../models/User.js";

const router = express.Router();

router.get("/overview", protect, async (req, res) => {
  // Minimal overview endpoint; expand with real stats later
  res.json({
    totalStudents: 0,
    premiumMembers: 0,
    totalMentors: 0,
  });
});

router.get('/admin/summary', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const premiumMembers = await User.countDocuments({ package: 'PREMIUM' });
    // compute active battles
    const SkillBattle = (await import('../models/SkillBattle.js')).SkillBattle;
    const now = new Date();
    const activeBattles = await SkillBattle.countDocuments({ startAt: { $lte: now }, expireAt: { $gt: now } });

    // pending payments - simple placeholder using existing transaction collection if present
    let pendingPayments: any[] = [];
    try {
      const Transaction = (await import('../models/Transaction.js')).Transaction;
      pendingPayments = await Transaction.find({ status: 'PENDING' }).limit(10).lean();
    } catch (e) {
      // ignore if Transaction model not present
      pendingPayments = [];
    }

    res.json({
      stats: [
        { label: 'Total Students', value: totalStudents, icon: 'users', trend: '—' },
        { label: 'Premium Members', value: premiumMembers, icon: 'book', trend: '—' },
        { label: 'Active Battles', value: activeBattles, icon: 'trophy', trend: '—' }
      ],
      pendingPayments
    });
  } catch (err: any) {
    console.error('Admin summary error', err);
    res.status(500).json({ message: 'Failed to compute admin summary' });
  }
});

router.get('/student/summary', protect, async (req: any, res) => {
  const user = req.user;
  try {
    // Sum all points for this user (lifetime)
    const totalAgg = await Points.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: '$user', total: { $sum: '$points' } } }
    ]);
    const totalPoints = totalAgg?.[0]?.total || 0;
    // Sum last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekAgg = await Points.aggregate([
      { $match: { user: user._id, createdAt: { $gte: weekAgo } } },
      { $group: { _id: '$user', total: { $sum: '$points' } } }
    ]);
    const weeklyPoints = weekAgg?.[0]?.total || 0;

    // compute course progress from LessonUnits and user's completedLessons
    const LessonUnit = (await import('../models/LessonUnit.js')).LessonUnit;
    const totalLessons = await LessonUnit.countDocuments();
    const completed = (user.completedLessons || []).length;
    const progress = totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);

    res.json({
      profile: { name: user.name, studentId: user.admissionNumber || 'N/A', package: user.package || 'BASIC', points: totalPoints, weeklyPoints },
      course: { enrolled: user.courseEnrolled || 'Not enrolled', instructor: user.instructorName || 'TBD', progress }
    });
  } catch (err: any) {
    console.error('Student summary error', err);
    res.status(500).json({ message: 'Failed to compute summary' });
  }
});

// Add points for a user (protected)
router.post('/points/add', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    if (!userId || typeof points !== 'number') return res.status(400).json({ message: 'userId and points (number) required' });
    const p = await Points.create({ user: userId, points, reason: reason || '' });
    // update cached total on user (best-effort)
    await User.findByIdAndUpdate(userId, { $inc: { points: points } });
    res.status(201).json(p);
  } catch (err: any) { console.error('Add points error', err); res.status(500).json({ message: err.message }); }
});

// Weekly leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const agg = await Points.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: '$user', points: { $sum: '$points' } } },
      { $sort: { points: -1 } },
      { $limit: 100 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { userId: '$_id', name: '$user.name', email: '$user.email', points: 1 } }
    ]);
    const ranked = agg.map((row: any, idx: number) => ({ rank: idx + 1, userId: row.userId, name: row.name, email: row.email, points: row.points }));
    res.json(ranked);
  } catch (err: any) { console.error('Leaderboard error', err); res.status(500).json({ message: err.message }); }
});

router.get('/sessions', protect, async (req, res) => {
  res.json([
    { date: '2026-05-10', time: '10:00', venue: 'Block A', mentor: 'Mentor X', topic: 'Linux Lab' },
  ]);
});

router.get("/admin", protect, authorize("ADMIN"), (req, res) => {
  res.json({ message: "Welcome to admin dashboard" });
});

export default router;
