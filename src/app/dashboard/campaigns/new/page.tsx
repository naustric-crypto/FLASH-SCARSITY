"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function NewCampaignPage() {
  const [name, setName] = useState("");
  const [discount, setDiscount] = useState(15);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [shopUrl, setShopUrl] = useState("northstar-goods.myshopify.com");
  const [accessToken, setAccessToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTrialActive, setIsTrialActive] = useState(false);

  useEffect(() => {
    setIsTrialActive(window.localStorage.getItem("flash-scarcity-trial") === "active");
  }, []);

  async function createCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, discount, discountType, shopUrl, accessToken }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not create the campaign.");
      }

      window.location.href = "/dashboard";
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create the campaign.");
      setIsSubmitting(false);
    }
  }

  if (!isTrialActive) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,_#f4efe9_0%,_#f8faf9_100%)] px-6 py-16 text-slate-800">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">Access required</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Start your 7-day free trial.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">Campaign creation is available after your trial is activated.</p>
          <Link href="/checkout" className="mt-8 inline-flex rounded-full bg-[#006d77] px-5 py-3 text-sm font-semibold text-white">Start free trial</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(122,186,176,0.25),_transparent_30%),linear-gradient(180deg,_#f6f3ee_0%,_#f2f6f3_100%)] px-5 py-8 text-slate-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">← Back to dashboard</Link>

        <div className="mt-10 rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e76f51]">New campaign</p>
          <h1 className="mt-3 font-display text-4xl text-slate-900 sm:text-5xl">Make it count.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Set the offer, connect the store, and launch an urgency campaign your shoppers can act on now.</p>

          <form onSubmit={createCampaign} className="mt-9 space-y-6">
            <label className="block text-sm font-semibold text-slate-800">
              Campaign name
              <input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Weekend spark" className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#006d77] focus:ring-2 focus:ring-[#006d77]/10" />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-800">
                Discount type
                <select value={discountType} onChange={(event) => setDiscountType(event.target.value as "PERCENTAGE" | "FIXED_AMOUNT")} className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#006d77] focus:ring-2 focus:ring-[#006d77]/10">
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed amount</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                {discountType === "PERCENTAGE" ? "Discount %" : "Discount amount"}
                <input required min="1" max={discountType === "PERCENTAGE" ? 100 : 10000} type="number" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#006d77] focus:ring-2 focus:ring-[#006d77]/10" />
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate-800">
              Shopify shop domain
              <input value={shopUrl} onChange={(event) => setShopUrl(event.target.value)} placeholder="your-store.myshopify.com" className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#006d77] focus:ring-2 focus:ring-[#006d77]/10" />
            </label>

            <label className="block text-sm font-semibold text-slate-800">
              Access token
              <input type="password" value={accessToken} onChange={(event) => setAccessToken(event.target.value)} placeholder="Optional for demo mode" className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#006d77] focus:ring-2 focus:ring-[#006d77]/10" />
            </label>

            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">Cancel</Link>
              <button type="submit" disabled={isSubmitting} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#006d77] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Creating campaign..." : "Create campaign"}</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
