import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-08-26.dahlia",
    })
  : null;

export const trialDays = 7;

export const paywallPlans = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 2900,
    description: "For early-stage stores testing urgency-driven discounts.",
    badge: "Best for new stores",
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: 7900,
    description: "For merchants scaling urgency campaigns across traffic spikes.",
    badge: "Most popular",
  },
  scale: {
    id: "scale",
    name: "Scale",
    price: 19900,
    description: "For multi-store teams running high-volume discount strategy.",
    badge: "Built for scale",
  },
} as const;
