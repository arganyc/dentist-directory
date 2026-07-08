import Link from "next/link";
import CancellationLossCalculator from "./CancellationLossCalculator";

export const metadata = {
  title: "Dental Cancellation Loss Calculator | Free No-Show Cost Tool",
  description:
    "Use this free dental cancellation loss calculator to estimate missed revenue from cancellations, no-shows, and open chair time. Try it now.",
  alternates: {
    canonical: "/tools/dental-cancellation-loss-calculator",
  },
};

const faqs = [
  {
    question: "How much do dental cancellations cost a practice?",
    answer:
      "The cost depends on production per visit, how often patients cancel, how quickly the office rebooks the appointment, and how much open chair time remains unused. This calculator estimates weekly, monthly, and annual impact.",
  },
  {
    question: "What is the difference between a cancellation and a no-show?",
    answer:
      "A cancellation gives the team some notice, which may allow the office to fill the opening. A no-show usually creates a more immediate production gap because the chair time is lost with little or no warning.",
  },
  {
    question: "How can dental offices reduce no-shows?",
    answer:
      "Common tactics include earlier confirmations, same-day reminders, a short-notice waitlist, clear cancellation policies, online scheduling, and consistent follow-up when patients miss appointments.",
  },
  {
    question: "Can local visibility help fill schedule gaps?",
    answer:
      "Yes. A complete website presence, Google Business Profile, and accurate dental directory listing can help nearby patients find the office when they need same-day, emergency, hygiene, or treatment appointments.",
  },
];

export default function DentalCancellationLossCalculatorPage() {
  const pageUrl = "https://www.usdentistsdirectory.com/tools/dental-cancellation-loss-calculator";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Dental Cancellation Loss Calculator",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      url: pageUrl,
      description:
        "A free calculator for dental practices to estimate revenue lost from appointment cancellations, no-shows, and open chair time.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      audience: {
        "@type": "Audience",
        audienceType: "Dentists, dental practice owners, and dental office managers",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
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
            <Link href="/for-dentists" className="hover:text-blue-700">
              For Dentists
            </Link>{" "}
            / <span className="text-slate-700">Dental Cancellation Loss Calculator</span>
          </nav>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                Free practice growth tool
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Dental cancellation loss calculator for missed appointments and no-shows.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
                Estimate how much cancellations, no-shows, and open chair time may cost your dental
                practice each week, month, and year. Then use the recovery scenarios to see what
                even a modest improvement could be worth.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#calculator"
                  className="rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  Use the free calculator
                </a>
                <Link
                  href="/for-dentists/google-business-profile-strategy"
                  className="rounded-md border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
                >
                  Improve local visibility
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-lg font-bold text-slate-900">Why practices use it</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>Show the true annual cost of missed appointments.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>Compare recovery scenarios before changing policy.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>Connect schedule gaps to new patient demand.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section id="calculator" className="scroll-mt-24">
          <CancellationLossCalculator />
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              How to use the dental cancellation loss estimate
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Run the baseline",
                  body: "Enter a normal week, not your worst week. The baseline gives your team a realistic starting point.",
                },
                {
                  title: "Pick one recovery target",
                  body: "Start with 25% recovery. That is often more believable than trying to eliminate every missed visit.",
                },
                {
                  title: "Review monthly",
                  body: "Track cancellations, no-shows, rebooking rate, and filled short-notice openings every month.",
                },
              ].map((step) => (
                <div key={step.title} className="rounded-lg bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Pair operations with demand</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Reducing cancellations protects production. Improving local visibility helps fill
              schedule gaps when patients need a dentist now.
            </p>
            <div className="mt-5 space-y-3">
              <Link
                href="/claim?source=cancellation-calculator-guide"
                className="block rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
              >
                Claim your free listing
              </Link>
              <Link
                href="/for-dentists"
                className="block rounded-md border border-blue-200 bg-white px-4 py-3 text-center text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                See dentist growth options
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-lg bg-slate-50 p-5">
                <h3 className="font-bold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
