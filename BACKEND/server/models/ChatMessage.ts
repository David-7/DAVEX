import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: { type: String },
  channel: { type: String, default: 'general' },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
  flagged: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  flaggedReason: { type: String }
}, { timestamps: true });

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
