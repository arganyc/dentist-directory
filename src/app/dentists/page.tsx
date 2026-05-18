import Link from "next/link";
import DentistCard from "@/components/DentistCard";
import Filters from "@/components/Filters";
import { dentists } from "@/lib/dentists";

export const metadata = {
  title: "Find a Dentist",
  description:
    "Browse and filter verified US dentists by city, state, and specialty. Read patient reviews and find practices accepting new patients.",
};

function pickString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function DentistsPage(props: PageProps<"/dentists">) {
  const sp = await props.searchParams;

  const state = pickString(sp.state);
  const city = pickString(sp.city);
  const specialty = pickString(sp.specialty);
  const accepting = pickString(sp.accepting) === "true";
  const location = pickString(sp.location).toLowerCase();

  const filtered = dentists.filter((d) => {
    if (state && d.address.stateCode !== state) return false;
    if (city && d.address.city !== city) return false;
    if (specialty && d.specialty !== specialty) return false;
    if (accepting && !d.acceptingNewPatients) return false;
    if (location) {
      const haystack = `${d.address.city} ${d.address.state} ${d.address.stateCode}`.toLowerCase();
      if (!haystack.includes(location)) return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-50">
      <div className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>{" "}
            / <span className="text-slate-700">Find a Dentist</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Find a Dentist
          </h1>
          <p className="mt-2 text-slate-600">
            {filtered.length} {filtered.length === 1 ? "dentist" : "dentists"}{" "}
            {location ? `matching “${location}”` : "available"}
            {state && ` in ${state}`}
            {specialty && ` · ${specialty}`}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <Filters />

        <main>
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-blue-200 bg-white p-12 text-center">
              <h2 className="text-lg font-semibold text-slate-900">No dentists found</h2>
              <p className="mt-2 text-sm text-slate-600">
                Try adjusting your filters or searching a different city or state.
              </p>
              <Link
                href="/dentists"
                className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Reset search
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((d) => (
                <DentistCard key={d.id} dentist={d} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
