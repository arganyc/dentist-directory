"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { allSpecialties, US_STATES } from "@/lib/dentists";

type Props = {
  availableCities: string[];
};

export default function Filters({ availableCities }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const state = params.get("state") ?? "";
  const city = params.get("city") ?? "";
  const specialty = params.get("specialty") ?? "";
  const accepting = params.get("accepting") === "true";
  const location = params.get("location") ?? "";
  const nameParam = params.get("name") ?? "";

  // Local state so typing doesn't push to URL on every keystroke;
  // submits on Enter / blur via the form handler.
  const [nameInput, setNameInput] = useState(nameParam);
  useEffect(() => {
    setNameInput(nameParam);
  }, [nameParam]);

  const update = useCallback(
    (changes: Record<string, string>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) sp.set(key, value);
        else sp.delete(key);
      }
      // Any filter change resets to page 1
      sp.delete("page");
      router.push(`/dentists${sp.toString() ? `?${sp.toString()}` : ""}`);
    },
    [params, router]
  );

  const clear = () => router.push("/dentists");
  const hasFilters = Boolean(state || city || specialty || accepting || location || nameParam);

  const submitName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed === nameParam) return;
    update({ name: trimmed });
  };

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
            onClick={() => update({ location: "" })}
          >
            remove
          </button>
        </div>
      )}

      <div className="mt-5 space-y-5">
        <form onSubmit={submitName}>
          <label
            htmlFor="filter-name"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
          >
            Dentist or practice name
          </label>
          <div className="mt-1.5 flex gap-1.5">
            <div className="relative flex-1">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.08 3.08a1 1 0 11-1.42 1.42l-3.08-3.08A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                id="filter-name"
                type="search"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Smith"
                className="block w-full rounded-md border border-blue-200 bg-white py-2 pl-8 pr-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Go
            </button>
          </div>
          {nameParam && (
            <p className="mt-1.5 text-xs text-slate-500">
              Searching for <span className="font-semibold">{nameParam}</span>{" "}
              <button
                type="button"
                onClick={() => {
                  setNameInput("");
                  update({ name: "" });
                }}
                className="ml-1 font-semibold text-blue-700 hover:underline"
              >
                clear
              </button>
            </p>
          )}
        </form>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            State
          </label>
          <select
            value={state}
            onChange={(e) => update({ state: e.target.value, city: "" })}
            className="mt-1.5 block w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All states</option>
            {US_STATES.map((s) => (
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
            onChange={(e) => update({ city: e.target.value })}
            disabled={!state}
            className="mt-1.5 block w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">
              {state ? `All cities in ${state}` : "Select a state first"}
            </option>
            {availableCities.map((c) => (
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
            onChange={(e) => update({ specialty: e.target.value })}
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
            onChange={(e) => update({ accepting: e.target.checked ? "true" : "" })}
            className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-800">Accepting new patients only</span>
        </label>
      </div>
    </aside>
  );
}
