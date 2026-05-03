import express from "express";
import { protect } from "../middleware/auth.js";
import fetch from "node-fetch";

const router = express.Router();

// Manual verification (protected) for order status
router.post('/paypal/verify', protect, async (req, res) => {
  const { orderId, status } = req.body;
  if (!orderId || !status) return res.status(400).json({ message: 'Missing order data' });
  const verified = status === 'COMPLETED';
  if (verified) return res.json({ verified: true });
  res.status(400).json({ verified: false });
});

// PayPal webhook handler (unprotected) — verify via PayPal API
router.post('/paypal/webhook', express.json(), async (req, res) => {
  try {
    // In production, verify webhook using PayPal SDK / verify-webhook-signature endpoint
    // This placeholder logs and returns 200 for recognized event types
    const event = req.body;
    console.log('PayPal webhook received', event.event_type || event);
    // TODO: implement verification with PAYPAL_CLIENT_ID / PAYPAL_SECRET
    res.status(200).send('OK');
  } catch (err: any) {
    console.error('PayPal webhook error', err);
    res.status(500).send('ERROR');
  }
});

// M-Pesa callback endpoint (unprotected) — verify payload authenticity in production
router.post('/mpesa/callback', express.json(), async (req, res) => {
  try {
    const payload = req.body;
    console.log('M-Pesa callback:', payload);
    // TODO: verify using MPESA credentials (signature, businessShortCode, etc.)
    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Mpesa callback error', err);
    res.status(500).json({ received: false });
  }
});

export default router;
