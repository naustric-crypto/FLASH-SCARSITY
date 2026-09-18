'use client';

import Link from "next/link";
import { useMemo, useState } from "react";

const plans = [
  { id: "starter", name: "Starter", price: "$29", description: "Perfect for early ventures and lean store launches.", accent: "border-slate-200 bg-white" },
  { id: "growth", name: "Growth", price: "$79", description: "Best for scaling urgency-driven campaigns and revenue experiments.", accent: "border-[#006d77] bg-[#f3fbfa] shadow-[0_20px_40px_rgba(0,109,119,0.08)]" },
  { id: "scale", name: "Scale", price: "$199", description: "Built for multi-store teams and larger commerce operations.", accent: "border-slate-200 bg-white" },
] as const;

const paymentMethods = [
  { id: "card", label: "Card", helper: "Visa, Mastercard, Amex" },
  { id: "paypal", label: "PayPal", helper: "Wallet checkout" },
  { id: "link", label: "Link", helper: "Fast one-click fill" },
  { id: "apple_pay", label: "Apple Pay", helper: "Apple devices only" },
] as const;

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number]["id"]>("growth");
  const [selectedMethod, setSelectedMethod] = useState<(typeof paymentMethods)[number]["id"]>("card");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = useMemo(() => plans.find((item) => item.id === selectedPlan) ?? plans[1], [selectedPlan]);

  async function startTrialCheckout() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          email,
          paymentMethod: selectedMethod,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; url?: string; message?: string; demo?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Checkout could not be started.");
      }

      if (payload.demo || !payload.url) {
        document.cookie = "flash-scarcity-trial=active; path=/; max-age=604800";
        window.localStorage.setItem("flash-scarcity-trial", "active");
        window.location.href = "/billing/success";
        return;
      }

      window.location.href = payload.url;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Checkout could not be started.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(231,111,81,0.08),_transparent_20%),linear-gradient(180deg,_#f4efe9_0%,_#f8faf9_100%)] px-6 py-16 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/pricing" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            ← Back to pricing
          </Link>
          <div className="rounded-full border border-[#dff3ef] bg-[#f2fbfa] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#006d77]">
            7-day free trial • no card required
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">Choose your plan</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Start your free trial today.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              No bank details required. Your trial begins immediately and you can cancel before the 7-day period ends.
            </p>

            <div className="mt-8 grid gap-4">
              {plans.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPlan(item.id)}
                  className={`w-full rounded-3xl border p-5 text-left transition ${selectedPlan === item.id ? item.accent : "border-slate-200 bg-white/80 hover:border-slate-300"}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{item.name}</p>
                      <p className="mt-2 text-3xl font-black text-slate-900">{item.price}<span className="ml-2 text-base font-medium text-slate-500">/ month</span></p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${selectedPlan === item.id ? "bg-[#006d77] text-white" : "bg-slate-100 text-slate-600"}`}>
                      {selectedPlan === item.id ? "Selected" : "Trial"}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </button>
              ))}
            </div>
          </section>

          <aside className="rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">Payment</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-4xl font-black text-slate-900">{plan.price}</span>
              <span className="pb-1 text-sm text-slate-500">/ month after 7-day trial</span>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Work email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@yourstore.com"
                  className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#006d77]"
                />
              </label>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Choose a payment method</p>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${selectedMethod === method.id ? "border-[#006d77] bg-[#f3fbfa]" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{method.label}</p>
                        <p className="text-xs text-slate-500">{method.helper}</p>
                      </div>
                      <span className={`h-4 w-4 rounded-full border ${selectedMethod === method.id ? "border-[#006d77] bg-[#006d77]" : "border-slate-300 bg-white"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={startTrialCheckout}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#006d77] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#006d77]/15 transition hover:bg-[#00565d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Starting free trial..." : `Start 7-day free trial`}
            </button>

            <p className="mt-5 text-center text-xs leading-6 text-slate-500">
              Trial includes access to campaigns, automation, and urgency features. No bank details required to start.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
