import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-blue-100 bg-blue-950 text-blue-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 5.5c-1.5-1.6-3.5-2-5-1.2-2 1-2.6 3.4-2 6 .4 1.6 1 3.4 1.6 5 .5 1.3 1.6 2.2 2.6 2.2 1 0 1.5-.8 2-2 .4-1 .8-1.5 1.3-1.5s.9.5 1.3 1.5c.5 1.2 1 2 2 2 1 0 2.1-.9 2.6-2.2.6-1.6 1.2-3.4 1.6-5 .6-2.6 0-5-2-6-1.5-.8-3.5-.4-5 1.2z" />
                </svg>
              </span>
              <span className="text-lg font-bold text-white">SmileFinder</span>
            </div>
            <p className="mt-4 max-w-md text-sm text-blue-200">
              The trusted directory of licensed dentists across the United States. Find the right
              dentist for your family — fast.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Patients</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/dentists" className="text-blue-200 hover:text-white">
                  Find a Dentist
                </Link>
              </li>
              <li>
                <Link href="/dentists-by-state" className="text-blue-200 hover:text-white">
                  Dentists by State
                </Link>
              </li>
              <li>
                <Link href="/dmv-dentists" className="text-blue-200 hover:text-white">
                  DMV Dentists
                </Link>
              </li>
              <li>
                <Link
                  href="/dentists?accepting=true"
                  className="text-blue-200 hover:text-white"
                >
                  Accepting New Patients
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-blue-200 hover:text-white">
                  Dental Health Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Dentists</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/for-dentists" className="text-blue-200 hover:text-white">
                  Why SmileFinder
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-blue-200 hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/claim" className="text-blue-200 hover:text-white">
                  Claim Your Listing
                </Link>
              </li>
              <li>
                <Link href="/for-dentists/claim-outreach" className="text-blue-200 hover:text-white">
                  DMV Claim Outreach
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Developers</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/api/dentists" className="text-blue-200 hover:text-white">
                  Public API
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-blue-900 pt-6 text-xs text-blue-300 sm:flex-row">
          <p>© {year} SmileFinder Directory. All rights reserved.</p>
          <p>For informational purposes only. Always consult a licensed dental professional.</p>
        </div>
      </div>
    </footer>
  );
}
