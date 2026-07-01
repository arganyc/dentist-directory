import Link from "next/link";
import { notFound } from "next/navigation";
import Rating from "@/components/Rating";
import { type Dentist } from "@/lib/dentists";
import { getDentistBySlug } from "@/lib/dentists-data";
import { getReviewsForDentist } from "@/lib/reviews";

const SITE_URL = "https://usdentistsdirectory.com";

function buildJsonLd(d: Dentist): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": `${SITE_URL}/dentists/${d.slug}`,
    url: `${SITE_URL}/dentists/${d.slug}`,
    name: d.practiceName || d.name,
    description: `${d.name}${d.credentials ? `, ${d.credentials}` : ""} — ${d.specialty} in ${d.address.city}, ${d.address.stateCode}`,
    medicalSpecialty: d.specialty,
    address: {
      "@type": "PostalAddress",
      streetAddress: d.address.street || undefined,
      addressLocality: d.address.city || undefined,
      addressRegion: d.address.stateCode || undefined,
      postalCode: d.address.zip || undefined,
      addressCountry: "US",
    },
  };
  if (d.phone) schema.telephone = d.phone;
  if (d.website) {
    schema.sameAs = d.website.startsWith("http") ? d.website : `https://${d.website}`;
  }
  if (d.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: d.rating,
      reviewCount: d.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  // Provider identifier from NPI (helps disambiguation in the knowledge graph)
  schema.identifier = {
    "@type": "PropertyValue",
    propertyID: "NPI",
    value: d.id,
  };
  return schema;
}

// ISR: render each profile once, then serve it from cache and refresh at most
// once per day. This stops crawlers from hitting the database on every request
// (the live-query load that exhausted the previous DB's compute quota).
export const revalidate = 86400;

// We don't prerender any of the ~64k profiles at build time. With dynamicParams
// defaulting to true, each profile is generated on its first request and then
// cached/served as static HTML until the next daily revalidation. Providing
// generateStaticParams (even empty) is what opts this dynamic route into the
// full-route cache instead of rendering on every request.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps<"/dentists/[slug]">) {
  const { slug } = await props.params;
  const d = await getDentistBySlug(slug);
  if (!d) return { title: "Dentist not found" };
  const desc = `${d.name}${d.credentials ? `, ${d.credentials}` : ""} — ${d.specialty} in ${d.address.city}, ${d.address.stateCode}. Contact: ${d.phone}.`;
  return {
    title: `${d.name}${d.credentials ? `, ${d.credentials}` : ""} — ${d.specialty} in ${d.address.city}, ${d.address.stateCode}`,
    description: desc,
    openGraph: {
      title: `${d.name} — ${d.specialty}`,
      description: desc,
      type: "profile",
    },
  };
}

export default async function DentistProfile(props: PageProps<"/dentists/[slug]">) {
  const { slug } = await props.params;
  const d = await getDentistBySlug(slug);
  if (!d) notFound();
  const reviews = getReviewsForDentist(d.id, 4);
  const addressLine = [
    d.address.street,
    [d.address.city, d.address.stateCode].filter(Boolean).join(", "),
    d.address.zip,
  ]
    .filter(Boolean)
    .join(" ");
  const claimParams = new URLSearchParams({
    profile: `${SITE_URL}/dentists/${d.slug}`,
    npi: d.id,
    practiceName: d.practiceName || d.name,
    city: d.address.city,
  });
  if (addressLine) claimParams.set("address", addressLine);
  if (d.phone) claimParams.set("phone", d.phone);
  if (d.website) claimParams.set("website", d.website);
  const claimHref = `/claim?${claimParams.toString()}`;

  const initials = d.name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const jsonLd = buildJsonLd(d);

  return (
    <div className="bg-slate-50">
      <script
        type="application/ld+json"
        // Stringify and strip "<" to avoid any chance of an XSS escape via injected JSON.
        // The dentist data comes from our own DB, but defense-in-depth is cheap.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 pb-16 pt-10 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-blue-100">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/dentists" className="hover:text-white">
              Dentists
            </Link>{" "}
            / <span className="text-white">{d.name}</span>
          </nav>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              aria-hidden
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-3xl font-bold text-blue-700 shadow-lg"
            >
              {initials || "DR"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                {d.specialty}
              </p>
              <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
                {d.name}
                {d.credentials && <span className="text-blue-100">, {d.credentials}</span>}
              </h1>
              {d.practiceName && d.practiceName !== d.name && (
                <p className="mt-1 text-lg text-blue-100">{d.practiceName}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
                  <Rating value={d.rating} count={d.reviewCount} />
                </div>
                {d.acceptingNewPatients ? (
                  <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow">
                    ✓ Accepting New Patients
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-500 px-3 py-1.5 text-xs font-semibold text-white">
                    Not accepting new patients
                  </span>
                )}
                {d.yearsExperience > 0 && (
                  <span className="text-sm text-blue-100">
                    {d.yearsExperience}+ years in practice
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100">
              <h2 className="text-xl font-bold text-slate-900">About</h2>
              <p className="mt-3 leading-relaxed text-slate-700">
                {d.bio ||
                  `${d.name}${d.credentials ? `, ${d.credentials}` : ""} is a ${d.specialty.toLowerCase()} provider based in ${d.address.city}, ${d.address.stateCode}.${
                    d.yearsExperience > 0 ? ` Practicing for over ${d.yearsExperience} years.` : ""
                  } Verified through the National Provider Identifier (NPI) registry.`}
              </p>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-blue-50/50 px-3 py-2 ring-1 ring-blue-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    NPI Number
                  </span>
                  <p className="mt-0.5 font-mono text-slate-800">{d.id}</p>
                </div>
                <div className="rounded-lg bg-blue-50/50 px-3 py-2 ring-1 ring-blue-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Specialty
                  </span>
                  <p className="mt-0.5 text-slate-800">{d.specialty}</p>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Patient Reviews ({d.reviewCount.toLocaleString()})
                </h2>
                <div className="flex items-center gap-2">
                  <Rating value={d.rating} />
                </div>
              </div>
              <ul className="mt-5 divide-y divide-blue-50">
                {reviews.map((r, i) => (
                  <li key={i} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{r.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {r.author} · {r.date}
                        </p>
                      </div>
                      <Rating value={r.rating} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{r.body}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">
                Reviews shown are illustrative samples. Ratings are computed from aggregate patient
                feedback.
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100">
              <h2 className="text-base font-bold text-slate-900">Contact</h2>
              <dl className="mt-3 space-y-3 text-sm">
                {(d.address.street || d.address.city) && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Address
                    </dt>
                    <dd className="mt-1 text-slate-800">
                      {d.address.street && (
                        <>
                          {d.address.street}
                          <br />
                        </>
                      )}
                      {d.address.city}
                      {d.address.stateCode && `, ${d.address.stateCode}`}
                      {d.address.zip && ` ${d.address.zip}`}
                    </dd>
                  </div>
                )}
                {d.phone && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Phone
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={`tel:${d.phone}`}
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        {d.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {d.website && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Website
                    </dt>
                    <dd className="mt-1">
                      {/*
                        Premium subscribers get do-follow outbound links (SEO juice
                        they're paying for). Free listings keep rel="nofollow" so we
                        don't hand out link equity for free.
                      */}
                      <a
                        href={d.website.startsWith("http") ? d.website : `https://${d.website}`}
                        target="_blank"
                        rel={d.isPremium ? "noopener noreferrer" : "nofollow noopener noreferrer"}
                        className="break-all font-semibold text-blue-700 hover:underline"
                      >
                        {d.website.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              {d.phone && (
                <a
                  href={`tel:${d.phone}`}
                  className="mt-5 block rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Call to Schedule
                </a>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Verified via NPI Registry · Practitioner #{d.id}
              </p>
            </div>

            <div className="rounded-xl bg-blue-600 p-6 text-white shadow-sm">
              <h2 className="text-base font-bold">Are you this dentist?</h2>
              <p className="mt-2 text-sm text-blue-100">
                Claim your listing to update your profile, add photos, and capture new patient
                leads.
              </p>
              <Link
                href={claimHref}
                className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Claim listing →
              </Link>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-sm">
              <h2 className="text-base font-bold">Upgrade to Premium</h2>
              <p className="mt-2 text-sm text-amber-50">Get priority placement, more patient leads, and analytics.</p>
              <div className="mt-4 space-y-2">
                <a href="https://buy.stripe.com/6oU14meqt6KbelLfqMaZi00" target="_blank" rel="noopener noreferrer" className="block rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-orange-600 hover:bg-amber-50">⭐ Professional — $29/mo</a>
                <a href="https://buy.stripe.com/8x27sK5TX1pR91r3I4aZi02" target="_blank" rel="noopener noreferrer" className="block rounded-md bg-white/20 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-white/30">⭐ Professional — $279/yr</a>
                <a href="https://buy.stripe.com/bJe00i2HL0lN5Pf4M8aZi03" target="_blank" rel="noopener noreferrer" className="block rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-orange-600 hover:bg-amber-50">👑 Premium Plus — $79/mo</a>
                <a href="https://buy.stripe.com/3cIbJ0gyBecD5PfdiEaZi04" target="_blank" rel="noopener noreferrer" className="block rounded-md bg-white/20 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-white/30">👑 Premium Plus — $759/yr</a>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10">
          <Link
            href="/dentists"
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            ← Back to all dentists
          </Link>
        </div>
      </div>
    </div>
  );
}
