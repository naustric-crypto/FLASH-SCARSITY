import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-800">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)] md:p-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            ← Back home
          </Link>
          <Link href="/pricing" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            View pricing
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">Start now</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Launch your first urgency campaign.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Create a timed discount, trigger a fresh code when demand spikes, and convert hesitation into sales without extra manual work.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Connect your Shopify store",
                "Choose a discount rule and urgency window",
                "Generate a live code and watch conversion lift",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dff3ef] text-xs font-bold text-[#006d77]">✓</span>
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <form className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Create account</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Get started</h2>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Store name
                <input className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none ring-0 transition focus:border-[#006d77]" placeholder="Example Co" />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Email
                <input type="email" className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none ring-0 transition focus:border-[#006d77]" placeholder="you@example.com" />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Password
                <input type="password" className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none ring-0 transition focus:border-[#006d77]" placeholder="••••••••" />
              </label>
            </div>

            <Link
              href="/dashboard"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#006d77] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#006d77]/15 transition hover:bg-[#00565d]"
            >
              Create account
            </Link>

            <p className="mt-4 text-center text-sm text-slate-500">
              Already using Flash-Scarcity? <Link href="/dashboard" className="font-semibold text-[#006d77]">Open dashboard</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
