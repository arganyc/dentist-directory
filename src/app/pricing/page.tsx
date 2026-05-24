import Link from "next/link";

export const metadata = {
  title: "Pricing — List Your Dental Practice",
  description:
    "Choose a SmileFinder listing tier for your dental practice. Basic listings are free. Professional ($29/mo) and Premium ($79/mo) plans unlock featured placement, lead capture, and analytics.",
};

type Tier = {
  name: string;
  price: string;
  period: string;
  tagline: string;
  cta: string;
  featured?: boolean;
  features: { included: boolean; text: string }[];
};

const tiers: Tier[] = [
  {
    name: "Basic",
    price: "Free",
    period: "forever",
    tagline: "Get found on SmileFinder at no cost.",
    cta: "Claim Your Listing",\n    link: "/claim",
    features: [
      { included: true, text: "Standard directory listing" },
      { included: true, text: "Practice name, address, phone" },
      { included: true, text: "Single specialty tag" },
      { included: true, text: "Appears in city & state search" },
      { included: false, text: "Featured placement" },
      { included: false, text: "Lead capture form" },
      { included: false, text: "Multiple photos" },
      { included: false, text: "Analytics dashboard" },
    ],
  },
  {
    name: "Professional",
    price: "$29",
    period: "per month",
    tagline: "Stand out and convert more visitors into patients.",
    cta: "Start Professional",
    featured: true,
    features: [
      { included: true, text: "Everything in Basic" },
      { included: true, text: "Featured placement in city results" },
      { included: true, text: "Full bio + education + languages" },
      { included: true, text: "Up to 5 specialty tags" },
      { included: true, text: "Patient lead capture form" },
      { included: true, text: "Office hours & insurance list" },
      { included: true, text: "Monthly performance email" },
      { included: false, text: "Top-of-page premium placement" },
    ],
  },
  {
    name: "Premium",
    price: "$79",
    period: "per month",
    tagline: "Maximum visibility across our entire directory.",
    cta: "Go Premium Plus",\n    link: "https://buy.stripe.com/dR614meqt6KbellfqMaZi01",
    features: [
      { included: true, text: "Everything in Professional" },
      { included: true, text: "Top-of-page premium placement" },
      { included: true, text: "Homepage spotlight rotation" },
      { included: true, text: "Photo gallery (up to 12 images)" },
      { included: true, text: "Real-time analytics dashboard" },
      { included: true, text: "Priority customer support" },
      { included: true, text: "Featured in blog & newsletter" },
      { included: true, text: "Verified Premium badge" },
    ],
  },
];

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5 shrink-0 text-blue-600"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5A1 1 0 014.7 8.1L8.6 12 15.3 5.3a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Dash() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5 shrink-0 text-slate-300"
      aria-hidden
    >
      <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <div className="bg-slate-50">
      <section className="border-b border-blue-100 bg-gradient-to-br from-blue-600 to-blue-800 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-white/20">
            For Dental Practices
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Start free. Upgrade when you're ready to grow. No long-term contracts — cancel anytime.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm ${
                t.featured
                  ? "border-blue-600 shadow-xl ring-2 ring-blue-600"
                  : "border-blue-100"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                  Most Popular
                </span>
              )}
              <h2 className="text-2xl font-bold text-slate-900">{t.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{t.tagline}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-slate-900">{t.price}</span>
                <span className="text-sm text-slate-500">/ {t.period}</span>
              </div>
              <Link
                href={t.link}
                className={`mt-6 block rounded-lg px-4 py-3 text-center text-sm font-semibold shadow-sm transition ${
                  t.featured
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                {t.cta}
              </Link>
              <ul className="mt-8 space-y-3">
                {t.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-3 text-sm">
                    {f.included ? <Check /> : <Dash />}
                    <span className={f.included ? "text-slate-700" : "text-slate-400"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Frequently asked questions
          </h2>
          <dl className="mt-8 space-y-6">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes. Paid plans are month-to-month. Cancel and your listing reverts to the Basic tier — your profile stays online, you just lose paid features.",
              },
              {
                q: "Do you charge per lead?",
                a: "No. We're a flat monthly subscription, never per-lead or per-click. The leads your listing generates are yours.",
              },
              {
                q: "How fast does my listing go live?",
                a: "Once submitted, listings are typically reviewed and published within one business day.",
              },
              {
                q: "Can I list multiple practice locations?",
                a: "Yes. Premium subscriptions include up to three locations. Contact us for multi-location practices with more than three offices.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm"
              >
                <dt className="font-semibold text-slate-900">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-700">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
