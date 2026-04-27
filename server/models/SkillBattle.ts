import mongoose from "mongoose";

const skillBattleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  question: { type: String, required: true },
  points: { type: Number, default: 20 },
  startDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    answer: String,
    score: Number,
    status: { type: String, enum: ["PENDING", "REVIEWED"], default: "PENDING" },
    feedback: String,
    submittedAt: { type: Date, default: Date.now }
  }]
});

export const SkillBattle = mongoose.model("SkillBattle", skillBattleSchema);
