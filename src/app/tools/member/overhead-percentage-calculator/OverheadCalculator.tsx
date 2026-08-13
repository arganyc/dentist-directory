"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SliderField, { type FieldConfig, clamp, formatCurrency } from "@/components/tools/SliderField";
import {
  calculateOverheadPercentage,
  overheadPercentageInitialInputs,
  OVERHEAD_BENCHMARK_HIGH,
  OVERHEAD_BENCHMARK_LOW,
  type OverheadPercentageCalculatorInputs,
} from "@/lib/calculators/overhead-percentage";

const fields: FieldConfig<keyof OverheadPercentageCalculatorInputs>[] = [
  { key: "monthlyCollections", label: "Monthly collections", prefix: "$", min: 10000, max: 200000, step: 1000 },
  { key: "staffPayroll", label: "Staff payroll & benefits", prefix: "$", min: 2000, max: 80000, step: 500 },
  { key: "facilityRent", label: "Rent / facility costs", prefix: "$", min: 500, max: 25000, step: 250 },
  { key: "labFees", label: "Lab fees", prefix: "$", min: 0, max: 20000, step: 250 },
  { key: "supplies", label: "Supplies & small equipment", prefix: "$", min: 0, max: 15000, step: 250 },
  { key: "otherOverhead", label: "Other overhead (marketing, utilities, insurance, misc.)", prefix: "$", min: 0, max: 20000, step: 250 },
];

export default function OverheadCalculator() {
  const [inputs, setInputs] = useState<OverheadPercentageCalculatorInputs>(
    overheadPercentageInitialInputs
  );

  const results = useMemo(() => calculateOverheadPercentage(inputs), [inputs]);

  function updateInput(
    key: keyof OverheadPercentageCalculatorInputs,
    rawValue: string,
    field: FieldConfig<keyof OverheadPercentageCalculatorInputs>
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
            <h2 className="text-2xl font-bold text-slate-900">Estimate your overhead</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Enter a typical month. Owner-dentist compensation is intentionally excluded — this
              measures operating overhead only.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInputs(overheadPercentageInitialInputs)}
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
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">Overhead percentage</p>
          <div className="mt-3 text-5xl font-extrabold tracking-tight">{results.overheadPct.toFixed(1)}%</div>
          <p className="mt-3 text-sm leading-relaxed text-blue-100">
            Industry benchmark is typically {OVERHEAD_BENCHMARK_LOW}-{OVERHEAD_BENCHMARK_HIGH}%. Your practice is{" "}
            <span className="font-semibold text-white">{results.vsBenchmark}</span> that range.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Total overhead / mo</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(results.totalOverhead)}</p>
            </div>
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Net before owner pay / mo</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(results.netBeforeOwnerPay)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Annualized</h2>
          <div className="mt-4 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
            <span className="text-sm font-semibold text-slate-700">Net before owner pay / yr</span>
            <span className="text-sm font-bold text-blue-700">{formatCurrency(results.annualNet)}</span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Rule of thumb: overhead creeping above 65% usually points to facility costs, staffing
            levels, or lab/supply spend that&apos;s out of proportion to collections — check each
            category against your own historical trend.
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
