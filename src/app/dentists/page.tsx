import Link from "next/link";
import DentistCard from "@/components/DentistCard";
import Filters from "@/components/Filters";
import Pagination from "@/components/Pagination";
import { stateNameByCode } from "@/lib/dentists";
import { getCitiesForState, searchDentists } from "@/lib/dentists-data";

const PER_PAGE = 20;

export const metadata = {
  title: "Find a Dentist",
  description:
    "Browse and filter verified US dentists by city, state, and specialty. Read patient reviews and find practices accepting new patients.",
};

function pickString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function flatten(sp: Record<string, string | string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const value = pickString(v);
    if (value) out[k] = value;
  }
  return out;
}

export default async function DentistsPage(props: PageProps<"/dentists">) {
  const sp = await props.searchParams;

  const state = pickString(sp.state);
  const city = pickString(sp.city);
  const specialty = pickString(sp.specialty);
  const accepting = pickString(sp.accepting) === "true";
  const location = pickString(sp.location);
  const pageParam = parseInt(pickString(sp.page), 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [{ results, total, totalPages, page: currentPage }, availableCities] = await Promise.all([
    searchDentists({
      state,
      city,
      specialty,
      acceptingOnly: accepting,
      location,
      page,
      perPage: PER_PAGE,
    }),
    state ? getCitiesForState(state) : Promise.resolve<string[]>([]),
  ]);

  const summaryParts: string[] = [];
  if (location) summaryParts.push(`matching "${location}"`);
  if (state) summaryParts.push(`in ${stateNameByCode(state)}`);
  if (city) summaryParts.push(`in ${city}`);
  if (specialty) summaryParts.push(`· ${specialty}`);
  if (accepting) summaryParts.push("· accepting new patients");
  const summary = summaryParts.length > 0 ? summaryParts.join(" ") : "across the US";

  const startIndex = total === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const endIndex = Math.min(currentPage * PER_PAGE, total);

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
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Find a Dentist</h1>
          <p className="mt-2 text-slate-600">
            {total === 0 ? (
              <>No dentists found {summary}</>
            ) : (
              <>
                Showing <span className="font-semibold text-slate-900">{startIndex.toLocaleString()}</span>–
                <span className="font-semibold text-slate-900">{endIndex.toLocaleString()}</span> of{" "}
                <span className="font-semibold text-slate-900">{total.toLocaleString()}</span>{" "}
                {total === 1 ? "dentist" : "dentists"} {summary}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <Filters availableCities={availableCities} />

        <main>
          {results.length === 0 ? (
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
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {results.map((d) => (
                  <DentistCard key={d.id} dentist={d} />
                ))}
              </div>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                basePath="/dentists"
                searchParams={flatten(sp)}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
