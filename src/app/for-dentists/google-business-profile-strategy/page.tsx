import Link from "next/link";

export const metadata = {
  title: "Google Business Profile Strategy for Dentists | US Dentists Directory",
  description:
    "A practical Google Business Profile checklist for dentists: accurate practice details, services, hours, photos, reviews, and local visibility signals.",
  alternates: {
    canonical: "/for-dentists/google-business-profile-strategy",
  },
};

const checklist = [
  {
    title: "Complete the core practice information",
    items: [
      "Practice name exactly as patients know it",
      "Primary phone number and appointment phone number",
      "Website and appointment URL",
      "Street address, service area, and map pin",
      "Primary dental category and relevant secondary categories",
    ],
  },
  {
    title: "Keep hours and access details current",
    items: [
      "Regular hours",
      "Holiday hours",
      "Emergency or same-day availability notes",
      "Parking, transit, elevator, and accessibility information",
      "Insurance, financing, and new-patient policy details where appropriate",
    ],
  },
  {
    title: "Build service relevance",
    items: [
      "Dental cleaning and exams",
      "Emergency dental care",
      "Family and pediatric dentistry",
      "Cosmetic dentistry, whitening, veneers, and bonding",
      "Dental implants, dentures, crowns, bridges, Invisalign, and braces",
    ],
  },
  {
    title: "Use photos and trust signals",
    items: [
      "Exterior photo so patients recognize the location",
      "Reception and treatment room photos",
      "Dentist and team photos",
      "Logo and brand image",
      "Before and after photos only when appropriate, consented, and compliant",
    ],
  },
  {
    title: "Create a review response rhythm",
    items: [
      "Ask happy patients to leave honest reviews without incentives",
      "Respond professionally to positive and negative reviews",
      "Never disclose protected health information in a review response",
      "Route unhappy patients to a private office follow-up",
      "Track themes patients mention: comfort, clarity, billing, wait time, and emergencies",
    ],
  },
];

const weeklyRhythm = [
  ["Monday", "Review profile edits, hours, holiday changes, and appointment links."],
  ["Tuesday", "Upload one useful photo or short update when available."],
  ["Wednesday", "Respond to new reviews with privacy-safe, professional language."],
  ["Thursday", "Check top services and make sure profile/service wording matches the website."],
  ["Friday", "Review patient questions, missed calls, and appointment conversion notes."],
];

export default function GoogleBusinessProfileStrategyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Google Business Profile Strategy for Dentists",
    description:
      "A local visibility checklist for dental practices managing Google Business Profile, reviews, photos, services, and directory listings.",
    url: "https://www.usdentistsdirectory.com/for-dentists/google-business-profile-strategy",
    audience: {
      "@type": "Audience",
      audienceType: "Dental practice owners and office managers",
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
            / <span className="text-slate-700">Google Business Profile Strategy</span>
          </nav>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                Local visibility checklist
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Google Business Profile strategy for dentists who want better local discovery.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
                A complete, accurate, and active Google Business Profile helps patients understand
                who you are, where you are, what you treat, when you are open, and whether your
                office feels trustworthy before they call.
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-lg font-bold text-slate-900">Pair GBP with your directory listing</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Claiming your US Dentists Directory profile gives patients another accurate place
                to confirm your practice details.
              </p>
              <Link
                href="/claim?source=gbp-strategy"
                className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Claim your listing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {checklist.map((section) => (
            <div key={section.title} className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Weekly profile management rhythm</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            The best Google Business Profile strategy is not a one-time setup. It is a simple weekly
            operating habit that keeps patient-facing details accurate.
          </p>
          <div className="mt-6 overflow-hidden rounded-lg border border-blue-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50 text-slate-900">
                <tr>
                  <th className="px-4 py-3 font-bold">Day</th>
                  <th className="px-4 py-3 font-bold">Task</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 bg-white text-slate-600">
                {weeklyRhythm.map(([day, task]) => (
                  <tr key={day}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{day}</td>
                    <td className="px-4 py-3">{task}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Privacy-safe review responses</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Dental practices should respond to reviews without confirming that someone is a
              patient, discussing treatment, or mentioning private health details. A safe response
              can thank the reviewer, invite direct office contact, and stay general.
            </p>
            <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              Thank you for taking the time to share feedback. Our team works hard to make each
              visit clear, comfortable, and respectful. Please contact our office directly if there
              is anything we can help with.
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Directory profile consistency</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Keep your practice name, address, phone number, website, and service descriptions
              consistent across your website, Google Business Profile, US Dentists Directory, and
              other reputable local listings.
            </p>
            <Link
              href="/for-dentists/claim-outreach"
              className="mt-5 inline-block rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Review claim outreach system
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
