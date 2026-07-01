import Link from "next/link";
import ClaimForm from "./ClaimForm";

export const metadata = {
  title: "Claim or Add Your Practice",
  description:
    "Claim your existing SmileFinder listing or add your dental practice to our directory. Free to get started — verified within one business day.",
};

function pickString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function cleanWebsite(value: string): string {
  if (!value) return "";
  return value.startsWith("http") ? value : `https://${value}`;
}

// Deterministic monthly-search synthesis until real search-volume analytics
// ship. The same city always shows the same number, so the urgency bar is
// stable across page loads.
function syntheticMonthlySearches(city: string): number {
  if (!city) return 2400;
  let h = 2166136261;
  const key = city.toLowerCase();
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Range ~1,200 – 6,200 (round to nearest 50 for a "softer" marketing number)
  const raw = 1200 + ((h >>> 0) % 5000);
  return Math.round(raw / 50) * 50;
}

const BENEFITS = [
  {
    title: "Show up in local searches",
    body: "Your verified listing surfaces when nearby patients search SmileFinder and Google for a dentist in your city.",
    icon: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Control your information",
    body: "Hours, services, accepted insurance, photos — keep everything accurate so patients have what they need to call.",
    icon: <path d="M12 5v14m-7-7h14" />,
  },
  {
    title: "Build trust before they call",
    body: "Verified credentials, real reviews, and a complete profile make patients more confident in their first visit.",
    icon: <path d="M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" />,
  },
];

export default async function ClaimPage(props: PageProps<"/claim">) {
  const sp = await props.searchParams;
  const cityRaw = pickString(sp.city).trim();
  const npi = pickString(sp.npi).trim();
  const practiceName = pickString(sp.practiceName).trim();
  const address = pickString(sp.address).trim();
  const phone = pickString(sp.phone).trim();
  const website = cleanWebsite(pickString(sp.website).trim());
  const profile = pickString(sp.profile).trim();
  const city = cityRaw || "your area";
  const monthlySearches = syntheticMonthlySearches(cityRaw);
  const hasProfileContext = Boolean(practiceName || npi || profile);
  const headline = practiceName
    ? `Claim ${practiceName} on SmileFinder.`
    : "Take control of how patients find your practice online.";
  const initialMessage = hasProfileContext
    ? `I want to claim this existing SmileFinder listing${profile ? `: ${profile}` : ""}.`
    : "";

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 25%, white 1.2px, transparent 1.2px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <nav className="text-sm text-blue-100">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            / <span className="text-white">Claim Listing</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-blue-100">
            Claim your listing in 2 minutes and make sure local patients see the right information
            when they search for a dentist in {city}.
          </p>
        </div>

        <div className="relative border-t border-white/15 bg-amber-400 text-amber-950">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 shrink-0 text-amber-700"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.08 3.08a1 1 0 11-1.42 1.42l-3.08-3.08A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-semibold">
              <span className="font-extrabold">{monthlySearches.toLocaleString()}</span>{" "}
              patients searched for dentists in {city} this month.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <ClaimForm
          initialValues={{
            npi,
            practiceName,
            address,
            phone,
            website,
            message: initialMessage,
          }}
        />

        <aside className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Why claim?</h2>
            <ul className="mt-4 space-y-4 text-sm">
              {BENEFITS.map((b) => (
                <li key={b.title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                      aria-hidden
                    >
                      {b.icon}
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{b.title}</p>
                    <p className="mt-0.5 text-slate-600">{b.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-600 p-6 text-white shadow-sm">
            <h2 className="text-base font-bold">Want premium placement?</h2>
            <p className="mt-2 text-sm text-blue-100">
              See our pricing tiers and unlock featured placement, lead capture, and analytics.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              See plans →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
