import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  battle: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillBattle', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answer: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  evaluatedAt: { type: Date }
}, { timestamps: true });

export const Submission = mongoose.model('Submission', submissionSchema);
