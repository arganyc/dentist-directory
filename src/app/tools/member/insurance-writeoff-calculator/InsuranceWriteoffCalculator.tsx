"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SliderField, { type FieldConfig, clamp, formatCurrency } from "@/components/tools/SliderField";
import {
  calculatePpoFeeReduction,
  ppoFeeReductionInitialInputs,
  type PpoFeeReductionCalculatorInputs,
} from "@/lib/calculators/ppo-fee-reduction";

const fields: FieldConfig<keyof PpoFeeReductionCalculatorInputs>[] = [
  { key: "monthlyBilledProduction", label: "Monthly billed production (full fee)", prefix: "$", min: 10000, max: 200000, step: 1000 },
  { key: "inNetworkPatientPct", label: "Share of patients in-network", suffix: "%", min: 0, max: 100, step: 5 },
  { key: "inNetworkAdjustmentPct", label: "Avg. in-network fee adjustment", suffix: "%", min: 10, max: 50, step: 1 },
  { key: "outNetworkAdjustmentPct", label: "Avg. out-of-network adjustment/discount", suffix: "%", min: 0, max: 25, step: 1 },
];

export default function InsuranceWriteoffCalculator() {
  const [inputs, setInputs] = useState<PpoFeeReductionCalculatorInputs>(ppoFeeReductionInitialInputs);

  const results = useMemo(() => calculatePpoFeeReduction(inputs), [inputs]);

  function updateInput(
    key: keyof PpoFeeReductionCalculatorInputs,
    rawValue: string,
    field: FieldConfig<keyof PpoFeeReductionCalculatorInputs>
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
            <h2 className="text-2xl font-bold text-slate-900">Estimate write-offs</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Use blended averages across your top payers — check individual fee schedules for
              a precise per-payer breakdown.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInputs(ppoFeeReductionInitialInputs)}
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
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">Write-off / mo</p>
          <div className="mt-3 text-5xl font-extrabold tracking-tight">{formatCurrency(results.totalWriteOff)}</div>
          <p className="mt-3 text-sm leading-relaxed text-blue-100">
            {results.writeOffPct.toFixed(1)}% of billed production is adjusted off before collection.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">In-network write-off</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(results.inNetworkWriteOff)}</p>
            </div>
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Out-of-network write-off</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(results.outNetworkWriteOff)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Collected production</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-sm font-semibold text-slate-700">Collected / mo</span>
              <span className="text-sm font-bold text-blue-700">{formatCurrency(results.collectedProduction)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-sm font-semibold text-slate-700">Write-off / yr</span>
              <span className="text-sm font-bold text-blue-700">{formatCurrency(results.annualWriteOff)}</span>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            A rising in-network share usually means more predictable volume at a lower per-visit
            yield — worth tracking against your new-patient acquisition cost.
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
