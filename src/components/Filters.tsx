"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { allCities, allSpecialties, allStates } from "@/lib/dentists";

export default function Filters() {
  const router = useRouter();
  const params = useSearchParams();

  const state = params.get("state") ?? "";
  const city = params.get("city") ?? "";
  const specialty = params.get("specialty") ?? "";
  const accepting = params.get("accepting") === "true";
  const location = params.get("location") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(params.toString());
      if (value) sp.set(key, value);
      else sp.delete(key);
      router.push(`/dentists${sp.toString() ? `?${sp.toString()}` : ""}`);
    },
    [params, router]
  );

  const clear = () => router.push("/dentists");
  const hasFilters = state || city || specialty || accepting || location;

  return (
    <aside className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>

      {location && (
        <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-900">
          Searching near <span className="font-semibold">{location}</span>{" "}
          <button
            type="button"
            className="ml-1 font-semibold underline"
            onClick={() => updateParam("location", "")}
          >
            remove
          </button>
        </div>
      )}

      <div className="mt-5 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            State
          </label>
          <select
            value={state}
            onChange={(e) => updateParam("state", e.target.value)}
            className="mt-1.5 block w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All states</option>
            {allStates.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            City
          </label>
          <select
            value={city}
            onChange={(e) => updateParam("city", e.target.value)}
            className="mt-1.5 block w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All cities</option>
            {allCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Specialty
          </label>
          <select
            value={specialty}
            onChange={(e) => updateParam("specialty", e.target.value)}
            className="mt-1.5 block w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All specialties</option>
            {allSpecialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-50/60 px-3 py-2 ring-1 ring-blue-100">
          <input
            type="checkbox"
            checked={accepting}
            onChange={(e) => updateParam("accepting", e.target.checked ? "true" : "")}
            className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-800">Accepting new patients only</span>
        </label>
      </div>
    </aside>
  );
}
