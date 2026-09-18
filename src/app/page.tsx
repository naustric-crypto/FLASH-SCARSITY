import Link from "next/link";

const benefits = [
  "Instant countdown campaign setup",
  "Single-use Shopify discount codes",
  "Auto-expire and cleanup logic",
  "Merchant dashboard for conversion reporting",
];

const steps = [
  {
    title: "Create",
    text: "Launch a time-boxed campaign in under a minute with a store-specific discount rule.",
  },
  {
    title: "Trigger",
    text: "Generate a fresh code when urgency spikes, visitors hesitate, or inventory starts to move.",
  },
  {
    title: "Sell",
    text: "Capture the moment, convert the traffic, and let expiry pressure do the closing work.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "For early-stage stores validating urgency-driven discounts.",
    features: ["3 active campaigns", "Live code generation", "Email support"],
  },
  {
    name: "Growth",
    price: "$79",
    description: "For growing brands ready to scale urgency-based campaigns.",
    features: ["Unlimited campaigns", "Advanced reporting", "Priority support"],
    featured: true,
  },
  {
    name: "Scale",
    price: "$199",
    description: "For teams running multiple stores and high-volume promos.",
    features: ["Multi-store support", "White-label brand setup", "Dedicated onboarding"],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(231,111,81,0.12),_transparent_22%),linear-gradient(180deg,_#f4efe9_0%,_#f8faf9_100%)] text-slate-800">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#e76f51] to-[#d45b3c] text-lg font-bold text-white shadow-lg shadow-[#e76f51]/20">
            F
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">Flash-Scarcity</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition hover:text-slate-900">Features</a>
          <a href="#how-it-works" className="transition hover:text-slate-900">How it works</a>
          <a href="#pricing" className="transition hover:text-slate-900">Pricing</a>
        </nav>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#006d77]"
        >
          Open dashboard
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-18 pt-12 lg:px-10 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-5 inline-flex items-center rounded-full border border-[#e9d3ca] bg-[#fff5f1] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#b24d35]">
              Built for Shopify conversion
            </div>
            <h1 className="max-w-xl text-5xl font-black leading-[0.92] tracking-tight text-slate-900 sm:text-6xl">
              Turn hesitation into checkout.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Flash-Scarcity generates urgency-driven discount codes that expire fast so shoppers act now instead of later.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[#006d77] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#006d77]/15 transition hover:-translate-y-0.5"
              >
                Launch your first campaign
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                See pricing
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <span>✔ Real Shopify discount rules</span>
              <span>✔ Zero-code setup</span>
              <span>✔ Built-in expiry logic</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Urgency pulse</p>
                <span className="rounded-full bg-[#dff3ef] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#006d77]">
                  Live
                </span>
              </div>

              <div className="mt-8 grid gap-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Campaign</p>
                  <p className="mt-2 text-2xl font-bold">Weekend sprint</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Discount</p>
                    <p className="mt-2 text-2xl font-bold">20%</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Ends in</p>
                    <p className="mt-2 text-2xl font-bold">14:58</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-18 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">Why stores use it</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to create urgency without guesswork.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.04)]">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#dff3ef] text-[#006d77]">✓</div>
              <p className="text-lg font-semibold text-slate-900">{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-18 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">How it works</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">A simple system that turns attention into action.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_30px_rgba(15,23,42,0.04)]">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#fff2ee] text-sm font-bold text-[#b24d35]">
                0{index + 1}
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-base leading-7 text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-18 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">Pricing</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Simple pricing for stores ready to grow faster.</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-6 ${plan.featured ? "border-[#006d77] bg-[#f3fbfa] shadow-[0_20px_40px_rgba(0,109,119,0.08)]" : "border-slate-200 bg-white/80"}`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{plan.name}</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                <span className="pb-1 text-sm text-slate-500">/ month</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#dff3ef] text-xs font-bold text-[#006d77]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${
                  plan.featured ? "bg-[#006d77] text-white hover:bg-[#00565d]" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>© 2026 Flash-Scarcity</p>
          <div className="flex items-center gap-6">
            <Link href="#features" className="hover:text-slate-800">Features</Link>
            <Link href="/pricing" className="hover:text-slate-800">Pricing</Link>
            <Link href="/dashboard" className="hover:text-slate-800">Dashboard</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
