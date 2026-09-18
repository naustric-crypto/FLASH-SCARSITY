import { NextResponse } from "next/server";
import { paywallPlans, stripe, trialDays } from "@/lib/stripe";

export const runtime = "nodejs";

function getBaseUrl(request: Request) {
  const forwarded = request.headers.get("x-forwarded-host");
  const host = forwarded ?? request.headers.get("host") ?? "127.0.0.1:3000";
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { plan?: keyof typeof paywallPlans; email?: string; paymentMethod?: string };
    const planKey = body.plan && body.plan in paywallPlans ? body.plan : "growth";
    const plan = paywallPlans[planKey];
    const email = typeof body.email === "string" ? body.email.trim() : undefined;
    const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod : "card";

    const baseUrl = getBaseUrl(request);

    if (!stripe) {
      return NextResponse.json({
        ok: true,
        demo: true,
        url: `${baseUrl}/dashboard?trial=started`,
        message: "Demo checkout ready. Add STRIPE_SECRET_KEY to enable live billing.",
        trialDays,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email ?? undefined,
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.price,
            recurring: { interval: "month" },
            product_data: {
              name: `${plan.name} plan`,
              description: `${plan.description} Includes a 7-day free trial.`,
            },
          },
          quantity: 1,
        },
      ],
      payment_method_types: ["card", "paypal"],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      payment_method_collection: "if_required",
      subscription_data: {
        trial_period_days: trialDays,
        trial_settings: {
          end_behavior: { missing_payment_method: "cancel" },
        },
      },
      metadata: {
        plan: plan.id,
        trialDays: String(trialDays),
        paymentMethod,
      },
    });

    return NextResponse.json({ ok: true, url: session.url, trialDays });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to create checkout session.",
      },
      { status: 500 },
    );
  }
}
