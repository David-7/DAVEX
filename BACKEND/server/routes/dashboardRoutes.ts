import express from "express";
import { protect, authorize } from "../middleware/auth.ts";

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
  // Return mock stats; replace with real aggregation queries later
  res.json({
    stats: [
      { label: 'Total Students', value: 120, icon: 'users', trend: '▲ 4%' },
      { label: 'Premium Members', value: 24, icon: 'book', trend: '▲ 1%' },
      { label: 'Active Battles', value: 3, icon: 'trophy', trend: '—' }
    ],
    pendingPayments: [
      { name: 'Manual Cash - John Doe', type: 'MANUAL', amount: 250 },
    ]
  });
});

router.get('/student/summary', protect, async (req: any, res) => {
  const user = req.user;
  res.json({
    profile: { name: user.name, studentId: user.admissionNumber || 'N/A', package: user.package || 'BASIC', points: user.points || 0 },
    course: { enrolled: 'Web Dev 101', instructor: 'Mentor X', progress: 42 }
  });
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
