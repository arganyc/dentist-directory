import Link from "next/link";
import { dmvLandingPages } from "@/lib/dmv-growth";

export const metadata = {
  title: "DMV Dentists Directory | Washington DC, Maryland & Northern Virginia",
  description:
    "Find dentists across the DMV, including Washington DC, Arlington, Alexandria, Fairfax, Bethesda, Rockville, and Silver Spring. Dentists can claim listings.",
  alternates: {
    canonical: "/dmv-dentists",
  },
};

export default function DmvDentistsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DMV Dentists Directory",
    description:
      "Local dentist directory hub for Washington DC, Maryland, and Northern Virginia.",
    url: "https://www.usdentistsdirectory.com/dmv-dentists",
    hasPart: dmvLandingPages.map((page) => ({
      "@type": "WebPage",
      name: page.title,
      url: `https://www.usdentistsdirectory.com/dmv-dentists/${page.slug}`,
    })),
  };

  return (
    <div className="bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <nav className="text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>{" "}
            / <span className="text-slate-700">DMV Dentists</span>
          </nav>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                Washington DC, Maryland & Northern Virginia
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Find dentists across the DMV with local city guides.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
                Compare dental offices in the DMV for cleanings, emergency appointments,
                family dentistry, cosmetic dentistry, implants, Invisalign, pediatric visits, and
                other common patient needs. Each local guide connects patients to nearby dentist
                listings and gives practices a clear way to claim accurate information.
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-lg font-bold text-slate-900">Are you a DMV dentist?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Claim your listing so patients see the right phone number, website, services,
                hours, and practice details.
              </p>
              <Link
                href="/for-dentists/claim-outreach"
                className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Start claim outreach
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900">Browse DMV dentist guides by city</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {dmvLandingPages.map((page) => (
              <Link
                key={page.slug}
                href={`/dmv-dentists/${page.slug}`}
                className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  {page.city}, {page.stateCode}
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{page.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{page.intro}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700">
                  View local guide
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">For patients</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Start with the city closest to your home, office, school, or commute. Then compare
              dentists by services, location, availability, and whether the office fits your needs.
            </p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">For emergencies</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              If you have severe pain, swelling, trauma, uncontrolled bleeding, or signs of
              infection, contact a dental office directly and ask about same-day urgent care.
            </p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">For practices</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Claimed listings help reduce outdated information and give patients better context
              before they call. DMV practices can start with a free claim request.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
