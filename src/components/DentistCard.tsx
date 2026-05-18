import Link from "next/link";
import type { Dentist } from "@/lib/dentists";
import Rating from "./Rating";

export default function DentistCard({ dentist }: { dentist: Dentist }) {
  return (
    <Link
      href={`/dentists/${dentist.slug}`}
      className="group block overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
    >
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
          <div className="mt-3">
            <Rating value={dentist.rating} count={dentist.reviewCount} />
          </div>
        </div>
      </div>
    </Link>
  );
}
