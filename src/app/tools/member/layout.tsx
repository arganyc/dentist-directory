import Link from "next/link";
import { getToolsAccess } from "@/lib/toolsAccess";

export const metadata = {
  title: "Member Tools",
  robots: { index: false, follow: false },
};

export default async function MemberToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getToolsAccess();

  if (!access) {
    return (
      <div className="bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden>
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 118 0v3" />
            </svg>
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
            Claim your listing to unlock these tools
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Practice-management calculators — overhead, case acceptance, hygiene production,
            patient acquisition cost, staffing, equipment ROI, and insurance write-offs — are
            free for claimed practices. It takes about 2 minutes.
          </p>
          <Link
            href="/claim?source=member-tools-gate"
            className="mt-7 inline-block rounded-lg bg-blue-600 px-6 py-3 text-base font-bold text-white shadow-sm hover:bg-blue-700"
          >
            Claim your free listing →
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            Already claimed? Check your email for your personal tools link, or{" "}
            <Link href="/claim" className="font-semibold text-blue-700 hover:text-blue-800">
              re-claim your listing
            </Link>{" "}
            to get a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Member Tools
            </p>
            <p className="text-sm text-slate-600">
              Signed in as <span className="font-semibold text-slate-900">{access.practiceName}</span>
            </p>
          </div>
          <Link
            href="/tools/member"
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            ← All tools
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
