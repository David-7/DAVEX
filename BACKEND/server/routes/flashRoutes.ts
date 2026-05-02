import express from "express";
import { protect, authorize } from "../middleware/auth.ts";
import { FlashPrize } from "../models/FlashPrize.ts";

const router = express.Router();

// Admin creates a flash prize
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, code, revealAt, expirySeconds, singleWinner } = req.body;
    const userId = (req as any).user?._id;
    const prize = await FlashPrize.create({ title, code, revealAt, expirySeconds, singleWinner, createdBy: userId });
    res.status(201).json(prize);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Get active prize (students)
router.get('/active', protect, async (req, res) => {
  try {
    const now = new Date();
    const prize = await FlashPrize.findOne({ revealAt: { $lte: now }, claimedBy: null }).sort({ revealAt: -1 });
    if (!prize) return res.json({ active: false });
    const expiryTime = new Date(prize.revealAt.getTime() + prize.expirySeconds * 1000);
    if (now > expiryTime) return res.json({ active: false });
    res.json({ active: true, prize: { id: prize._id, title: prize.title } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Claim a prize (first-come wins)
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const prize = await FlashPrize.findOneAndUpdate(
      { _id: req.params.id, claimedBy: null },
      { claimedBy: (req as any).user?._id, claimedAt: new Date() },
      { new: true }
    );
    if (!prize) return res.status(410).json({ message: 'Prize already claimed or expired' });
    res.json({ message: 'Prize claimed', prizeId: prize._id });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
