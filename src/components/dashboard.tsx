"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Campaign = {
  id?: string;
  name: string;
  code: string;
  discount: string;
  redemptions: number;
  clicks: number;
  status: "Live" | "Paused";
  expires: string;
};

const initialCampaigns: Campaign[] = [
  { id: "sun-night", name: "Sunday night reset", code: "SUNDAY15", discount: "15% off", redemptions: 84, clicks: 312, status: "Live", expires: "Today, 11:45 PM" },
  { id: "welcome", name: "New subscriber welcome", code: "HELLO10", discount: "10% off", redemptions: 46, clicks: 205, status: "Live", expires: "Tomorrow, 9:00 AM" },
  { id: "clearance", name: "Old stock exit", code: "CLEAR25", discount: "$25 off", redemptions: 19, clicks: 88, status: "Paused", expires: "Sep 22, 6:30 PM" },
];

type SummaryMetrics = {
  activeCampaigns: number;
  codesRedeemed: number;
  revenueInfluenced: number;
};

const defaultMetrics: SummaryMetrics = {
  activeCampaigns: 0,
  codesRedeemed: 0,
  revenueInfluenced: 0,
};

type FilterTab = "Overview" | "Live" | "Paused" | "Archived";

export default function Dashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [metrics, setMetrics] = useState<SummaryMetrics>(defaultMetrics);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("Overview");
  const [name, setName] = useState("");
  const [discount, setDiscount] = useState(15);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [shopUrl, setShopUrl] = useState("northstar-goods.myshopify.com");
  const [accessToken, setAccessToken] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrialActive, setIsTrialActive] = useState(false);

  useEffect(() => {
    const trialStatus = typeof window !== "undefined" ? window.localStorage.getItem("flash-scarcity-trial") : null;
    setIsTrialActive(trialStatus === "active");

    async function loadData() {
      try {
        const [campaignsResponse, metricsResponse] = await Promise.all([
          fetch("/api/campaigns", { cache: "no-store" }),
          fetch("/api/dashboard", { cache: "no-store" }),
        ]);

        if (campaignsResponse.ok) {
          const data = (await campaignsResponse.json()) as Campaign[];
          if (Array.isArray(data) && data.length > 0) {
            setCampaigns(data);
          }
        }

        if (metricsResponse.ok) {
          const summary = (await metricsResponse.json()) as SummaryMetrics;
          setMetrics(summary);
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

  function resetForm() {
    setName("");
    setDiscount(15);
    setDiscountType("PERCENTAGE");
    setShopUrl("northstar-goods.myshopify.com");
    setAccessToken("");
    setEditingCampaignId(null);
  }

  function openEditModal(campaign: Campaign) {
    const parsedDiscount = Number.parseInt(campaign.discount.replace(/[^\d]/g, ""), 10) || 15;
    const nextDiscountType = campaign.discount.includes("$") ? "FIXED_AMOUNT" : "PERCENTAGE";

    setEditingCampaignId(campaign.id ?? null);
    setName(campaign.name);
    setDiscount(parsedDiscount);
    setDiscountType(nextDiscountType);
    setShopUrl("northstar-goods.myshopify.com");
    setAccessToken("");
    setModalOpen(true);
  }

  function updateCampaignStatus(campaignId: string | undefined) {
    if (!campaignId) return;

    setCampaigns((current) =>
      current.map((campaign) => {
        if (campaign.id !== campaignId) return campaign;

        const nextStatus = campaign.status === "Live" ? "Paused" : "Live";
        setStatusMessage(`Campaign ${campaign.name} is now ${nextStatus.toLowerCase()}.`);
        return { ...campaign, status: nextStatus };
      }),
    );
  }

  async function saveCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    if (editingCampaignId) {
      setCampaigns((current) =>
        current.map((campaign) => {
          if (campaign.id !== editingCampaignId) return campaign;

          return {
            ...campaign,
            name: name.trim(),
            discount: discountType === "PERCENTAGE" ? `${discount}% off` : `$${discount} off`,
          };
        }),
      );
      setStatusMessage(`Campaign updated: ${name.trim()}`);
      resetForm();
      setModalOpen(false);
      return;
    }

    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        discount,
        discountType,
        shopUrl,
        accessToken,
      }),
    });

    if (!response.ok) {
      setStatusMessage("Could not create the campaign. Please try again.");
      return;
    }

    const createdCampaign = (await response.json()) as Campaign;
    setCampaigns((current) => [createdCampaign, ...current]);
    setStatusMessage(`Campaign created: ${name.trim()}`);
    resetForm();
    setModalOpen(false);
  }

  async function triggerCountdown(campaignId: string | undefined) {
    if (!campaignId) return;

    const response = await fetch("/api/trigger-countdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });

    const payload = (await response.json()) as { code?: string; expiresAt?: string; error?: string; demo?: boolean };
    if (!response.ok) {
      setStatusMessage(payload.error ?? "Unable to trigger countdown");
      return;
    }

    const expiryLabel = payload.expiresAt ? new Date(payload.expiresAt).toLocaleString() : "soon";
    setStatusMessage(
      payload.demo
        ? `Demo code created: ${payload.code ?? "FLASH"} — expires ${expiryLabel}`
        : `Code created: ${payload.code ?? "FLASH"} — expires ${expiryLabel}`,
    );
  }

  const filteredCampaigns =
    activeTab === "Overview"
      ? campaigns
      : campaigns.filter((campaign) => campaign.status === activeTab);

  if (!isTrialActive) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(231,111,81,0.1),_transparent_20%),linear-gradient(180deg,_#f4efe9_0%,_#f8faf9_100%)] px-6 py-16 text-slate-800">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-[#dff3ef] text-2xl text-[#006d77]">🔒</div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">Access required</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Start your 7-day free trial.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Unlock the merchant dashboard, campaign builder, countdown triggers, and conversion analytics with a trial that starts immediately and needs no bank details.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/checkout" className="inline-flex items-center justify-center rounded-full bg-[#006d77] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#006d77]/15 transition hover:bg-[#00565d]">
              Start free trial
            </a>
            <a href="/pricing" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              View plans
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(122,186,176,0.25),_transparent_30%),linear-gradient(180deg,_#f6f3ee_0%,_#f2f6f3_100%)] text-slate-800">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#e76f51] to-[#d45b3c] text-lg font-bold text-white shadow-lg shadow-[#e76f51]/20">
              F
            </div>
            <div>
              <p className="font-display text-2xl leading-none text-slate-900">Flash-Scarcity</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Merchant console</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm">
            <span className="hidden text-sm text-slate-600 sm:inline">northstar-goods.myshopify.com</span>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dff3ef] text-sm font-semibold text-[#006d77]">NS</div>
          </div>
        </header>

        <section className="flex flex-col justify-between gap-6 pb-10 pt-12 sm:flex-row sm:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">Tuesday, September 17</p>
            <h1 className="font-display text-4xl leading-[0.95] tracking-tight text-slate-900 sm:text-6xl">
              Turn attention<br />
              <span className="text-[#006d77]">into urgency.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Give every click a fresh reason to checkout. Your active campaigns are performing at a strong conversion pace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/campaigns/new")}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-[#006d77]"
          >
            + Create campaign
          </button>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-[0_10px_20px_rgba(15,23,42,0.03)] backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              {(["Overview", "Live", "Paused", "Archived"] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-3 py-1.5 transition ${
                    activeTab === tab ? "bg-slate-900 text-white" : "hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">Updated 3m ago</span>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Active campaigns",
              value: String(metrics.activeCampaigns || campaigns.length || 0).padStart(2, "0"),
              note: "+2 this month",
            },
            {
              label: "Codes redeemed",
              value: String(metrics.codesRedeemed || 0),
              note: "+18.4% vs last week",
            },
            {
              label: "Revenue influenced",
              value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(metrics.revenueInfluenced || 0),
              note: "+9.2% vs last week",
            },
          ].map((metric, index) => (
            <article
              key={metric.label}
              className="animate-rise-in rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_14px_30px_rgba(17,24,39,0.04)] backdrop-blur-sm"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="mt-4 font-display text-4xl text-slate-900">{metric.value}</p>
              <p className="mt-2 text-xs font-semibold text-[#006d77]">{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 animate-rise-in rounded-[24px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:p-7">
          {statusMessage && (
            <div className="mb-5 rounded-xl border border-[#dff3ef] bg-[#f2fbfa] px-4 py-3 text-sm text-[#006d77]">{statusMessage}</div>
          )}

          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Campaigns</p>
              <h2 className="mt-2 font-display text-3xl text-slate-900">Active pulse</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("Overview")}
              className="text-sm font-semibold text-[#006d77] transition hover:underline"
            >
              View all
            </button>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-500">Loading campaigns…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-slate-200 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="pb-3 font-semibold">Campaign</th>
                    <th className="pb-3 font-semibold">Discount</th>
                    <th className="pb-3 font-semibold">Clicks</th>
                    <th className="pb-3 font-semibold">Redeemed</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Ends</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        {activeTab === "Overview"
                          ? "No campaigns yet. Create your first urgency campaign to get started."
                          : `No ${activeTab.toLowerCase()} campaigns right now.`}
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((campaign) => (
                      <tr key={`${campaign.name}-${campaign.code}`} className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/80">
                        <td className="py-5 pr-4">
                          <p className="font-semibold text-slate-800">{campaign.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{campaign.code}</p>
                        </td>
                        <td className="py-5 text-slate-700">{campaign.discount}</td>
                        <td className="py-5 text-slate-700">{campaign.clicks}</td>
                        <td className="py-5 text-slate-700">{campaign.redemptions}</td>
                        <td className="py-5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              campaign.status === "Live" ? "bg-[#eaf6f4] text-[#006d77]" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span className={`h-2 w-2 rounded-full ${campaign.status === "Live" ? "bg-[#e76f51]" : "bg-slate-400"}`} />
                            {campaign.status}
                          </span>
                        </td>
                        <td className="py-5 text-slate-500">{campaign.expires}</td>
                        <td className="py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => triggerCountdown(campaign.id)} className="rounded-full border border-[#e76f51]/30 bg-[#fff2ee] px-2.5 py-1.5 text-[11px] font-medium text-[#b24d35] transition hover:border-[#e76f51] hover:bg-[#ffe6df]">Trigger code</button>
                            <button
                              type="button"
                              onClick={() => updateCampaignStatus(campaign.id)}
                              className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              {campaign.status === "Live" ? "Pause" : "Resume"}
                            </button>
                            <button
                              type="button"
                              onClick={() => campaign.id && router.push(`/dashboard/campaigns/${campaign.id}/edit`)}
                              className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 z-10 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:p-5">
          <form id="campaign-form" onSubmit={saveCampaign} className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[28px] border border-slate-200 bg-[#f8f7f4] p-7 shadow-[0_-30px_80px_rgba(15,23,42,0.2)] sm:rounded-[28px]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e76f51]">{editingCampaignId ? "Edit campaign" : "New campaign"}</p>
                <h2 id="modal-title" className="mt-2 font-display text-3xl text-slate-900">{editingCampaignId ? "Refine the pulse." : "Make it count."}</h2>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => {
                  resetForm();
                  setModalOpen(false);
                }}
                className="grid h-9 w-9 place-items-center rounded-full text-xl text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              >
                &times;
              </button>
            </div>

            <label className="mt-7 block text-sm font-semibold text-slate-800">
              Campaign name
              <input
                required
                autoFocus={!editingCampaignId}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Weekend spark"
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#006d77] focus:ring-2 focus:ring-[#006d77]/10"
              />
            </label>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-800">
                Discount type
                <select
                  value={discountType}
                  onChange={(event) => setDiscountType(event.target.value as "PERCENTAGE" | "FIXED_AMOUNT")}
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#006d77] focus:ring-2 focus:ring-[#006d77]/10"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed amount</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                {discountType === "PERCENTAGE" ? "Discount %" : "Discount amount"}
                <input
                  required
                  min="1"
                  max={discountType === "PERCENTAGE" ? 100 : 1000}
                  type="number"
                  value={discount}
                  onChange={(event) => setDiscount(Number(event.target.value))}
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#006d77] focus:ring-2 focus:ring-[#006d77]/10"
                />
              </label>
            </div>

            <label className="mt-5 block text-sm font-semibold text-slate-800">
              Shopify shop domain
              <input
                value={shopUrl}
                onChange={(event) => setShopUrl(event.target.value)}
                placeholder="your-store.myshopify.com"
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#006d77] focus:ring-2 focus:ring-[#006d77]/10"
              />
            </label>

            <label className="mt-5 block text-sm font-semibold text-slate-800">
              Access token
              <input
                type="password"
                value={accessToken}
                onChange={(event) => setAccessToken(event.target.value)}
                placeholder="Optional for demo mode"
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#006d77] focus:ring-2 focus:ring-[#006d77]/10"
              />
            </label>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setModalOpen(false);
                }}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#006d77]">
                {editingCampaignId ? "Save changes" : "Create campaign"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
