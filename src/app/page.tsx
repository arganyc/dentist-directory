import Link from "next/link";
import HomeSearch from "@/components/HomeSearch";
import DentistCard from "@/components/DentistCard";
import Newsletter from "@/components/Newsletter";
import { allSpecialties } from "@/lib/dentists";
import { getFeaturedDentists, getTopCities, getTotalDentistCount } from "@/lib/dentists-data";

// Render at request time so the live DB count is always reflected.
// Without this, Next.js statically renders the page at build time and the
// hero count drifts whenever new dentists are added between deploys.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const total = await getTotalDentistCount();
  const formatted = total.toLocaleString("en-US");
  return {
    title: { absolute: "SmileFinder — Find a Dentist in Your City" },
    description: `Browse ${formatted} verified US dentists by city, state, and specialty. Read reviews, compare ratings, and book with practices accepting new patients today.`,
  };
}

const POPULAR_CITIES = [
  { city: "New York", state: "NY" },
  { city: "Los Angeles", state: "CA" },
  { city: "Chicago", state: "IL" },
  { city: "Houston", state: "TX" },
  { city: "Phoenix", state: "AZ" },
  { city: "Boston", state: "MA" },
];

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export default async function Home() {
  const [featured, total, topCities] = await Promise.all([
    getFeaturedDentists(3),
    getTotalDentistCount(),
    getTopCities(12),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px, 80px 80px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-32">
          <span className="inline-block rounded-full bg-blue-500/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-blue-300/40">
            Trusted by patients nationwide
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find the right dentist
            <br />
            <span className="text-blue-200">in your neighborhood</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
            Browse {formatCount(total)} verified dentists across the US. Filter by specialty, read
            reviews, and book with practices accepting new patients today.
          </p>
          <HomeSearch />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-blue-100">
            <span className="opacity-80">Popular:</span>
            {POPULAR_CITIES.map((c) => (
              <Link
                key={`${c.city}-${c.state}`}
                href={`/dentists?location=${encodeURIComponent(c.city)}`}
                className="rounded-full bg-white/10 px-3 py-1 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                {c.city}, {c.state}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Verified Listings",
              desc: `${formatCount(total)} dentists sourced from the official NPI registry. Every record is license-verified.`,
              icon: (
                <path d="M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" />
              ),
            },
            {
              title: "Filter What Matters",
              desc: "Narrow by specialty, location, and whether they're taking new patients. Find the right fit in seconds.",
              icon: <path d="M3 6h18M6 12h12M10 18h4" />,
            },
            {
              title: "Real Patient Reviews",
              desc: "Read ratings from verified patients before you book your next visit.",
              icon: (
                <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
              ),
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 transition hover:border-blue-200 hover:bg-blue-50"
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
                  {f.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Top-Rated Dentists</h2>
            <p className="mt-2 text-slate-600">Our highest-reviewed practices across the country.</p>
          </div>
          <Link
            href="/dentists"
            className="hidden text-sm font-semibold text-blue-700 hover:text-blue-800 sm:block"
          >
            View all →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => (
            <DentistCard key={d.id} dentist={d} />
          ))}
        </div>
      </section>

      <section className="bg-blue-50/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Popular Cities</h2>
              <p className="mt-2 text-slate-600">
                Browse our largest metro dentist directories.
              </p>
            </div>
            <Link
              href="/dentists"
              className="hidden text-sm font-semibold text-blue-700 hover:text-blue-800 sm:block"
            >
              Browse all cities →
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {topCities.map((c) => (
              <Link
                key={`${c.stateCode}-${c.city}`}
                href={`/dentists?state=${c.stateCode}&city=${encodeURIComponent(c.city)}`}
                className="group flex items-center justify-between rounded-xl border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 group-hover:text-blue-700">
                    {c.city}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {c.stateCode}
                  </p>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <p className="text-lg font-bold text-blue-700">
                    {c.total.toLocaleString()}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    dentists
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900">Browse by Specialty</h2>
        <p className="mt-2 text-slate-600">Find a specialist for the care you need.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {allSpecialties.map((s) => (
            <Link
              key={s}
              href={`/dentists?specialty=${encodeURIComponent(s)}`}
              className="rounded-xl border border-blue-100 bg-white p-4 text-center font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
