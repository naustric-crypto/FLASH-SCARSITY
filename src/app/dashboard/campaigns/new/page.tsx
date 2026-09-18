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
      <main className="min-h-screen bg-[#0a0d12] px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-white/10 bg-[#11161f] p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#aab4c4]">Workspace locked</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Start your 7-day free trial.</h1>
          <p className="mt-5 text-lg leading-8 text-[#aab4c4]">Campaign creation is available after your trial is activated.</p>
          <Link href="/checkout" className="mt-8 inline-flex min-h-11 items-center rounded-xl bg-[#d7ff5f] px-5 text-sm font-bold text-[#10140b]">Start free trial</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0d12] px-5 py-8 text-[#f4f6f8] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm font-semibold text-[#8d98a8] transition hover:text-white">← Back to dashboard</Link>

        <div className="mt-10 rounded-[28px] border border-white/[0.08] bg-[#11161f] p-6 shadow-2xl sm:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d7ff5f]">New campaign</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Make it count.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#8d98a8]">Set the offer, connect the store, and launch an urgency campaign your shoppers can act on now.</p>

          <form onSubmit={createCampaign} className="mt-9 space-y-6">
            <label className="block text-sm font-semibold text-[#e4e8ee]">
              Campaign name
              <input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Weekend spark" className="mt-2 block w-full rounded-xl border border-white/10 bg-[#0d1118] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-[#687487] focus:border-[#d7ff5f] focus:ring-2 focus:ring-[#d7ff5f]/10" />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#e4e8ee]">
                Discount type
                <select value={discountType} onChange={(event) => setDiscountType(event.target.value as "PERCENTAGE" | "FIXED_AMOUNT")} className="mt-2 block w-full rounded-xl border border-white/10 bg-[#0d1118] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#d7ff5f] focus:ring-2 focus:ring-[#d7ff5f]/10">
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed amount</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-[#e4e8ee]">
                {discountType === "PERCENTAGE" ? "Discount %" : "Discount amount"}
                <input required min="1" max={discountType === "PERCENTAGE" ? 100 : 10000} type="number" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="mt-2 block w-full rounded-xl border border-white/10 bg-[#0d1118] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#d7ff5f] focus:ring-2 focus:ring-[#d7ff5f]/10" />
              </label>
            </div>

            <label className="block text-sm font-semibold text-[#e4e8ee]">
              Shopify shop domain
              <input value={shopUrl} onChange={(event) => setShopUrl(event.target.value)} placeholder="your-store.myshopify.com" className="mt-2 block w-full rounded-xl border border-white/10 bg-[#0d1118] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-[#687487] focus:border-[#d7ff5f] focus:ring-2 focus:ring-[#d7ff5f]/10" />
            </label>

            <label className="block text-sm font-semibold text-[#e4e8ee]">
              Access token
              <input type="password" value={accessToken} onChange={(event) => setAccessToken(event.target.value)} placeholder="Optional for demo mode" className="mt-2 block w-full rounded-xl border border-white/10 bg-[#0d1118] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-[#687487] focus:border-[#d7ff5f] focus:ring-2 focus:ring-[#d7ff5f]/10" />
            </label>

            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:justify-end">
              <Link href="/dashboard" className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-[#8d98a8] transition hover:bg-white/[0.06] hover:text-white">Cancel</Link>
              <button type="submit" disabled={isSubmitting} className="min-h-11 rounded-xl bg-[#d7ff5f] px-5 text-sm font-bold text-[#10140b] transition hover:bg-[#e4ff91] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Creating campaign..." : "Create campaign"}</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
