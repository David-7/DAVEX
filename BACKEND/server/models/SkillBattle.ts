import mongoose from "mongoose";

const skillBattleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  question: { type: String, required: true },
  startAt: { type: Date, required: true },
  expireAt: { type: Date, required: true },
  points: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

skillBattleSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export const SkillBattle = mongoose.model('SkillBattle', skillBattleSchema);
