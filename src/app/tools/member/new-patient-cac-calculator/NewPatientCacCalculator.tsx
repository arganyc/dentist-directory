"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SliderField, { type FieldConfig, clamp, formatCurrency } from "@/components/tools/SliderField";

type Inputs = {
  monthlyMarketingSpend: number;
  newPatientsPerMonth: number;
  avgAnnualPatientValue: number;
  avgRetentionYears: number;
};

const fields: FieldConfig<keyof Inputs>[] = [
  { key: "monthlyMarketingSpend", label: "Monthly marketing spend", prefix: "$", min: 200, max: 20000, step: 100 },
  { key: "newPatientsPerMonth", label: "New patients per month", min: 1, max: 60, step: 1 },
  { key: "avgAnnualPatientValue", label: "Average annual value per patient", prefix: "$", min: 300, max: 3000, step: 50 },
  { key: "avgRetentionYears", label: "Average patient retention", suffix: " yrs", min: 1, max: 15, step: 0.5 },
];

const initialInputs: Inputs = {
  monthlyMarketingSpend: 2500,
  newPatientsPerMonth: 14,
  avgAnnualPatientValue: 750,
  avgRetentionYears: 6,
};

export default function NewPatientCacCalculator() {
  const [inputs, setInputs] = useState<Inputs>(initialInputs);

  const results = useMemo(() => {
    const cac = inputs.monthlyMarketingSpend / Math.max(inputs.newPatientsPerMonth, 1);
    const lifetimeValue = inputs.avgAnnualPatientValue * inputs.avgRetentionYears;
    const ltvToCacRatio = lifetimeValue / Math.max(cac, 1);
    const paybackMonths = cac / Math.max(inputs.avgAnnualPatientValue / 12, 1);
    const annualMarketingSpend = inputs.monthlyMarketingSpend * 12;
    const annualNewPatients = inputs.newPatientsPerMonth * 12;
    return { cac, lifetimeValue, ltvToCacRatio, paybackMonths, annualMarketingSpend, annualNewPatients };
  }, [inputs]);

  function updateInput(key: keyof Inputs, rawValue: string, field: FieldConfig<keyof Inputs>) {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) return;
    setInputs((current) => ({ ...current, [key]: clamp(parsed, field.min, field.max) }));
  }

  const healthLabel = results.ltvToCacRatio >= 3 ? "healthy" : results.ltvToCacRatio >= 1.5 ? "workable" : "tight";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 border-b border-blue-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Estimate acquisition cost</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Include all channels in marketing spend — digital ads, directory/SEO placements, mailers, referral incentives.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInputs(initialInputs)}
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
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">Cost per new patient</p>
          <div className="mt-3 text-5xl font-extrabold tracking-tight">{formatCurrency(results.cac)}</div>
          <p className="mt-3 text-sm leading-relaxed text-blue-100">
            Lifetime value to acquisition cost ratio is{" "}
            <span className="font-semibold text-white">{results.ltvToCacRatio.toFixed(1)}x</span> — a{" "}
            {healthLabel} range (3x+ is the common target).
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Patient lifetime value</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(results.lifetimeValue)}</p>
            </div>
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Payback period</p>
              <p className="mt-1 text-xl font-bold">{results.paybackMonths.toFixed(1)} mo</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Annualized</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-sm font-semibold text-slate-700">Marketing spend / yr</span>
              <span className="text-sm font-bold text-blue-700">{formatCurrency(results.annualMarketingSpend)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-sm font-semibold text-slate-700">New patients / yr</span>
              <span className="text-sm font-bold text-blue-700">{results.annualNewPatients.toFixed(0)}</span>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            A verified, complete directory listing is typically one of the lowest-cost channels per
            new patient compared to paid search or social ads.
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
