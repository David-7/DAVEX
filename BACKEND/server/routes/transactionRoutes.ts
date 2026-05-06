import express from 'express';
import crypto from 'crypto';
import { protect, authorize } from '../middleware/auth.ts';
import { Transaction } from '../models/Transaction.ts';
import { User } from '../models/User.ts';
import fetch from 'node-fetch';

const router = express.Router();

async function generateRedeemCode() {
  for (let i = 0; i < 5; i += 1) {
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();
    const exists = await Transaction.findOne({ code }).select('_id');
    if (!exists) return code;
  }
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

// Admin: create manual transaction (pending)
router.post('/manual/create/:userId', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const userId = req.params.userId;
    const tx = await Transaction.create({ user: userId, amount, currency: currency || 'KES', provider: 'MANUAL', status: 'PENDING' });
    res.status(201).json(tx);
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

// Admin: create manual transaction by user's email
router.post('/manual/create-by-email', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { amount, currency, email } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const tx = await Transaction.create({ user: user._id, amount, currency: currency || 'KES', provider: 'MANUAL', status: 'PENDING' });
    res.status(201).json(tx);
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

// Admin: mark manual transaction as PAID and generate redeem code
router.post('/manual/mark-paid/:txId', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.txId);
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    if (tx.status === 'PAID') return res.status(409).json({ message: 'Already paid' });
    const code = await generateRedeemCode();
    tx.status = 'PAID';
    tx.code = code;
    await tx.save();
    res.json({ message: 'Marked as paid', code });
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

// Admin: list pending manual transactions
router.get('/manual/pending', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const items = await Transaction.find({ provider: 'MANUAL', status: 'PENDING' }).populate('user', 'name email admissionNumber');
    res.json(items);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// Get transactions for a user (owner or admin)
router.get('/user/:userId', protect, async (req: any, res) => {
  try {
    const userId = req.params.userId;
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });
    const items = await Transaction.find({ user: userId });
    res.json(items);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// Admin: delete a transaction
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndDelete(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Not found' });
    res.json({ deleted: true });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// Student: redeem a manual code
router.post('/redeem-code', protect, async (req: any, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Code required' });
    const tx = await Transaction.findOne({ code, status: 'PAID', provider: 'MANUAL' });
    if (!tx) return res.status(404).json({ message: 'Invalid or already redeemed code' });
    if (!tx.user) return res.status(400).json({ message: 'Code not assigned to a user' });
    if (String(tx.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Code not assigned to this account' });
    }
    // mark user premium
    const user = await User.findById(tx.user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.package = 'PREMIUM';
    await user.save();
    tx.status = 'REDEEMED';
    await tx.save();
    res.json({ message: 'Redeemed. Premium activated.' });
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

// PayPal: verify order via PayPal API (server verifies capture)
router.post('/paypal/verify-order', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId required' });
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    if (!clientId || !secret) return res.status(500).json({ message: 'PayPal credentials not configured' });
    const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    const orderRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    const orderJson = await orderRes.json();
    // Basic check: status == COMPLETED
    if (orderJson.status === 'COMPLETED') {
      // persist transaction and grant premium if appropriate
      const tx = await Transaction.create({ user: (req as any).user._id, amount: parseFloat(orderJson.purchase_units?.[0]?.amount?.value || '0'), currency: orderJson.purchase_units?.[0]?.amount?.currency_code || 'USD', provider: 'PAYPAL', providerId: orderId, status: 'PAID', metadata: orderJson });
      // upgrade user
      const user = await User.findById((req as any).user._id);
      if (user) { user.package = 'PREMIUM'; await user.save(); }
      return res.json({ verified: true, txId: tx._id });
    }
    res.status(400).json({ verified: false, order: orderJson });
  } catch (err: any) { console.error(err); res.status(500).json({ message: err.message }); }
});

// PayPal webhook: verify signature (placeholder) and process events
router.post('/paypal/webhook', express.json(), async (req, res) => {
  // In production: verify using /v1/notifications/verify-webhook-signature
  console.log('PayPal webhook:', req.body.event_type);
  res.status(200).send('ok');
});

// M-Pesa callback: basic scaffold — log and persist
router.post('/mpesa/callback', express.json(), async (req, res) => {
  try {
    const payload = req.body;
    // TODO: Verify authenticity using MPESA credentials/signature
    // Example: create Transaction with provider MPESA
    if (payload?.Body?.stkCallback?.CallbackMetadata) {
      const amount = payload.Body.stkCallback.CallbackMetadata.Item.find((i: any)=> i.Name === 'Amount')?.Value || 0;
      const mpesaRef = payload.Body.stkCallback.MerchantRequestID || payload.Body.stkCallback.CheckoutRequestID;
      await Transaction.create({ user: null, amount, provider: 'MPESA', providerId: mpesaRef, status: 'PAID', metadata: payload });
    } else {
      await Transaction.create({ user: null, amount: 0, provider: 'MPESA', providerId: payload?.transactionId || 'unknown', status: 'PENDING', metadata: payload });
    }
    res.status(200).json({ received: true });
  } catch (err: any) { console.error(err); res.status(500).json({ received: false }); }
});

export default router;
