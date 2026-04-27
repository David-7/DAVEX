import mongoose from "mongoose";

const flashPrizeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // The reward or code
  revealTime: { type: Date, required: true },
  durationMinutes: { type: Number, default: 10 },
  isClaimed: { type: Boolean, default: false },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

export const FlashPrize = mongoose.model("FlashPrize", flashPrizeSchema);
