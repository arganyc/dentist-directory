import Link from "next/link";
import ClaimForm from "./ClaimForm";

export const metadata = {
  title: "Claim or Add Your Practice",
  description:
    "Claim your existing SmileFinder listing or add your dental practice to our directory. Free to get started — verified within one business day.",
};

export default function ClaimPage() {
  return (
    <div className="bg-slate-50">
      <div className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>{" "}
            / <span className="text-slate-700">Claim Listing</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Claim or add your practice
          </h1>
          <p className="mt-3 text-slate-600">
            Already listed on SmileFinder? Claim ownership to manage your profile. New to the
            directory? Submit your practice and we'll publish it after a quick verification.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <ClaimForm />

        <aside className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">What happens next?</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  1
                </span>
                <span>We verify your NPI and contact info — usually within one business day.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  2
                </span>
                <span>You receive an email with login credentials to manage your profile.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  3
                </span>
                <span>Your listing goes live and starts attracting patients.</span>
              </li>
            </ol>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-600 p-6 text-white shadow-sm">
            <h2 className="text-base font-bold">Want premium placement?</h2>
            <p className="mt-2 text-sm text-blue-100">
              See our pricing tiers and unlock featured placement, lead capture, and analytics.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              See plans →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
