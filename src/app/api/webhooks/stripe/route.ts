import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!stripe) {
    return Response.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return Response.json({ error: "Missing Stripe webhook configuration" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid Stripe webhook signature" },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "invoice.payment_failed":
      console.info(`[stripe-webhook] ${event.type}`);
      break;
    default:
      break;
  }

  return Response.json({ received: true });
}
