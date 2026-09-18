"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Campaign = {
  id: string;
  name: string;
  discount: string;
};

export default function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [name, setName] = useState("");
  const [discount, setDiscount] = useState(15);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCampaign() {
      try {
        const response = await fetch("/api/campaigns", { cache: "no-store" });
        const campaigns = (await response.json()) as Campaign[];
        const match = campaigns.find((item) => item.id === params.id);
        if (!match) {
          setError("Campaign could not be found.");
          return;
        }
        setCampaign(match);
        setName(match.name);
        setDiscount(Number.parseInt(match.discount.replace(/[^\d]/g, ""), 10) || 15);
        setDiscountType(match.discount.includes("$") ? "FIXED_AMOUNT" : "PERCENTAGE");
      } catch {
        setError("Campaign could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCampaign();
  }, [params.id]);

  async function updateCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, discount, discountType }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Campaign could not be updated.");
      router.push("/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Campaign could not be updated.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0d12] px-5 py-8 text-[#f4f6f8] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm font-semibold text-[#8d98a8] transition hover:text-white">← Back to dashboard</Link>
        <div className="mt-10 rounded-[28px] border border-white/[0.08] bg-[#11161f] p-6 shadow-2xl sm:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d7ff5f]">Edit campaign</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Refine the pulse.</h1>
          <p className="mt-4 text-base leading-7 text-[#8d98a8]">Adjust the offer without losing the campaign destination or its performance history.</p>

          {isLoading && <p className="mt-9 text-sm text-[#687487]">Loading campaign...</p>}
          {!isLoading && campaign && (
            <form onSubmit={updateCampaign} className="mt-9 space-y-6">
              <label className="block text-sm font-semibold text-[#e4e8ee]">
                Campaign name
                <input required autoFocus value={name} onChange={(event) => setName(event.target.value)} className="mt-2 block w-full rounded-xl border border-white/10 bg-[#0d1118] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#d7ff5f] focus:ring-2 focus:ring-[#d7ff5f]/10" />
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
              {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:justify-end">
                <Link href="/dashboard" className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-[#8d98a8] transition hover:bg-white/[0.06] hover:text-white">Cancel</Link>
                <button type="submit" disabled={isSubmitting} className="min-h-11 rounded-xl bg-[#d7ff5f] px-5 text-sm font-bold text-[#10140b] transition hover:bg-[#e4ff91] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Saving changes..." : "Save changes"}</button>
              </div>
            </form>
          )}
          {!isLoading && !campaign && error && <p className="mt-8 text-sm text-red-700">{error}</p>}
        </div>
      </div>
    </main>
  );
}
