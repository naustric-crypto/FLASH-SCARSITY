import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_rgba(0,109,119,0.12),_transparent_28%),linear-gradient(180deg,_#f4efe9_0%,_#f8faf9_100%)] px-6 text-slate-800">
      <div className="max-w-lg rounded-[28px] border border-slate-200 bg-white/80 p-10 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e76f51]">404</p>
        <h1 className="mt-4 text-4xl font-black text-slate-900">Page not found</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          The page you were looking for doesn’t exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#006d77] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#006d77]/15 transition hover:bg-[#00565d]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
