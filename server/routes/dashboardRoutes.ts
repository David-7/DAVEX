import express from "express";
import { protect, authorize } from "../middleware/auth.ts";
import { User } from "../models/User.ts";
import { SkillBattle } from "../models/SkillBattle.ts";
import { Course } from "../models/Course.ts";

const router = express.Router();

// Get Student Dashboard Summary
router.get("/student/summary", protect, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("instructor", "name")
      .populate("enrolledCourses");
    
    // In a real app, these would come from actual collections
    // For now, returning seeded/populated data or defaults
    const battlePoints = user?.totalPoints || 0;
    
    // Type casting for populated fields
    const enrolledCourse: any = user?.enrolledCourses?.[0];
    const instructor: any = user?.instructor;

    const activeBattle = await SkillBattle.findOne({
      expiryDate: { $gt: new Date() }
    }).sort({ startDate: -1 });

    res.json({
      profile: {
        name: user?.name,
        email: user?.email,
        admissionNumber: user?.admissionNumber,
        role: user?.role,
        package: user?.package,
        points: battlePoints,
        studentId: user?.studentId || `DVX-${Math.floor(Math.random() * 1000)}-ALPHA`
      },
      course: {
        enrolled: enrolledCourse?.title || "IT Support Foundations",
        instructor: instructor?.name || "Prof. K. Armani",
        progress: 84 // Mocking progress for now as we don't have a full tracking system yet
      },
      activeBattle
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get Sessions
router.get("/sessions", protect, async (req, res) => {
  // In a real app, this would be a Session model
  // For now, returning mock data that lives on the server
  const sessions = [
    { date: "2024-05-01", time: "10:00 AM", venue: "Lab 402", mentor: "Prof. Dave", topic: "Networking Basics" },
    { date: "2024-05-03", time: "02:00 PM", venue: "Zoom", mentor: "Dr. Mark", topic: "Linux CLI Mastery" },
    { date: "2024-05-10", time: "09:00 AM", venue: "Physical Lab 04", mentor: "Eng. Sarah", topic: "Cybersecurity Basics" },
  ];
  res.json(sessions);
});

// Get Admin Summary
router.get("/admin/summary", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "STUDENT" });
    const totalPaths = await Course.countDocuments();
    
    // Mocking some stats that would normally be aggregated
    res.json({
      stats: [
        { label: "Active Talent", value: totalStudents.toString(), icon: "users", trend: "+12%" },
        { label: "Learning Paths", value: totalPaths.toString(), icon: "book", trend: "+2" },
        { label: "Battle Revenue", value: "$12.4K", icon: "dollar", trend: "+18%" },
        { label: "Avg Progress", value: "68%", icon: "trending", trend: "+5%" },
      ],
      pendingPayments: [
        { name: "Alex Johnson", type: "M-Pesa", amount: "5,000" },
        { name: "Sarah Lee", type: "PayPal", amount: "50" },
        { name: "Michael Chen", type: "Bank", amount: "12,000" },
      ]
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
