import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { FlashPrize } from "../models/FlashPrize.js";

const router = express.Router();

function isExpired(prize: any, now: Date) {
  const expiryTime = new Date(prize.revealAt.getTime() + prize.expirySeconds * 1000);
  return now > expiryTime;
}

// Admin creates a flash prize
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, code, revealAt, expirySeconds, singleWinner } = req.body;
    const userId = (req as any).user?._id;

    // Basic validation
    const errors: string[] = [];
    if (!title || typeof title !== 'string' || title.trim().length < 3) errors.push('title (min 3 chars)');
    let revealDate: Date | null = null;
    if (revealAt) {
      revealDate = new Date(revealAt);
      if (isNaN(revealDate.getTime())) errors.push('revealAt (invalid date)');
    } else {
      revealDate = new Date();
    }
    const expiryNum = Number(expirySeconds ?? 0);
    if (!Number.isInteger(expiryNum) || expiryNum <= 0) errors.push('expirySeconds (positive integer)');
    const singleWinnerFlag = Boolean(singleWinner);

    if (errors.length) {
      console.warn('Flash prize validation failed:', errors.join(', '));
      return res.status(400).json({ message: 'Invalid input', errors });
    }

    const prize = await FlashPrize.create({ title: title.trim(), code: code || undefined, revealAt: revealDate, expirySeconds: expiryNum, singleWinner: singleWinnerFlag, createdBy: userId });
    res.status(201).json(prize);
  } catch (err: any) {
    console.error('Create flash prize error', err);
    res.status(400).json({ message: err.message });
  }
});

// Get active prize (students)
router.get('/active', protect, async (req, res) => {
  try {
    const now = new Date();
    const prize = await FlashPrize.findOne({
      revealAt: { $lte: now },
      $or: [{ singleWinner: true, claimedBy: null }, { singleWinner: false }]
    }).sort({ revealAt: -1 });
    if (!prize) return res.json({ active: false });
    if (isExpired(prize, now)) return res.json({ active: false });
    res.json({ active: true, prize: { id: prize._id, title: prize.title, singleWinner: prize.singleWinner } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: list recent flash prizes (active + queued)
router.get('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const items = await FlashPrize.find().sort({ revealAt: -1 }).limit(50);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Claim a prize (first-come wins)
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const now = new Date();
    const userId = (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });
    const existingPrize = await FlashPrize.findById(req.params.id).select('_id revealAt expirySeconds singleWinner claimedBy claimedAt claimedByList');
    if (!existingPrize) return res.status(404).json({ message: 'Prize not found' });
    if (now < existingPrize.revealAt) return res.status(403).json({ message: 'Prize not active yet' });
    if (isExpired(existingPrize, now)) return res.status(410).json({ message: 'Prize expired' });
    let prize: any | null = null;
    if (existingPrize.singleWinner) {
      prize = await FlashPrize.findOneAndUpdate(
        { _id: req.params.id, claimedBy: null },
        { claimedBy: userId, claimedAt: new Date() },
        { new: true }
      );
    } else {
      const alreadyClaimed = (existingPrize.claimedByList || []).some((id: any) => String(id) === String(userId));
      if (alreadyClaimed) return res.status(409).json({ message: 'Already claimed' });
      prize = await FlashPrize.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { claimedByList: userId }, $set: { claimedAt: new Date() } },
        { new: true }
      );
    }
    if (!prize) return res.status(410).json({ message: 'Prize already claimed or expired' });
    res.json({ message: 'Prize claimed', prizeId: prize._id });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
