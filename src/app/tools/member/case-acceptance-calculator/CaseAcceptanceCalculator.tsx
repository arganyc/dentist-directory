"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SliderField, { type FieldConfig, clamp, formatCurrency, formatNumber } from "@/components/tools/SliderField";
import {
  calculateCaseAcceptance,
  caseAcceptanceInitialInputs,
  type CaseAcceptanceCalculatorInputs,
} from "@/lib/calculators/case-acceptance";

const fields: FieldConfig<keyof CaseAcceptanceCalculatorInputs>[] = [
  { key: "plansPresentedPerMonth", label: "Treatment plans presented per month", min: 5, max: 150, step: 1 },
  { key: "averageCaseValue", label: "Average case value", prefix: "$", min: 200, max: 8000, step: 50 },
  { key: "currentAcceptanceRate", label: "Current acceptance rate", suffix: "%", min: 10, max: 90, step: 1 },
  { key: "targetAcceptanceRate", label: "Target acceptance rate", suffix: "%", min: 10, max: 95, step: 1 },
];

export default function CaseAcceptanceCalculator() {
  const [inputs, setInputs] = useState<CaseAcceptanceCalculatorInputs>(caseAcceptanceInitialInputs);

  const results = useMemo(() => calculateCaseAcceptance(inputs), [inputs]);

  function updateInput(
    key: keyof CaseAcceptanceCalculatorInputs,
    rawValue: string,
    field: FieldConfig<keyof CaseAcceptanceCalculatorInputs>
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
            <h2 className="text-2xl font-bold text-slate-900">Estimate unaccepted treatment value</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Use your case-presentation log from a normal month, not your best month.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInputs(caseAcceptanceInitialInputs)}
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
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">Unaccepted case value / yr</p>
          <div className="mt-3 text-5xl font-extrabold tracking-tight">{formatCurrency(results.lostValueAnnual)}</div>
          <p className="mt-3 text-sm leading-relaxed text-blue-100">
            {formatNumber(results.unacceptedCases)} plans/month go unaccepted at your current rate.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Unaccepted / mo</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(results.lostValueMonthly)}</p>
            </div>
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Accepted value / mo</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(results.acceptedValue)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Reaching your target rate</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-sm font-semibold text-slate-700">Extra value / mo</span>
              <span className="text-sm font-bold text-blue-700">{formatCurrency(results.upliftMonthly)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-sm font-semibold text-slate-700">Extra value / yr</span>
              <span className="text-sm font-bold text-blue-700">{formatCurrency(results.upliftAnnual)}</span>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Common levers: same-visit financing options, a case-presenter who isn&apos;t the treating
            doctor, and a structured follow-up call within 48 hours of an unaccepted plan.
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
