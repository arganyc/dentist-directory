"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SliderField, { type FieldConfig, clamp, formatCurrency } from "@/components/tools/SliderField";
import {
  calculateEquipmentRoi,
  equipmentRoiInitialInputs,
  type EquipmentRoiCalculatorInputs,
} from "@/lib/calculators/equipment-roi";

const fields: FieldConfig<keyof EquipmentRoiCalculatorInputs>[] = [
  { key: "equipmentCost", label: "Equipment cost", prefix: "$", min: 2000, max: 150000, step: 500 },
  { key: "monthlyIncrementalRevenue", label: "Estimated added monthly revenue", prefix: "$", min: 200, max: 15000, step: 100 },
  { key: "monthlyOperatingCost", label: "Added monthly operating cost (supplies, maintenance)", prefix: "$", min: 0, max: 3000, step: 50 },
  { key: "financingMonths", label: "Loan term (0 = paid in cash)", suffix: " mo", min: 0, max: 84, step: 6 },
];

export default function EquipmentRoiCalculator() {
  const [inputs, setInputs] = useState<EquipmentRoiCalculatorInputs>(
    equipmentRoiInitialInputs
  );

  const results = useMemo(() => calculateEquipmentRoi(inputs), [inputs]);

  function updateInput(
    key: keyof EquipmentRoiCalculatorInputs,
    rawValue: string,
    field: FieldConfig<keyof EquipmentRoiCalculatorInputs>
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
            <h2 className="text-2xl font-bold text-slate-900">Model the purchase</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Loan payment is a simplified even split over the term (no interest modeled) — use it
              as a directional estimate, not a financing quote.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInputs(equipmentRoiInitialInputs)}
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
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">Break-even</p>
          <div className="mt-3 text-5xl font-extrabold tracking-tight">
            {Number.isFinite(results.breakEvenMonths) ? results.breakEvenMonths.toFixed(1) : "—"} mo
          </div>
          <p className="mt-3 text-sm leading-relaxed text-blue-100">
            Time to recover the equipment cost from added net revenue, before financing.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Net benefit / mo (financed)</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(results.netMonthlyBenefit)}</p>
            </div>
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Est. loan payment / mo</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(results.monthlyLoanPayment)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">5-year outlook</h2>
          <div className="mt-4 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
            <span className="text-sm font-semibold text-slate-700">Net return over 5 years</span>
            <span className="text-sm font-bold text-blue-700">{formatCurrency(results.fiveYearReturn)}</span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Revenue estimates should reflect realistic case volume in year one, not best-case
            utilization — most equipment ramps up gradually as the team gets comfortable presenting it.
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
