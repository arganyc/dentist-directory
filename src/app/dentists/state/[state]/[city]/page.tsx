import Link from "next/link";
import DentistCard from "@/components/DentistCard";
import Filters from "@/components/Filters";
import Pagination from "@/components/Pagination";
import { stateNameByCode, US_STATES } from "@/lib/dentists";
import { getCitiesForState, searchDentists } from "@/lib/dentists-data";

type SearchParams = Record<string, string | string[] | undefined>;

const PER_PAGE = 20;

function pickString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function flatten(params: SearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    const normalized = pickString(value);
    if (normalized && key !== "state" && key !== "city") {
      out[key] = normalized;
    }
  }
  return out;
}

function slugToCity(slug: string): string {
  if (!slug) return "";
  const decoded = decodeURIComponent(slug.replace(/\+/g, " "));
  return decoded.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function codeFromParam(stateParam: string): string | undefined {
  const param = stateParam.trim();
  if (!param) return undefined;
  if (param.length === 2) return param.toUpperCase();
  const normalized = param.replace(/-/g, " ").toLowerCase();
  const found = US_STATES.find((s) => s.name.toLowerCase() === normalized);
  return found?.code;
}

export async function generateMetadata(props: PageProps<"/dentists/state/[state]/[city]">) {
  const params = await props.params;
  const stateParam = params.state ?? "";
  const cityParam = params.city ?? "";
  const stateCode = codeFromParam(stateParam) ?? stateParam.toUpperCase();
  const cityName = slugToCity(cityParam);
  return {
    title: `Find a Dentist in ${cityName}, ${stateCode} | USDentistsDirectory`,
  };
}

export default async function CityDentistsPage(props: PageProps<"/dentists/state/[state]/[city]">) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const stateParam = params.state ?? "";
  const cityParam = params.city ?? "";
  const pageParam = parseInt(pickString(searchParams?.page), 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const stateCode = codeFromParam(stateParam) ?? stateParam.toUpperCase();
  const cities = await getCitiesForState(stateCode);
  const desiredCity = (() => {
    const candidate = slugToCity(cityParam);
    const found = cities.find((c) => c.toLowerCase() === candidate.toLowerCase());
    return found ?? candidate;
  })();

  const [{ results, total, totalPages, page: currentPage }, availableCities] = await Promise.all([
    searchDentists({
      state: stateCode,
      city: desiredCity,
      page,
      perPage: PER_PAGE,
    }),
    getCitiesForState(stateCode),
  ]);

  const startIndex = total === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const endIndex = Math.min(currentPage * PER_PAGE, total);

  return (
    <div className="bg-slate-50">
      <div className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>{" "}/ <Link href="/dentists" className="hover:text-blue-700">Dentists</Link>{" "}/ <span className="text-slate-700">Dentists in {desiredCity}, {stateCode}</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Dentists in {desiredCity}, {stateCode}
          </h1>
          <p className="mt-2 text-slate-600">
            {total === 0 ? (
              <>No dentists found in {desiredCity}, {stateCode}</>
            ) : (
              <>
                Showing <span className="font-semibold text-slate-900">{startIndex.toLocaleString()}</span>–
                <span className="font-semibold text-slate-900">{endIndex.toLocaleString()}</span> of {" "}
                <span className="font-semibold text-slate-900">{total.toLocaleString()}</span> dentists in {desiredCity}, {stateCode}
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
              <p className="mt-2 text-sm text-slate-600">Try a different city or remove filters.</p>
              <Link
                href={`/dentists/${stateParam}`}
                className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Back to {stateCode}
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
                basePath={`/dentists/${stateParam}/${cityParam}`}
                searchParams={flatten(searchParams ?? {})}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
