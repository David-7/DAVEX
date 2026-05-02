import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'KES' },
  provider: { type: String, enum: ['PAYPAL','MPESA','MANUAL'], required: true },
  providerId: { type: String },
  status: { type: String, enum: ['PENDING','PAID','FAILED','REDEEMED'], default: 'PENDING' },
  code: { type: String },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);
