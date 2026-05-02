PAYMENTS Integration Guide

Required environment variables (set in .env or Render secrets):
- PAYPAL_CLIENT_ID — PayPal REST app client id
- PAYPAL_SECRET — PayPal REST app secret
- PAYPAL_MODE — 'sandbox' or 'live'
- MPESA_CONSUMER_KEY — M-Pesa consumer key (if used)
- MPESA_CONSUMER_SECRET — M-Pesa consumer secret

Endpoints implemented (BACKEND)
- POST /api/transactions/paypal/verify-order  — protected endpoint to verify PayPal orderId and mark transaction paid (requires PAYPAL credentials)
- POST /api/transactions/paypal/webhook     — PayPal webhook handler (placeholder). In production verify signatures.
- POST /api/transactions/mpesa/callback     — M-Pesa callback scaffold — logs and persists transaction (verify in production)
- POST /api/transactions/manual/create/:userId — Admin creates manual pending transaction
- POST /api/transactions/manual/mark-paid/:txId  — Admin marks manual tx as PAID and generates redeem code
- POST /api/transactions/redeem-code       — Student redeems a manual code to activate premium

Notes
- Webhook endpoints are scaffolds. For production you must verify webhook signatures using PayPal's verify-webhook-signature API and M-Pesa's callback verification mechanism.
- After successful verified payment, backend creates a `Transaction` and upgrades `User.package` to `PREMIUM`.
