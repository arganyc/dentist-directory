"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Inputs = {
  averageProduction: number;
  cancellationsPerWeek: number;
  noShowsPerWeek: number;
  rebookingRate: number;
  chairHoursPerVisit: number;
  workingWeeks: number;
  hygieneVisitValue: number;
  treatmentVisitValue: number;
  newPatientValue: number;
};

type FieldConfig = {
  key: keyof Inputs;
  label: string;
  prefix?: string;
  suffix?: string;
  min: number;
  max: number;
  step: number;
};

const fields: FieldConfig[] = [
  {
    key: "averageProduction",
    label: "Average production per missed visit",
    prefix: "$",
    min: 100,
    max: 2500,
    step: 25,
  },
  {
    key: "cancellationsPerWeek",
    label: "Cancellations per week",
    min: 0,
    max: 40,
    step: 1,
  },
  {
    key: "noShowsPerWeek",
    label: "No-shows per week",
    min: 0,
    max: 30,
    step: 1,
  },
  {
    key: "rebookingRate",
    label: "Cancellation rebooking rate",
    suffix: "%",
    min: 0,
    max: 100,
    step: 5,
  },
  {
    key: "chairHoursPerVisit",
    label: "Open chair hours per missed visit",
    suffix: " hrs",
    min: 0.25,
    max: 4,
    step: 0.25,
  },
  {
    key: "workingWeeks",
    label: "Working weeks per year",
    min: 35,
    max: 52,
    step: 1,
  },
  {
    key: "hygieneVisitValue",
    label: "Typical hygiene visit value",
    prefix: "$",
    min: 75,
    max: 750,
    step: 25,
  },
  {
    key: "treatmentVisitValue",
    label: "Typical treatment visit value",
    prefix: "$",
    min: 250,
    max: 5000,
    step: 50,
  },
  {
    key: "newPatientValue",
    label: "Estimated annual value of one new patient",
    prefix: "$",
    min: 250,
    max: 5000,
    step: 50,
  },
];

const initialInputs: Inputs = {
  averageProduction: 525,
  cancellationsPerWeek: 7,
  noShowsPerWeek: 3,
  rebookingRate: 45,
  chairHoursPerVisit: 1,
  workingWeeks: 48,
  hygieneVisitValue: 185,
  treatmentVisitValue: 950,
  newPatientValue: 900,
};

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function number(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function CancellationLossCalculator() {
  const [inputs, setInputs] = useState<Inputs>(initialInputs);

  const results = useMemo(() => {
    const unrecoveredCancellationRate = 1 - inputs.rebookingRate / 100;
    const weeklyCancellationLoss =
      inputs.cancellationsPerWeek * inputs.averageProduction * unrecoveredCancellationRate;
    const weeklyNoShowLoss = inputs.noShowsPerWeek * inputs.averageProduction;
    const weeklyLoss = weeklyCancellationLoss + weeklyNoShowLoss;
    const annualLoss = weeklyLoss * inputs.workingWeeks;
    const monthlyLoss = annualLoss / 12;
    const missedVisits = inputs.cancellationsPerWeek + inputs.noShowsPerWeek;
    const annualChairHours = missedVisits * inputs.chairHoursPerVisit * inputs.workingWeeks;
    const hygieneAtRisk = missedVisits * 0.6 * inputs.hygieneVisitValue * inputs.workingWeeks;
    const treatmentAtRisk = missedVisits * 0.4 * inputs.treatmentVisitValue * inputs.workingWeeks;
    const newPatientsToOffset = Math.ceil(annualLoss / Math.max(inputs.newPatientValue, 1));
    const recovered25 = annualLoss * 0.25;
    const recovered50 = annualLoss * 0.5;
    const recovered75 = annualLoss * 0.75;

    return {
      weeklyLoss,
      monthlyLoss,
      annualLoss,
      missedVisits,
      annualChairHours,
      hygieneAtRisk,
      treatmentAtRisk,
      newPatientsToOffset,
      recovered25,
      recovered50,
      recovered75,
    };
  }, [inputs]);

  function updateInput(key: keyof Inputs, rawValue: string, config: FieldConfig) {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) return;
    setInputs((current) => ({
      ...current,
      [key]: clamp(parsed, config.min, config.max),
    }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 border-b border-blue-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Estimate lost production</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Start with the defaults, then adjust the numbers to match your schedule.
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
            <label key={field.key} className="block">
              <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800">
                <span>{field.label}</span>
                <span className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-blue-700">
                  {field.prefix}
                  {number(inputs[field.key])}
                  {field.suffix}
                </span>
              </span>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={inputs[field.key]}
                onChange={(event) => updateInput(field.key, event.target.value, field)}
                className="mt-3 w-full accent-blue-600"
              />
              <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                {field.prefix ? <span className="text-sm text-slate-500">{field.prefix}</span> : null}
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={inputs[field.key]}
                  onChange={(event) => updateInput(field.key, event.target.value, field)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                />
                {field.suffix ? <span className="text-sm text-slate-500">{field.suffix.trim()}</span> : null}
              </div>
            </label>
          ))}
        </div>
      </section>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-lg bg-blue-700 p-6 text-white shadow-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
            Estimated annual loss
          </p>
          <div className="mt-3 text-5xl font-extrabold tracking-tight">
            {currency(results.annualLoss)}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-blue-100">
            Based on missed visits, unrecovered cancellations, no-shows, and open chair time.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Monthly</p>
              <p className="mt-1 text-xl font-bold">{currency(results.monthlyLoss)}</p>
            </div>
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Weekly</p>
              <p className="mt-1 text-xl font-bold">{currency(results.weeklyLoss)}</p>
            </div>
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Chair hours</p>
              <p className="mt-1 text-xl font-bold">{number(results.annualChairHours)}</p>
            </div>
            <div className="rounded-md bg-white/10 p-3 ring-1 ring-white/15">
              <p className="text-xs text-blue-100">Patients to offset</p>
              <p className="mt-1 text-xl font-bold">{results.newPatientsToOffset}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Revenue recovery scenarios</h2>
          <div className="mt-4 space-y-3">
            {[
              ["Recover 25%", results.recovered25],
              ["Recover 50%", results.recovered50],
              ["Recover 75%", results.recovered75],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <span className="text-sm font-bold text-blue-700">{currency(value as number)}/yr</span>
              </div>
            ))}
          </div>
          <Link
            href="/claim?source=cancellation-calculator"
            className="mt-5 block rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
          >
            Claim your free profile
          </Link>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            A stronger directory profile can help nearby patients find and contact your practice
            when schedule gaps appear.
          </p>
        </div>
      </aside>

      <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              What the numbers suggest
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Turn missed visits into a recovery plan.</h2>
          </div>
          <div className="rounded-lg bg-slate-50 p-5">
            <h3 className="font-bold text-slate-900">1. Protect the next 48 hours</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Keep a short-notice list for patients who can accept hygiene or emergency openings.
              Your current settings show {number(results.missedVisits)} missed visits each week.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-5">
            <h3 className="font-bold text-slate-900">2. Separate hygiene and treatment gaps</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This model estimates {currency(results.hygieneAtRisk)} in hygiene value and{" "}
              {currency(results.treatmentAtRisk)} in treatment value at risk annually.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-5 lg:col-start-2">
            <h3 className="font-bold text-slate-900">3. Improve confirmation timing</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Confirm appointments earlier, then send a same-day reminder. Track whether your
              cancellation rebooking rate rises after two weeks.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-5">
            <h3 className="font-bold text-slate-900">4. Fill demand from local discovery</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              If lost production equals {currency(results.annualLoss)} annually, roughly{" "}
              {results.newPatientsToOffset} new patients at your estimated value could offset it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
