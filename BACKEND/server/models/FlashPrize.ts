import mongoose from "mongoose";

const flashPrizeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String },
  revealAt: { type: Date, required: true },
  expirySeconds: { type: Number, required: true },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  claimedAt: { type: Date, default: null },
  singleWinner: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const FlashPrize = mongoose.model('FlashPrize', flashPrizeSchema);
