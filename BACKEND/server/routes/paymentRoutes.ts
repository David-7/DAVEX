import express from "express";
import { protect } from "../middleware/auth.js";
import fetch from "node-fetch";

const router = express.Router();

// Manual verification (protected) for order status
router.post('/paypal/verify', protect, async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ message: 'Missing orderId' });
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    if (!clientId || !secret) return res.status(500).json({ message: 'PayPal credentials not configured' });
    const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
    const tokenRes = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) return res.status(500).json({ message: 'Unable to retrieve PayPal access token' });

    const orderRes = await fetch(`${apiBase}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const orderJson = await orderRes.json();
    if (orderJson.status === 'COMPLETED') return res.json({ verified: true, order: orderJson });
    res.status(400).json({ verified: false, order: orderJson });
  } catch (err: any) {
    console.error('PayPal verify error', err);
    res.status(500).json({ message: 'PayPal verification failed' });
  }
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
