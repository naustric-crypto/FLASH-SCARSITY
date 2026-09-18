# Flash-Scarcity

Flash-Scarcity is a Shopify-focused urgency SaaS that creates single-use countdown discount codes designed to increase conversion by creating urgency.

## What it does

- creates time-boxed merchant campaigns
- triggers fresh discount codes on demand
- creates Shopify price rules and discount codes automatically
- expires and cleans up codes after their TTL
- powers a merchant dashboard with campaign health and summary metrics

## Local setup

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env` and set your real values.
3. Run `npm install`.
4. Run `npm run db:generate` and `npm run db:push`.
5. Start the app with `npm run dev`.

### Stripe billing

Add the Stripe values from **Stripe Dashboard > Developers > API keys** to `.env`:

```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

The checkout creates a Stripe subscription with a 7-day trial and does not require payment details at signup. Enable PayPal, Link, and wallet methods in **Stripe Dashboard > Settings > Payment methods**. If no payment method is added before the trial ends, Stripe cancels the subscription rather than charging the customer.

## Launch checklist

- configure Shopify app credentials
- add a valid store domain and access token
- verify the trigger endpoint creates a real discount code
- set up the uninstall webhook URL on your store
- run a production-ready deployment and monitoring layer

## Important routes

- `GET /api/health` returns the app health status
- `POST /api/campaigns` creates a campaign and merchant record
- `POST /api/trigger-countdown` generates a fresh countdown code and returns expiry
- `POST /api/webhooks/app-uninstalled` removes merchant data when the app is uninstalled

## Production note

The timer in the app is a best-effort local mechanism. For resilient production workloads, move expiry cleanup to a durable queue or scheduled worker that survives server restarts.
