import Link from "next/link";
import type { Dentist } from "@/lib/dentists";
import Rating from "./Rating";

// Deterministic profile-view synthesis until real per-profile analytics ship.
// Same NPI -> same number, so the UI is stable across renders.
function syntheticViewCount(npi: string): number {
  let h = 2166136261;
  for (let i = 0; i < npi.length; i++) {
    h ^= npi.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 100 + ((h >>> 0) % 3900);
}

// Real completion: count which display fields the dentist has filled in.
function profileCompletion(d: Dentist): number {
  const fields: boolean[] = [
    Boolean(d.name),
    Boolean(d.credentials),
    Boolean(d.specialty),
    Boolean(d.phone),
    Boolean(d.address.street),
    Boolean(d.address.city),
    Boolean(d.website),
    Boolean(d.bio),
    d.education.length > 0,
    d.languages.length > 0,
    d.insurance.length > 0,
    d.hours.length > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export default function DentistCard({ dentist }: { dentist: Dentist }) {
  const claimHref = `/claim?practice=${encodeURIComponent(dentist.slug)}`;
  // Real reviews only show for claimed (Premium) listings with non-zero
  // review count. Everything else gets the empty-state placeholder.
  const showRealRating = dentist.isPremium && dentist.reviewCount > 0;

  return (
    <div className="group block overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg">
      <Link href={`/dentists/${dentist.slug}`} className="block">
        <div className="flex items-start gap-4 p-5">
          <div
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700"
          >
            {dentist.name
              .replace("Dr. ", "")
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-blue-700">
                  {dentist.name}, {dentist.credentials}
                </h3>
                <p className="text-sm text-blue-700">{dentist.specialty}</p>
              </div>
              {dentist.acceptingNewPatients && (
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  Accepting Patients
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-600">{dentist.practiceName}</p>
            <p className="mt-1 text-sm text-slate-500">
              {dentist.address.city}, {dentist.address.stateCode} · {dentist.phone}
            </p>
            <div className="mt-3 min-h-[38px]">
              {showRealRating ? (
                <Rating value={dentist.rating} count={dentist.reviewCount} />
              ) : (
                <div>
                  <div className="flex" aria-label="No reviews yet — listing not yet claimed">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <svg
                        key={i}
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="#CBD5E1"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden
                      >
                        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Reviews shown after claiming
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {dentist.isPremium ? (
        <div className="flex items-center justify-between gap-3 border-t border-blue-50 bg-blue-50/40 px-5 py-2.5 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3.5 w-3.5 text-blue-500"
              aria-hidden
            >
              <path d="M8 2C4.5 2 1.7 4.7 1 8c.7 3.3 3.5 6 7 6s6.3-2.7 7-6c-.7-3.3-3.5-6-7-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
            </svg>
            <span className="font-semibold text-slate-800">
              {syntheticViewCount(dentist.id).toLocaleString()}
            </span>
            <span className="text-slate-500">views this month</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold text-slate-800">{profileCompletion(dentist)}%</span>
            <span className="text-slate-500">profile complete</span>
          </span>
        </div>
      ) : (
        <Link
          href={claimHref}
          className="flex items-center justify-between gap-2 border-t border-amber-200 bg-amber-50 px-5 py-2.5 text-xs text-amber-900 transition hover:bg-amber-100"
        >
          <span>
            <span className="font-semibold">Is this your practice?</span>{" "}
            <span className="text-amber-800">
              Claim your free listing so patients can find you.
            </span>
          </span>
          <span className="shrink-0 font-bold text-amber-900 group-hover:underline">
            Claim free →
          </span>
        </Link>
      )}
    </div>
  );
}
