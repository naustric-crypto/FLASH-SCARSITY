"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function BillingSuccessPage() {
  useEffect(() => {
    document.cookie = "flash-scarcity-trial=active; path=/; max-age=604800";
    window.localStorage.setItem("flash-scarcity-trial", "active");
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(122,186,176,0.18),_transparent_25%),linear-gradient(180deg,_#f5f3ee_0%,_#f8faf9_100%)] px-6 py-16 text-slate-800">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-[#dff3ef] text-2xl text-[#006d77]">✓</div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">Welcome aboard</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Your free trial is active.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          You’re set to explore the full urgency engine for 7 days with no bank details required. Add a payment method during the trial to continue on a monthly billing cycle after the trial ends.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-[#006d77] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#006d77]/15 transition hover:bg-[#00565d]">
            Open dashboard
          </Link>
          <Link href="/pricing" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Review plans
          </Link>
        </div>
      </div>
    </main>
  );
}
