import Link from "next/link";

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

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(231,111,81,0.08),_transparent_20%),linear-gradient(180deg,_#f4efe9_0%,_#f8faf9_100%)] px-6 py-16 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            ← Back home
          </Link>
          <Link href="/checkout" className="rounded-full bg-[#006d77] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#006d77]/15 transition hover:bg-[#00565d]">
            Start free
          </Link>
        </div>

        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">Pricing</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Simple plans for conversion-focused brands.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Every plan includes a 7-day free trial with no bank details required. Upgrade only when your urgency engine is ready to scale.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
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
                href="/checkout"
                className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${
                  plan.featured ? "bg-[#006d77] text-white hover:bg-[#00565d]" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Start 7-day trial
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
