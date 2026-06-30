import Link from "next/link";
import { dmvLandingPages } from "@/lib/dmv-growth";

export const metadata = {
  title: "Claim Your DMV Dental Practice Listing | US Dentists Directory",
  description:
    "DMV dentists can claim or update their US Dentists Directory listing for Washington DC, Northern Virginia, and Maryland patient searches.",
  alternates: {
    canonical: "/for-dentists/claim-outreach",
  },
};

const steps = [
  {
    title: "Find your local market",
    body: "Choose the DMV city closest to your practice so your claim request is tied to the right local campaign.",
  },
  {
    title: "Submit your NPI and practice details",
    body: "The claim form asks for your name, email, phone, NPI, practice name, address, website, and any listing notes.",
  },
  {
    title: "We verify and update",
    body: "The directory team reviews the request, verifies the practice, and follows up before updating important public information.",
  },
];

export default function ClaimOutreachPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Claim Your DMV Dental Practice Listing",
    description:
      "Dentist listing claim campaign for Washington DC, Maryland, and Northern Virginia dental practices.",
    url: "https://www.usdentistsdirectory.com/for-dentists/claim-outreach",
    audience: {
      "@type": "Audience",
      audienceType: "Dental practices in the DMV",
    },
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
            /{" "}
            <Link href="/for-dentists" className="hover:text-blue-700">
              For Dentists
            </Link>{" "}
            / <span className="text-slate-700">Claim Outreach</span>
          </nav>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                DMV dentist claim campaign
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Claim your dental practice listing before patients compare local options.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
                US Dentists Directory is expanding local discovery pages across Washington DC,
                Northern Virginia, and Maryland. Claimed listings help patients find accurate
                practice details and give dentists a stronger presence in local directory searches.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-lg font-bold text-amber-950">Fastest path</h2>
              <p className="mt-2 text-sm leading-relaxed text-amber-900">
                If your city is not listed below, use the general claim form and include your full
                practice address.
              </p>
              <Link
                href="/claim?source=dmv-claim-campaign"
                className="mt-4 inline-block rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-400"
              >
                General claim form
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                {index + 1}
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Claim by DMV city</h2>
              <p className="mt-2 max-w-3xl text-slate-600">
                These links pre-tag the request by local campaign city, which makes follow-up and
                reporting cleaner for outreach.
              </p>
            </div>
            <Link href="/dmv-dentists" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              View patient DMV hub
            </Link>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {dmvLandingPages.map((page) => (
              <div key={page.slug} className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  {page.city}, {page.stateCode}
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{page.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Claim or update a listing for a dental practice serving {page.city} patients.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={page.claimHref}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Claim listing
                  </Link>
                  <Link
                    href={`/dmv-dentists/${page.slug}`}
                    className="rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    View city page
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Outreach message dentists will understand</h2>
          <p className="mt-3 text-slate-600">
            The campaign should stay simple: tell dentists their practice may already appear in the
            directory, invite them to verify the details, and make the benefit clear without
            overpromising rankings or patient volume.
          </p>
          <div className="mt-5 rounded-lg bg-slate-50 p-5 text-sm leading-relaxed text-slate-700">
            Subject: Please verify your dental practice listing on US Dentists Directory
            <br />
            <br />
            Hello, we are expanding verified local dentist listings across the DMV. Please review
            or claim your practice listing so patients see the correct phone number, website,
            address, services, and practice details when comparing local dental offices.
          </div>
        </section>
      </main>
    </div>
  );
}
