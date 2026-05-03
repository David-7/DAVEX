import mongoose from 'mongoose';

const pointsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true },
  reason: { type: String, default: '' },
}, { timestamps: true });

export const Points = mongoose.model('Points', pointsSchema);
