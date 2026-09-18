import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function unixToDate(timestamp: number | null | undefined): Date | null {
  return timestamp ? new Date(timestamp * 1000) : null;
}

async function saveSubscription(subscription: Stripe.Subscription, fallbackEmail?: string | null, fallbackPlan?: string | null) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const metadata = subscription.metadata ?? {};
  const email = metadata.email || fallbackEmail || null;
  const plan = metadata.plan || fallbackPlan || null;

  await prisma.billingSubscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      email,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      plan,
      status: subscription.status,
      trialEndsAt: unixToDate(subscription.trial_end),
      currentPeriodEnd: unixToDate(subscription.items.data[0]?.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      email,
      stripeCustomerId: customerId,
      plan,
      status: subscription.status,
      trialEndsAt: unixToDate(subscription.trial_end),
      currentPeriodEnd: unixToDate(subscription.items.data[0]?.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

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
    case "checkout.session.completed": {
      const session = event.data.object;
      if (typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await saveSubscription(subscription, session.customer_email, session.metadata?.plan);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await saveSubscription(event.data.object);
      break;
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const subscription = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subscription === "string" ? subscription : subscription?.id;
      if (subscriptionId) {
        await prisma.billingSubscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: "past_due" },
        });
      }
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
