import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { ChatMessage } from '../models/ChatMessage.js';

const router = express.Router();

// Get recent chat messages (authenticated)
router.get('/recent', protect, async (req, res) => {
  try {
    const items = await ChatMessage.find({ deleted: { $ne: true } }).sort({ createdAt: -1 }).limit(100);
    res.json(items.reverse());
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get flagged messages
router.get('/flagged', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const items = await ChatMessage.find({ flagged: true }).sort({ createdAt: -1 }).limit(500);
    res.json(items);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// Admin: flag a message
router.patch('/:id/flag', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { reason } = req.body;
    const m = await ChatMessage.findByIdAndUpdate(req.params.id, { flagged: true, flaggedReason: reason }, { new: true });
    if (!m) return res.status(404).json({ message: 'Message not found' });
    res.json(m);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// Admin: delete (soft-delete) message
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const m = await ChatMessage.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
    if (!m) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Deleted', id: m._id });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

export default router;
