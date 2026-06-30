import Link from "next/link";
import { notFound } from "next/navigation";
import { dmvLandingPages, getDmvLandingPage } from "@/lib/dmv-growth";

export function generateStaticParams() {
  return dmvLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata(props: PageProps<"/dmv-dentists/[slug]">) {
  const params = await props.params;
  const page = getDmvLandingPage(params.slug);
  if (!page) return {};
  return {
    title: `${page.title} | US Dentists Directory`,
    description: page.metaDescription,
    alternates: {
      canonical: `/dmv-dentists/${page.slug}`,
    },
  };
}

export default async function DmvCityDentistsPage(props: PageProps<"/dmv-dentists/[slug]">) {
  const params = await props.params;
  const page = getDmvLandingPage(params.slug);
  if (!page) notFound();

  const relatedPages = dmvLandingPages.filter((item) => item.slug !== page.slug).slice(0, 4);
  const faq = [
    {
      question: `How do I find a good dentist in ${page.city}, ${page.stateCode}?`,
      answer: `Start by comparing local dentists by location, services, appointment availability, credentials, and whether the office handles your specific need. The ${page.city} directory page gives you a focused list to begin that search.`,
    },
    {
      question: `Can I find emergency dental care in ${page.city}?`,
      answer: page.emergencyNote,
    },
    {
      question: `I am a dentist in ${page.city}. How do I update my listing?`,
      answer:
        "Use the claim form linked on this page. After submission, US Dentists Directory verifies the request before updating practice information.",
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.title,
      description: page.metaDescription,
      url: `https://www.usdentistsdirectory.com/dmv-dentists/${page.slug}`,
      about: {
        "@type": "MedicalBusiness",
        medicalSpecialty: "Dentistry",
        areaServed: `${page.city}, ${page.stateCode}`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <div className="bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/dmv-dentists" className="hover:text-blue-700">
              DMV Dentists
            </Link>{" "}
            / <span className="text-slate-700">{page.city}, {page.stateCode}</span>
          </nav>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                {page.city}, {page.state}
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                {page.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
                {page.intro}
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-lg font-bold text-slate-900">Ready to compare dentists?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Go directly to the local dentist directory for {page.city}, {page.stateCode}.
              </p>
              <Link
                href={page.listingHref}
                className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Browse dentist listings
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <article className="space-y-10">
          <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              What patients usually compare in {page.city}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {page.patientNeeds.map((need) => (
                <div key={need} className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {need}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Dental services people search for near {page.city}
            </h2>
            <p className="mt-3 text-slate-600">
              Patients in {page.city} commonly search for preventive, emergency, restorative,
              cosmetic, pediatric, and orthodontic services. A complete listing helps patients
              understand whether a practice is a good fit before they call.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {page.services.map((service) => (
                <span
                  key={service}
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800"
                >
                  {service}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Neighborhoods and nearby areas
            </h2>
            <p className="mt-3 text-slate-600">
              A dentist search is rarely just citywide. Many patients choose an office based on
              commute, school routines, transit access, parking, and proximity to home or work.
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {page.neighborhoods.map((neighborhood) => (
                <li key={neighborhood} className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {neighborhood}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Emergency dental care in {page.city}, {page.stateCode}
            </h2>
            <p className="mt-3 text-slate-600">{page.emergencyNote}</p>
            <p className="mt-3 text-slate-600">
              For life-threatening symptoms, difficulty breathing, major facial trauma, or severe
              spreading infection symptoms, seek emergency medical care. For urgent dental problems,
              a local dental office can explain whether same-day evaluation is possible.
            </p>
          </section>

          <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
            <div className="mt-5 space-y-5">
              {faq.map((item) => (
                <div key={item.question}>
                  <h3 className="font-bold text-slate-900">{item.question}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </article>

        <aside className="space-y-5">
          <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Local directory</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Browse active dentist listings for {page.city}, {page.stateCode}.
            </p>
            <Link
              href={page.listingHref}
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View dentists
            </Link>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Own a dental practice?</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              Claim your listing so patients see accurate contact details, services, and website
              information.
            </p>
            <Link
              href={page.claimHref}
              className="mt-4 inline-block rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-400"
            >
              Claim your listing
            </Link>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Nearby DMV guides</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {relatedPages.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/dmv-dentists/${item.slug}`}
                    className="font-medium text-blue-700 hover:text-blue-800"
                  >
                    {item.city}, {item.stateCode}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
