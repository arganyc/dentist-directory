import Link from "next/link";
import { MEMBER_TOOLS } from "@/lib/memberTools";

export const metadata = {
  title: "Free Tools for Dental Practices",
  description:
    "Free calculators for dentists and dental office managers — overhead, case acceptance, hygiene production, patient acquisition cost, staffing, equipment ROI, and no-show losses.",
  alternates: { canonical: "/tools" },
};

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 118 0v3" />
    </svg>
  );
}

export default function ToolsIndexPage() {
  return (
    <div className="bg-slate-50">
      <section className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>{" "}
            / <span className="text-slate-700">Tools</span>
          </nav>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Free tools for dental practices
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Practical calculators for dentists and office managers. One is free for anyone; the rest
            unlock the moment you claim your free directory listing.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-slate-900">Open to everyone</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/tools/dental-cancellation-loss-calculator"
            className="flex flex-col rounded-lg border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <h3 className="font-bold text-slate-900">Cancellation & No-Show Loss Calculator</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              Estimate missed revenue from cancellations, no-shows, and open chair time.
            </p>
            <span className="mt-4 text-sm font-semibold text-blue-700">Open calculator →</span>
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">Unlocked when you claim your listing</h2>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Free — takes 2 minutes
          </span>
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBER_TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/member/${tool.slug}`}
              className="flex flex-col rounded-lg border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-blue-700">
                <LockIcon />
                <h3 className="font-bold text-slate-900">{tool.shortTitle}</h3>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{tool.description}</p>
              <span className="mt-4 text-sm font-semibold text-blue-700">Claim to unlock →</span>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-blue-100 bg-blue-600 p-8 text-center text-white shadow-sm">
          <h2 className="text-2xl font-bold">Claim your free listing to unlock every tool</h2>
          <p className="mx-auto mt-2 max-w-xl text-blue-100">
            Takes about 2 minutes. You&apos;ll get instant access to all 7 member tools.
          </p>
          <Link
            href="/claim?source=tools-index"
            className="mt-5 inline-block rounded-md bg-white px-6 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
          >
            Claim your free listing →
          </Link>
        </div>
      </main>
    </div>
  );
}
