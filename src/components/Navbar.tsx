"use client";

import Link from "next/link";
import { useState } from "react";
import LogoMark from "./LogoMark";

const mobileLinks = [
  { href: "/dentists", label: "Find a Dentist" },
  { href: "/blog", label: "Blog" },
  { href: "/for-dentists", label: "For Dentists" },
  { href: "/dentistos", label: "DentOS" },
  { href: "/dentist-success-hub", label: "Dentist Success Hub" },
  { href: "/tools", label: "Free Tools" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-100 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={closeMobileMenu}>
          <LogoMark />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-lg font-bold text-blue-700">SmileFinder</span>
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
            href="/dentistos"
            className="hidden rounded-md px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 lg:inline-block"
          >
            DentOS
          </Link>
          <Link
            href="/dentist-success-hub"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 xl:inline-block"
          >
            Dentist Success Hub
          </Link>
          <Link
            href="/tools"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 lg:inline-block"
          >
            Free Tools
          </Link>
          <Link
            href="/for-dentists"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 lg:inline-block"
          >
            List your practice
          </Link>
          <Link
            href="/pricing"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 md:inline-block"
          >
            Pricing
          </Link>
          <Link
            href="/claim"
            className="ml-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:px-4"
            onClick={closeMobileMenu}
          >
            Get Listed
          </Link>

          <button
            type="button"
            className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-navigation" className="border-t border-blue-100 bg-white shadow-lg sm:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="grid gap-1">
              {mobileLinks.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={
                    item.href === "/dentistos"
                      ? "rounded-lg bg-blue-50 px-3 py-3 text-base font-semibold text-blue-700 transition hover:bg-blue-100"
                      : "rounded-lg px-3 py-3 text-base font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                  }
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/claim"
                className="mt-2 rounded-lg bg-blue-600 px-3 py-3 text-center text-base font-semibold text-white transition hover:bg-blue-700"
                onClick={closeMobileMenu}
              >
                Claim or List Your Practice
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
