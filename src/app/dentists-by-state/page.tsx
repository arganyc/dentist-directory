import Link from "next/link";
import { stateHubs, slugifyHub } from "@/lib/seo-hubs";

export const metadata = {
  title: "Dentists by State and City",
  description:
    "Browse dentist directory hubs by state, city, and major metro area. Find local dentists, emergency dental care, family dentists, and dental implant providers.",
  alternates: {
    canonical: "/dentists-by-state",
  },
};

export default function DentistsByStatePage() {
  return (
    <div className="bg-slate-50">
      <div className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>{" "}
            / <span className="text-slate-700">Dentists by State</span>
          </nav>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Dentists by State and City
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
            Browse crawl-friendly state and city hubs for local dentist searches. These links help
            patients and search engines move quickly from broad national discovery to useful local
            dentist directories.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stateHubs.map((hub) => {
            const stateSlug = slugifyHub(hub.state);
            return (
              <section
                key={hub.code}
                className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{hub.state}</h2>
                    <p className="mt-1 text-sm text-slate-500">{hub.code} dentist directory</p>
                  </div>
                  <Link
                    href={`/dentists/${stateSlug}`}
                    className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    View state
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {hub.cities.map((city) => (
                    <Link
                      key={`${hub.code}-${city}`}
                      href={`/dentists/${stateSlug}/${slugifyHub(city)}`}
                      className="rounded-full border border-blue-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {city}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
