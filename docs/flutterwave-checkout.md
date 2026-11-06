# McCollins Group — Flutterwave payments

The new /checkout flow uses Flutterwave Standard hosted checkout for TZS. The site does not capture card details or mobile-money PINs.

## Enable payments

1. Create and verify a business merchant account at https://flutterwave.com/tz and enable Tanzania card/mobile money payment methods.
2. In the Flutterwave dashboard, obtain a **test** secret API key. In Vercel Project Settings → Environment Variables, set:
   - FLW_SECRET_KEY = your Flutterwave test secret key (server-only)
   - FLW_SECRET_HASH = a strong random secret that is also configured on the Flutterwave webhook settings
   - PAYMENT_PUBLIC_ORIGIN = https://mccollins-group.vercel.app (or the HTTPS preview domain being tested)
3. Register the Flutterwave webhook URL https://mccollins-group.vercel.app/api/payments/flutterwave/webhook in the Flutterwave dashboard for the deployed environment. It must be publicly reachable.
4. Test a valid checkout, an invalid checkout, a cancellation, the callback route and a signed webhook. Confirm that inventory and order status remain consistent.
5. Only after successful tests, configure **live** credentials for Vercel Production; confirm merchant verification and payouts in Flutterwave first.

Never put API keys in NEXT_PUBLIC variables, in the repository, or in a chat message.

## Behavior

- The website keeps the existing WhatsApp checkout.
- The /checkout form is available, but its Pay button remains disabled until FLW_SECRET_KEY and FLW_SECRET_HASH are configured.
- The server re-reads product prices, sizes, and stock from the database and reserves inventory when initiating payment.
- The payment provider returns a secure hosted checkout URL (cards/mobilemoneytanzania).
- Webhook: POST /api/payments/flutterwave/webhook. Authenticates with the v3 verif-hash or HMAC-signed flutterwave-signature, verifies the transaction directly with Flutterwave, and marks the order PAID only when tx_ref, TZS, amount and status pass verification. Duplicate webhooks are idempotent.
- Flutterwave return URL: GET /api/payments/flutterwave/return. The server verifies the transaction with Flutterwave before displaying a result.
- On failed checkout session creation or a provider-confirmed failed/cancelled payment, inventory is restored.
- Abandoned reservations must be monitored and reconciled manually with the Flutterwave dashboard before freeing stock. Do not auto-cancel an order whose payment status is uncertain.

## Before going live

- Confirm original 100+ clothing product catalog has been properly recovered; currently some restored items have zero available stock.
- Confirm that your business supports payments through Flutterwave Tanzania, including applicable KYC and mobile money network options.
- Add an admin dashboard distinction between PAID, AWAITING_PAYMENT and existing WhatsApp statuses, and ensure fulfilment is only from verified PAID orders.
- Configure alerting and a scheduled reconciliation process for abandoned AWAITING_PAYMENT orders and failed webhooks; handle chargebacks/refunds using the merchant dashboard.

Official references:
- https://developer.flutterwave.com/docs/flutterwave-standard-1
- https://developer.flutterwave.com/docs/webhooks
- https://developer.flutterwave.com/docs/transaction-verification
