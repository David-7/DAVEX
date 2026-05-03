import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

// List users (admin only)
router.get('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await User.find().select('name email admissionNumber package role access');
    res.json(users);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// Admin: update user's access (revoke / restore)
router.patch('/:id/access', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const access = typeof req.body.access === 'boolean' ? req.body.access : undefined;
    if (access === undefined) return res.status(400).json({ message: 'access (boolean) required' });
    const user = await User.findByIdAndUpdate(req.params.id, { access }, { new: true }).select('name email admissionNumber package role access');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

export default router;
