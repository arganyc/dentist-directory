"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SliderField, { type FieldConfig, clamp, formatCurrency } from "@/components/tools/SliderField";
import {
  calculateStaffCostRatio,
  staffCostRatioInitialInputs,
  STAFF_COST_RATIO_BENCHMARK_HIGH,
  STAFF_COST_RATIO_BENCHMARK_LOW,
  type StaffCostRatioCalculatorInputs,
} from "@/lib/calculators/staff-cost-ratio";

const fields: FieldConfig<keyof StaffCostRatioCalculatorInputs>[] = [
  { key: "monthlyCollections", label: "Monthly collections", prefix: "$", min: 10000, max: 200000, step: 1000 },
  { key: "totalStaffPayroll", label: "Total staff payroll & benefits (excl. owner-dentist)", prefix: "$", min: 2000, max: 80000, step: 500 },
  { key: "fteStaffCount", label: "Number of FTE staff (excl. owner-dentist)", min: 1, max: 25, step: 1 },
];

export default function StaffCostRatioCalculator() {
  const [inputs, setInputs] = useState<StaffCostRatioCalculatorInputs>(
    staffCostRatioInitialInputs
  );

  const results = useMemo(() => calculateStaffCostRatio(inputs), [inputs]);

  function updateInput(
    key: keyof StaffCostRatioCalculatorInputs,
    rawValue: string,
    field: FieldConfig<keyof StaffCostRatioCalculatorInputs>
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
            <h2 className="text-2xl font-bold text-slate-900">Estimate staff cost ratio</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Payroll includes wages, payroll tax, and benefits for hygienists, assistants, and front office.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInputs(staffCostRatioInitialInputs)}
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
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">Staff cost ratio</p>
          <div className="mt-3 text-5xl font-extrabold tracking-tight">{results.staffCostRatio.toFixed(1)}%</div>
          <p className="mt-3 text-sm leading-relaxed text-blue-100">
            Healthy range is typically {STAFF_COST_RATIO_BENCHMARK_LOW}-{STAFF_COST_RATIO_BENCHMARK_HIGH}% of collections. You&apos;re{" "}
            <span className="font-semibold text-white">{results.vsBenchmark}</span> that range.
          </p>
          <div className="mt-6 rounded-md bg-white/10 p-3 ring-1 ring-white/15">
            <p className="text-xs text-blue-100">Payroll per FTE / mo</p>
            <p className="mt-1 text-xl font-bold">{formatCurrency(results.payrollPerFte)}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Annualized</h2>
          <div className="mt-4 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
            <span className="text-sm font-semibold text-slate-700">Staff payroll / yr</span>
            <span className="text-sm font-bold text-blue-700">{formatCurrency(results.annualPayroll)}</span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Running above benchmark isn&apos;t automatically a problem if production per staff hour
            is also above average — check this alongside your hygiene production numbers before
            changing staffing levels.
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
