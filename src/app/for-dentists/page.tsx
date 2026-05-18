import Link from "next/link";

export const metadata = {
  title: "For Dentists — Grow Your Practice",
  description:
    "Reach thousands of patients actively searching for a dentist in your area. List your practice on SmileFinder, capture leads, and grow your patient base.",
};

const BENEFITS = [
  {
    title: "Reach high-intent patients",
    body: "Visitors searching SmileFinder are actively looking for a dentist — not casually browsing. They convert into real appointments at industry-leading rates.",
    icon: (
      <path d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m0 0l5-2.7M12 21l-5-2.7" />
    ),
  },
  {
    title: "Show up in local search",
    body: "Each listing is SEO-optimized for your city and specialty. Patients searching Google for 'dentist in [your city]' find your practice through our directory.",
    icon: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Verified credentials build trust",
    body: "Every listed dentist is NPI-verified, which gives patients confidence to call. Trust is the single biggest predictor of patient conversion.",
    icon: <path d="M12 2l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-4z M9 12l2 2 4-4" />,
  },
  {
    title: "Capture leads on autopilot",
    body: "Professional and Premium plans include a built-in lead form on your listing. Inquiries land directly in your inbox, ready to schedule.",
    icon: <path d="M3 8l9 6 9-6M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8M3 8l9-5 9 5" />,
  },
  {
    title: "Know what's working",
    body: "Premium subscribers get an analytics dashboard showing profile views, click-throughs, and lead sources so you can measure ROI clearly.",
    icon: <path d="M4 19h16M4 19V9m4 10V13m4 6V5m4 14V11m4 8v-4" />,
  },
  {
    title: "No long-term contracts",
    body: "Month-to-month subscriptions, cancel anytime. We earn your business every month — not lock you into a multi-year deal.",
    icon: <path d="M5 12h14M5 12l4-4m-4 4l4 4" />,
  },
];

const STATS = [
  { value: "20+", label: "Verified dentists" },
  { value: "14", label: "Cities covered" },
  { value: "4.8★", label: "Avg. listing rating" },
  { value: "1 day", label: "Verification time" },
];

export default function ForDentistsPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1.2px, transparent 1.2px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-white/20">
                For Dental Practices
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Fill your chairs with the right patients.
              </h1>
              <p className="mt-5 text-lg text-blue-100">
                SmileFinder connects you with thousands of patients searching for a dentist in your
                city, every month. Get listed in minutes — start growing today.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/claim"
                  className="rounded-lg bg-white px-6 py-3 text-base font-bold text-blue-700 shadow-md transition hover:bg-blue-50"
                >
                  Get Listed Free
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-base font-bold text-white transition hover:bg-white/20"
                >
                  See Pricing
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur ring-1 ring-white/20"
                >
                  <div className="text-3xl font-extrabold text-white">{s.value}</div>
                  <div className="mt-1 text-sm text-blue-100">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Built for practices that want to grow
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Listing on SmileFinder is more than a directory entry — it's a complete growth channel
            for your practice.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden
                >
                  {b.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-50/60 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-blue-100 lg:p-14">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  Ready to get listed?
                </h2>
                <p className="mt-3 text-lg text-slate-600">
                  Start with a free Basic listing — no credit card required. Upgrade to Professional
                  or Premium anytime to unlock featured placement and lead capture.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/claim"
                    className="rounded-lg bg-blue-600 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Get Listed Free
                  </Link>
                  <Link
                    href="/pricing"
                    className="rounded-lg border border-blue-200 bg-white px-6 py-3 text-base font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    Compare Plans →
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-16 w-16"
                    aria-hidden
                  >
                    <path d="M12 5.5c-1.5-1.6-3.5-2-5-1.2-2 1-2.6 3.4-2 6 .4 1.6 1 3.4 1.6 5 .5 1.3 1.6 2.2 2.6 2.2 1 0 1.5-.8 2-2 .4-1 .8-1.5 1.3-1.5s.9.5 1.3 1.5c.5 1.2 1 2 2 2 1 0 2.1-.9 2.6-2.2.6-1.6 1.2-3.4 1.6-5 .6-2.6 0-5-2-6-1.5-.8-3.5-.4-5 1.2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
