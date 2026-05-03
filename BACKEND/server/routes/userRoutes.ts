import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

// List users (admin only)
router.get('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await User.find().select('name email admissionNumber package role');
    res.json(users);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

export default router;
