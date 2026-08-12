"use client";

import { useMemo, useState } from "react";

import {
  CalculatorActions,
  CalculatorSection,
  CalculatorShell,
  ClaimListingCTA,
  CurrencyInput,
  formatCalculatorCurrency,
  formatCalculatorNumber,
  InsightCard,
  NumberInput,
  PercentageInput,
  PrintButton,
  RecommendationCard,
  ResultCard,
  ResultsGrid,
  ShareButton,
  SliderInput,
  WarningCard,
} from "@/components/calculator-framework";
import {
  calculateNoShowCost,
  getNoShowCostRecommendations,
  noShowCostCalculatorInitialInputs,
  type NoShowCostCalculatorInputs,
} from "@/lib/calculators/no-show-cost";

type FieldConfig = {
  key: keyof NoShowCostCalculatorInputs;
  label: string;
  inputType: "currency" | "number" | "percentage" | "slider";
  min: number;
  max: number;
  step: number;
  suffix?: string;
  helperText?: string;
};

const fields: FieldConfig[] = [
  {
    key: "averageProduction",
    label: "Average production per missed visit",
    inputType: "currency",
    min: 100,
    max: 2500,
    step: 25,
  },
  {
    key: "cancellationsPerWeek",
    label: "Cancellations per week",
    inputType: "number",
    min: 0,
    max: 40,
    step: 1,
  },
  {
    key: "noShowsPerWeek",
    label: "No-shows per week",
    inputType: "number",
    min: 0,
    max: 30,
    step: 1,
  },
  {
    key: "rebookingRate",
    label: "Cancellation rebooking rate",
    inputType: "percentage",
    min: 0,
    max: 100,
    step: 5,
    helperText: "Use the share of cancelled appointments that are filled again.",
  },
  {
    key: "chairHoursPerVisit",
    label: "Open chair hours per missed visit",
    inputType: "slider",
    min: 0.25,
    max: 4,
    step: 0.25,
    suffix: " hrs",
  },
  {
    key: "workingWeeks",
    label: "Working weeks per year",
    inputType: "number",
    min: 35,
    max: 52,
    step: 1,
  },
  {
    key: "hygieneVisitValue",
    label: "Typical hygiene visit value",
    inputType: "currency",
    min: 75,
    max: 750,
    step: 25,
  },
  {
    key: "treatmentVisitValue",
    label: "Typical treatment visit value",
    inputType: "currency",
    min: 250,
    max: 5000,
    step: 50,
  },
  {
    key: "newPatientValue",
    label: "Estimated annual value of one new patient",
    inputType: "currency",
    min: 250,
    max: 5000,
    step: 50,
  },
];

export default function NoShowCostCalculatorWorkspace() {
  const [inputs, setInputs] = useState<NoShowCostCalculatorInputs>(noShowCostCalculatorInitialInputs);
  const results = useMemo(() => calculateNoShowCost(inputs), [inputs]);
  const recommendations = useMemo(
    () => getNoShowCostRecommendations(inputs, results),
    [inputs, results]
  );

  function updateInput(key: keyof NoShowCostCalculatorInputs, value: number, field: FieldConfig) {
    if (Number.isNaN(value)) return;
    setInputs((current) => ({
      ...current,
      [key]: clamp(value, field.min, field.max),
    }));
  }

  return (
    <div className="space-y-8">
      <CalculatorShell
        title="Calculate missed-appointment cost"
        description="Model the production impact of cancellations, no-shows, unfilled chair time, and realistic recovery targets."
        sidebar={
          <>
            <ResultCard
              label="Estimated annual loss"
              value={formatCalculatorCurrency(results.annualLoss)}
              description="Based on unrecovered cancellations, no-shows, and open chair time."
              tone="primary"
            />
            <ResultsGrid>
              <ResultCard label="Monthly loss" value={formatCalculatorCurrency(results.monthlyLoss)} />
              <ResultCard label="Weekly loss" value={formatCalculatorCurrency(results.weeklyLoss)} />
              <ResultCard label="Chair hours/year" value={formatCalculatorNumber(results.annualChairHours)} />
              <ResultCard label="Patients to offset" value={results.newPatientsToOffset} />
            </ResultsGrid>
            <ClaimListingCTA
              href="/claim?source=no-show-cost-calculator"
              description="A complete profile helps nearby patients find you when cancellations create same-day openings."
              label="Claim your listing"
            />
          </>
        }
      >
        <CalculatorSection
          title="Practice inputs"
          description="Start with the defaults, then adjust the numbers to match a normal week at your practice."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => (
              <InputForField
                key={field.key}
                field={field}
                value={inputs[field.key]}
                onChange={(value) => updateInput(field.key, value, field)}
              />
            ))}
          </div>
        </CalculatorSection>

        <CalculatorSection title="Recovery scenarios">
          <ResultsGrid>
            <ResultCard label="Recover 25%" value={`${formatCalculatorCurrency(results.recovered25)}/yr`} tone="success" />
            <ResultCard label="Recover 50%" value={`${formatCalculatorCurrency(results.recovered50)}/yr`} tone="success" />
            <ResultCard label="Recover 75%" value={`${formatCalculatorCurrency(results.recovered75)}/yr`} tone="success" />
            <ResultCard
              label="Treatment value at risk"
              value={formatCalculatorCurrency(results.treatmentAtRisk)}
            />
          </ResultsGrid>
        </CalculatorSection>

        <CalculatorSection title="Actions">
          <CalculatorActions>
            <button
              type="button"
              onClick={() => setInputs(noShowCostCalculatorInitialInputs)}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-800"
            >
              Reset calculator
            </button>
            <PrintButton label="Print estimate" />
            <ShareButton label="Copy tool link" />
            <button
              type="button"
              aria-disabled="true"
              className="inline-flex items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2.5 text-sm font-bold text-cyan-800"
            >
              Save to DentistOS
            </button>
          </CalculatorActions>
        </CalculatorSection>
      </CalculatorShell>

      <CalculatorSection
        title="Actionable recommendations"
        description="Use the estimate as a planning starting point, then track whether operational changes improve booked production."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.slice(0, 4).map((recommendation) => (
            <RecommendationCard key={recommendation.title} title={recommendation.title}>
              {recommendation.description}
            </RecommendationCard>
          ))}
        </div>
      </CalculatorSection>

      <div className="grid gap-4 md:grid-cols-2">
        <InsightCard title="Future DentistOS report saving">
          This calculator does not persist results yet. A future DentistOS workspace can save baseline
          reports, compare monthly trends, and connect recommendations to a linked practice.
        </InsightCard>
        <WarningCard title="Estimate only">
          This tool is for business planning. It does not replace bookkeeping, tax, legal, financial,
          or clinical advice.
        </WarningCard>
      </div>
    </div>
  );
}

function InputForField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: number;
  onChange: (value: number) => void;
}) {
  const props = {
    id: `no-show-${field.key}`,
    label: field.label,
    value,
    onChange,
    min: field.min,
    max: field.max,
    step: field.step,
    helperText: field.helperText,
  };

  if (field.inputType === "currency") return <CurrencyInput {...props} />;
  if (field.inputType === "percentage") return <PercentageInput {...props} />;
  if (field.inputType === "slider") return <SliderInput {...props} suffix={field.suffix} />;
  return <NumberInput {...props} />;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
