"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SliderField, { type FieldConfig, clamp, formatCurrency, formatNumber } from "@/components/tools/SliderField";
import {
  calculateHygieneProduction,
  hygieneProductionInitialInputs,
  HYGIENE_PRODUCTION_BENCHMARK_HIGH,
  HYGIENE_PRODUCTION_BENCHMARK_LOW,
  type HygieneProductionCalculatorInputs,
} from "@/lib/calculators/hygiene-production";

const fields: FieldConfig<keyof HygieneProductionCalculatorInputs>[] = [
  { key: "visitsPerDay", label: "Hygiene visits per day", min: 4, max: 16, step: 1 },
  { key: "avgProductionPerVisit", label: "Average production per visit", prefix: "$", min: 80, max: 400, step: 10 },
  { key: "chairHoursPerDay", label: "Hygiene chair hours per day", suffix: " hrs", min: 4, max: 10, step: 0.5 },
  { key: "workingDaysPerWeek", label: "Working days per week", min: 3, max: 6, step: 1 },
  { key: "workingWeeksPerYear", label: "Working weeks per year", min: 35, max: 52, step: 1 },
];

export default function HygieneProductionCalculator() {
  const [inputs, setInputs] = useState<HygieneProductionCalculatorInputs>(
    hygieneProductionInitialInputs
  );

  const results = useMemo(() => calculateHygieneProduction(inputs), [inputs]);

  function updateInput(
    key: keyof HygieneProductionCalculatorInputs,
    rawValue: string,
    field: FieldConfig<keyof HygieneProductionCalculatorInputs>
  ) {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) return;
    setInputs((current) => ({ ...current, [key]: clamp(parsed, field.min, field.max) }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 border-b border-blue-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Estimate hygiene production</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Use one hygienist&apos;s typical schedule. Run it again per hygienist if you have more than one.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInputs(hygieneProductionInitialInputs)}
            className="w-full rounded-md border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 sm:w-auto"
          >
            Reset
          </button>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <SliderField key={field.key} field={field} value={inputs[field.key]} onChange={updateInput} />
          ))}
        </div>
      </section>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-lg bg-blue-700 p-6 text-white shadow-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">Production per hour</p>
          <div className="mt-3 text-5xl font-extrabold tracking-tight">{formatCurrency(results.hourlyProduction)}</div>
          <p className="mt-3 text-sm leading-relaxed text-blue-100">
            Common benchmark is ${HYGIENE_PRODUCTION_BENCHMARK_LOW}-${HYGIENE_PRODUCTION_BENCHMARK_HIGH}/hr. You&apos;re{" "}
            <span className="font-semibold text-white">{results.vsBenchmark}</span> that range.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Daily production</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(results.dailyProduction)}</p>
            </div>
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Weekly production</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(results.weeklyProduction)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Annualized</h2>
          <div className="mt-4 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
            <span className="text-sm font-semibold text-slate-700">Annual production</span>
            <span className="text-sm font-bold text-blue-700">{formatCurrency(results.annualProduction)}</span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            If hourly production is below benchmark, check for gaps between visits, short
            recall intervals that undershoot fee schedules, or perio therapy that&apos;s
            under-diagnosed relative to your patient mix. Currently modeling{" "}
            {formatNumber(inputs.visitsPerDay)} visits/day.
          </p>
        </div>

        <Link
          href="/tools/member"
          className="mt-4 block rounded-md border border-blue-200 bg-white px-4 py-3 text-center text-sm font-bold text-blue-700 hover:bg-blue-50"
        >
          ← All member tools
        </Link>
      </aside>
    </div>
  );
}
