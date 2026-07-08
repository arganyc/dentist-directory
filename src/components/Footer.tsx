import Link from "next/link";
import LogoMark from "./LogoMark";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-blue-100 bg-blue-950 text-blue-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <LogoMark tone="dark" />
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
                <Link href="/tools/dental-cancellation-loss-calculator" className="text-blue-200 hover:text-white">
                  Cancellation Loss Calculator
                </Link>
              </li>
              <li>
                <Link href="/for-dentists/claim-outreach" className="text-blue-200 hover:text-white">
                  DMV Claim Outreach
                </Link>
              </li>
              <li>
                <Link href="/for-dentists/google-business-profile-strategy" className="text-blue-200 hover:text-white">
                  Google Profile Guide
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
