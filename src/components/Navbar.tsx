import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm"
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
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-blue-700">SmileFinder</span>
            <span className="hidden text-[10px] uppercase tracking-wider text-blue-500 sm:block">
              US Dentist Directory
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/dentists"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 sm:inline-block"
          >
            Find a Dentist
          </Link>
          <Link
            href="/blog"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 sm:inline-block"
          >
            Blog
          </Link>
          <Link
            href="/for-dentists"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 md:inline-block"
          >
            For Dentists
          </Link>
          <Link
            href="/pricing"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 md:inline-block"
          >
            Pricing
          </Link>
          <Link
            href="/claim"
            className="ml-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Get Listed
          </Link>
        </div>
      </nav>
    </header>
  );
}
