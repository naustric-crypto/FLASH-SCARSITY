"use client";

import { useEffect, useMemo, useState } from "react";
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

type SummaryMetrics = {
  activeCampaigns: number;
  codesRedeemed: number;
  revenueInfluenced: number;
};

type FilterTab = "Overview" | "Live" | "Paused" | "Archived";

const initialCampaigns: Campaign[] = [
  { id: "sun-night", name: "Sunday night reset", code: "SUNDAY15", discount: "15% off", redemptions: 84, clicks: 312, status: "Live", expires: "Today, 11:45 PM" },
  { id: "welcome", name: "New subscriber welcome", code: "HELLO10", discount: "10% off", redemptions: 46, clicks: 205, status: "Live", expires: "Tomorrow, 9:00 AM" },
  { id: "clearance", name: "Old stock exit", code: "CLEAR25", discount: "$25 off", redemptions: 19, clicks: 88, status: "Paused", expires: "Sep 22, 6:30 PM" },
];

const defaultMetrics: SummaryMetrics = { activeCampaigns: 0, codesRedeemed: 0, revenueInfluenced: 0 };

function Icon({ name }: { name: "grid" | "campaign" | "code" | "chart" | "plug" | "help" | "menu" | "search" | "bell" | "arrow" }) {
  const paths = {
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    campaign: "M4 5h16v14H4zM8 3v4M16 3v4M7 12h10M7 16h6",
    code: "M8 8 5 12l3 4M16 8l3 4-3 4M14 5l-4 14",
    chart: "M4 19V5M4 19h17M8 16v-4M12 16V8M16 16v-7M20 16v-3",
    plug: "M8 12h8M12 8v8M7 5v3M17 5v3M7 16v3M17 16v3",
    help: "M9.5 9a2.7 2.7 0 1 1 4.5 2c-.9.7-2 1.2-2 2.5M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    menu: "M4 7h16M4 12h16M4 17h16",
    search: "m20 20-4.5-4.5M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z",
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
    arrow: "M5 12h14M13 6l6 6-6 6",
  };

  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d={paths[name]} />
    </svg>
  );
}

const navItems = [
  { label: "Overview", icon: "grid" as const, href: "#overview" },
  { label: "Campaigns", icon: "campaign" as const, href: "#campaigns" },
  { label: "Discount codes", icon: "code" as const, href: "#countdowns" },
  { label: "Analytics", icon: "chart" as const, href: "#analytics" },
  { label: "Integrations", icon: "plug" as const, href: "#integrations" },
];

export default function Dashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [metrics, setMetrics] = useState<SummaryMetrics>(defaultMetrics);
  const [activeTab, setActiveTab] = useState<FilterTab>("Overview");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    setIsTrialActive(window.localStorage.getItem("flash-scarcity-trial") === "active");

    async function loadData() {
      try {
        const [campaignsResponse, metricsResponse] = await Promise.all([
          fetch("/api/campaigns", { cache: "no-store" }),
          fetch("/api/dashboard", { cache: "no-store" }),
        ]);
        if (campaignsResponse.ok) {
          const data = (await campaignsResponse.json()) as Campaign[];
          if (Array.isArray(data) && data.length > 0) setCampaigns(data);
        }
        if (metricsResponse.ok) setMetrics((await metricsResponse.json()) as SummaryMetrics);
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

  async function triggerCountdown(campaignId: string | undefined) {
    if (!campaignId) return;
    const response = await fetch("/api/trigger-countdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });
    const payload = (await response.json()) as { code?: string; expiresAt?: string; error?: string; demo?: boolean };
    if (!response.ok) {
      setStatusMessage(payload.error ?? "Unable to trigger countdown.");
      return;
    }
    const expiry = payload.expiresAt ? new Date(payload.expiresAt).toLocaleString() : "soon";
    setStatusMessage(`${payload.demo ? "Demo code" : "Code"} ${payload.code ?? "FLASH"} created, expiring ${expiry}.`);
  }

  function updateCampaignStatus(campaignId: string | undefined) {
    if (!campaignId) return;
    setCampaigns((current) => current.map((campaign) => {
      if (campaign.id !== campaignId) return campaign;
      const nextStatus = campaign.status === "Live" ? "Paused" : "Live";
      setStatusMessage(`${campaign.name} is now ${nextStatus.toLowerCase()}.`);
      return { ...campaign, status: nextStatus };
    }));
  }

  const filteredCampaigns = activeTab === "Overview" ? campaigns : campaigns.filter((campaign) => campaign.status === activeTab);
  const totalClicks = campaigns.reduce((total, campaign) => total + campaign.clicks, 0);
  const totalRedemptions = campaigns.reduce((total, campaign) => total + campaign.redemptions, 0);
  const conversionRate = totalClicks > 0 ? (totalRedemptions / totalClicks) * 100 : 0;
  const topCampaign = useMemo(() => [...campaigns].sort((a, b) => b.clicks - a.clicks)[0], [campaigns]);
  const maxClicks = Math.max(...campaigns.map((campaign) => campaign.clicks), 1);

  if (!isTrialActive) {
    return (
      <main className="min-h-screen bg-[#0a0d12] px-6 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-[#11161f] p-8 shadow-2xl">
          <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-[#d7ff5f] text-xl font-black text-[#10140b]">F</div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#aab4c4]">Workspace locked</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Start your 7-day free trial.</h1>
          <p className="mt-5 leading-7 text-[#aab4c4]">Unlock campaigns, countdown triggers, and conversion reporting with no payment details required at signup.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/checkout" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#d7ff5f] px-5 text-sm font-bold text-[#10140b] transition hover:bg-[#e4ff91]">Start free trial <span className="ml-2">→</span></a>
            <a href="/pricing" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/5">View plans</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0a0d12] text-[#f4f6f8]">
      <div className="flex min-h-screen">
        {isNavOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setIsNavOpen(false)} />}
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-[264px] -translate-x-full flex-col border-r border-white/[0.07] bg-[#0d1118] px-4 py-5 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isNavOpen ? "translate-x-0" : ""}`}>
          <div className="flex items-center gap-3 px-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d7ff5f] text-sm font-black text-[#10140b]">F</div><div><p className="font-semibold tracking-[-0.03em]">Flash-Scarcity</p><p className="text-[10px] uppercase tracking-[0.18em] text-[#687487]">Merchant console</p></div></div>
          <div className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#687487]">Workspace</div>
          <nav className="mt-3 space-y-1">{navItems.map((item, index) => <a key={item.label} href={item.href} onClick={() => setIsNavOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition ${index === 0 ? "bg-white/[0.08] font-semibold text-white" : "text-[#8d98a8] hover:bg-white/[0.05] hover:text-white"}`}><Icon name={item.icon} />{item.label}</a>)}</nav>
          <div className="mt-auto space-y-1"><a href="#help" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-[#8d98a8] hover:bg-white/[0.05] hover:text-white"><Icon name="help" />Help & support</a><a href="/pricing" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-[#8d98a8] hover:bg-white/[0.05] hover:text-white"><span className="grid h-5 w-5 place-items-center rounded-md bg-[#d7ff5f] text-[10px] font-black text-[#10140b]">↑</span>Upgrade plan</a><div className="mt-4 flex items-center gap-3 border-t border-white/[0.07] px-3 pt-4"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#27313f] text-xs font-bold text-[#d7ff5f]">NS</div><div className="min-w-0"><p className="truncate text-sm font-semibold">Northstar Goods</p><p className="truncate text-xs text-[#687487]">northstar-goods</p></div></div></div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#0a0d12]/90 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 xl:px-10"><div className="flex items-center gap-3"><button aria-label="Open navigation" onClick={() => setIsNavOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-[#aab4c4] lg:hidden"><Icon name="menu" /></button><div><p className="text-xs text-[#687487]">Workspace / Overview</p><p className="mt-1 font-semibold tracking-[-0.02em]">Good morning, Northstar</p></div></div><div className="flex items-center gap-2"><button aria-label="Search" className="hidden h-10 w-10 place-items-center rounded-xl text-[#8d98a8] transition hover:bg-white/[0.06] hover:text-white sm:grid"><Icon name="search" /></button><button aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-xl text-[#8d98a8] transition hover:bg-white/[0.06] hover:text-white"><Icon name="bell" /></button><div className="hidden h-7 w-px bg-white/10 sm:block" /><div className="grid h-9 w-9 place-items-center rounded-full bg-[#d7ff5f] text-xs font-black text-[#10140b]">NS</div></div></div></header>

          <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
            <section id="overview" className="flex scroll-mt-28 flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-sm font-medium text-[#d7ff5f]">Tuesday, September 17, 2026</p><h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">Turn attention into <span className="text-[#d7ff5f]">urgency.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#8d98a8] sm:text-base">A clear read on the campaigns turning hesitation into checkout today.</p></div><div className="flex flex-wrap gap-3"><button type="button" onClick={() => router.push("/dashboard/campaigns/new")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#d7ff5f] px-4 text-sm font-bold text-[#10140b] transition hover:-translate-y-0.5 hover:bg-[#e4ff91]"><span className="text-lg leading-none">+</span> Create campaign</button><a href="#analytics" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]">View analytics <span className="ml-2 text-[#d7ff5f]">↗</span></a></div></section>

            <section className="mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
              { label: "Active campaigns", value: String(metrics.activeCampaigns || campaigns.length || 0).padStart(2, "0"), change: "+2 this month", icon: "campaign" as const },
              { label: "Codes redeemed", value: String(metrics.codesRedeemed || 0), change: "+18.4% vs last week", icon: "code" as const },
              { label: "Revenue influenced", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(metrics.revenueInfluenced || 0), change: "+9.2% vs last week", icon: "chart" as const },
              { label: "Conversion rate", value: `${conversionRate.toFixed(1)}%`, change: "From available clicks", icon: "arrow" as const },
            ].map((metric) => <article key={metric.label} className="rounded-2xl border border-white/[0.08] bg-[#11161f] p-5 transition hover:-translate-y-0.5 hover:border-white/[0.16]"><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] text-[#d7ff5f]"><Icon name={metric.icon} /></span><span className="text-xs text-[#687487]">{metric.change}</span></div><p className="mt-6 text-sm text-[#8d98a8]">{metric.label}</p><p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{metric.value}</p></article>)}
+            </section>

            {statusMessage && <div role="status" className="mt-5 rounded-xl border border-[#d7ff5f]/20 bg-[#d7ff5f]/[0.08] px-4 py-3 text-sm text-[#d7ff5f]">{statusMessage}</div>}

            <section id="analytics" className="mt-8 grid scroll-mt-28 gap-4 xl:grid-cols-[1.5fr_0.85fr]"><article className="rounded-2xl border border-white/[0.08] bg-[#11161f] p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold text-white">Campaign performance</p><p className="mt-1 text-xs text-[#687487]">Clicks across active campaigns</p></div><div className="flex rounded-lg border border-white/[0.08] p-1 text-xs text-[#8d98a8]"><span className="rounded-md bg-white/[0.08] px-3 py-1.5 text-white">7 days</span><span className="px-3 py-1.5">30 days</span><span className="hidden px-3 py-1.5 sm:inline">90 days</span></div></div><div className="mt-8 flex h-48 items-end gap-2 border-b border-white/[0.08] px-1">{campaigns.length ? campaigns.map((campaign) => <div key={campaign.id ?? campaign.name} className="flex min-w-0 flex-1 flex-col items-center gap-2"><div className="w-full max-w-14 rounded-t-lg bg-[#d7ff5f] opacity-80 transition hover:opacity-100" style={{ height: `${Math.max(14, (campaign.clicks / maxClicks) * 100)}%` }} title={`${campaign.clicks} clicks`} /><span className="max-w-full truncate text-[10px] text-[#687487]">{campaign.name.split(" ")[0]}</span></div>) : <div className="flex w-full items-center justify-center text-sm text-[#687487]">No campaign performance yet</div>}</div><div className="mt-5 flex flex-wrap gap-5 text-xs text-[#8d98a8]"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#d7ff5f]" />Clicks</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#5eead4]" />Redemptions {metrics.codesRedeemed}</span></div></article><article id="countdowns" className="scroll-mt-28 rounded-2xl border border-[#d7ff5f]/20 bg-[linear-gradient(145deg,#182118,#11161f)] p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-white">Urgency pulse</p><p className="mt-1 text-xs text-[#8d98a8]">Your strongest live campaign</p></div><span className="flex items-center gap-2 rounded-full bg-[#d7ff5f]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#d7ff5f]"><i className="h-1.5 w-1.5 rounded-full bg-[#d7ff5f]" />Live</span></div>{topCampaign ? <><p className="mt-9 text-lg font-semibold text-white">{topCampaign.name}</p><p className="mt-1 text-sm text-[#8d98a8]">{topCampaign.discount} <span className="mx-1 text-white/20">/</span> {topCampaign.code}</p><div className="mt-8 flex items-end gap-2 text-[#d7ff5f]"><span className="text-5xl font-semibold tracking-[-0.08em]">{topCampaign.expires.includes("Today") ? "14:58" : "--:--"}</span><span className="pb-2 text-xs uppercase tracking-[0.16em] text-[#8d98a8]">remaining</span></div><button type="button" onClick={() => triggerCountdown(topCampaign.id)} className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d7ff5f]/25 text-sm font-semibold text-[#d7ff5f] transition hover:bg-[#d7ff5f]/10">Trigger fresh code <Icon name="arrow" /></button></> : <div className="mt-10 text-sm text-[#8d98a8]">Create a campaign to start a countdown.</div>}</article></section>

            <section id="campaigns" className="mt-8 scroll-mt-28 rounded-2xl border border-white/[0.08] bg-[#11161f]"><div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] p-5 sm:flex-row sm:items-center sm:p-6"><div><p className="text-sm font-semibold text-white">Active campaigns</p><p className="mt-1 text-xs text-[#687487]">Monitor every urgency experiment from one place.</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-lg border border-white/[0.08] p-1 text-xs text-[#8d98a8]">{(["Overview", "Live", "Paused"] as FilterTab[]).map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`min-h-8 rounded-md px-3 transition ${activeTab === tab ? "bg-white/[0.1] text-white" : "hover:text-white"}`}>{tab}</button>)}</div><button type="button" onClick={() => router.push("/dashboard/campaigns/new")} className="grid h-9 w-9 place-items-center rounded-lg bg-[#d7ff5f] text-lg font-bold text-[#10140b]" aria-label="Create campaign">+</button></div></div>{isLoading ? <div className="space-y-3 p-5"><div className="h-16 animate-pulse rounded-xl bg-white/[0.05]" /><div className="h-16 animate-pulse rounded-xl bg-white/[0.05]" /><div className="h-16 animate-pulse rounded-xl bg-white/[0.05]" /></div> : filteredCampaigns.length === 0 ? <div className="px-6 py-16 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] text-[#d7ff5f]"><Icon name="campaign" /></div><p className="mt-4 font-semibold text-white">No campaigns yet</p><p className="mx-auto mt-2 max-w-sm text-sm text-[#687487]">Create your first urgency campaign and give shoppers a reason to act now.</p><button type="button" onClick={() => router.push("/dashboard/campaigns/new")} className="mt-5 min-h-11 rounded-xl bg-[#d7ff5f] px-4 text-sm font-bold text-[#10140b]">Create campaign</button></div> : <div className="divide-y divide-white/[0.06]">{filteredCampaigns.map((campaign) => <article key={`${campaign.name}-${campaign.code}`} className="p-5 transition hover:bg-white/[0.02] sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-start gap-3"><div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${campaign.status === "Live" ? "bg-[#d7ff5f] shadow-[0_0_14px_rgba(215,255,95,0.6)]" : "bg-[#687487]"}`} /><div className="min-w-0"><p className="truncate font-semibold text-white">{campaign.name}</p><p className="mt-1 text-xs text-[#687487]">{campaign.code} <span className="mx-1 text-white/20">•</span> ends {campaign.expires.replace("Ends ", "")}</p></div></div><div className="grid grid-cols-3 gap-5 text-sm sm:flex sm:items-center sm:gap-10"><div><p className="text-xs text-[#687487]">Discount</p><p className="mt-1 font-semibold text-white">{campaign.discount}</p></div><div><p className="text-xs text-[#687487]">Clicks</p><p className="mt-1 font-semibold text-white">{campaign.clicks}</p></div><div><p className="text-xs text-[#687487]">Redeemed</p><p className="mt-1 font-semibold text-white">{campaign.redemptions}</p></div></div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${campaign.status === "Live" ? "bg-[#d7ff5f]/10 text-[#d7ff5f]" : "bg-white/[0.08] text-[#8d98a8]"}`}>{campaign.status}</span><button type="button" onClick={() => triggerCountdown(campaign.id)} className="min-h-9 rounded-lg border border-white/10 px-3 text-xs font-semibold text-[#aab4c4] transition hover:border-[#d7ff5f]/30 hover:text-[#d7ff5f]">Trigger</button><button type="button" onClick={() => updateCampaignStatus(campaign.id)} className="min-h-9 rounded-lg border border-white/10 px-3 text-xs font-semibold text-[#aab4c4] transition hover:border-[#d7ff5f]/30 hover:text-[#d7ff5f]">{campaign.status === "Live" ? "Pause" : "Resume"}</button><button type="button" onClick={() => campaign.id && router.push(`/dashboard/campaigns/${campaign.id}/edit`)} className="min-h-9 rounded-lg border border-white/10 px-3 text-xs font-semibold text-[#aab4c4] transition hover:border-white/30 hover:text-white">Edit</button></div></div></article>)}</div>}</section>

            <section id="integrations" className="mt-8 grid scroll-mt-28 gap-4 pb-4 md:grid-cols-2"><article className="rounded-2xl border border-white/[0.08] bg-[#11161f] p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#95bf47]/15 text-[#b8e66a]">S</span><div><p className="text-sm font-semibold text-white">Shopify connection</p><p className="text-xs text-[#687487]">northstar-goods.myshopify.com</p></div></div><div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-4"><span className="text-sm text-[#8d98a8]">Connection status</span><span className="text-xs font-bold uppercase tracking-[0.14em] text-[#d7ff5f]">Ready</span></div></article><article id="help" className="rounded-2xl border border-white/[0.08] bg-[#11161f] p-6"><p className="text-sm font-semibold text-white">Need a hand?</p><p className="mt-2 text-sm leading-6 text-[#687487]">Get campaign guidance or connect your store when you are ready to scale.</p><a href="mailto:support@flash-scarcity.com" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#d7ff5f]">Contact support <Icon name="arrow" /></a></article></section>
          </div>
        </div>
      </div>
    </main>
  );
}
