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
  PrintButton,
  RecommendationCard,
  ResultCard,
  ResultsGrid,
  ShareButton,
  WarningCard,
} from "@/components/calculator-framework";
import {
  calculatePatientAcquisitionCost,
  getPatientAcquisitionCostRecommendations,
  patientAcquisitionCostInitialInputs,
  type PatientAcquisitionCostCalculatorInputs,
} from "@/lib/calculators/patient-acquisition-cost";

type FieldConfig = {
  key: keyof PatientAcquisitionCostCalculatorInputs;
  label: string;
  inputType: "currency" | "number";
  min: number;
  max: number;
  step: number;
  suffix?: string;
  helperText?: string;
};

const fields: FieldConfig[] = [
  {
    key: "monthlyMarketingSpend",
    label: "Monthly marketing spend",
    inputType: "currency",
    min: 0,
    max: 20000,
    step: 100,
    helperText: "Include ads, SEO, directory placement, mailers, referral programs, and agency fees.",
  },
  {
    key: "newPatientsPerMonth",
    label: "New patients per month",
    inputType: "number",
    min: 0,
    max: 60,
    step: 1,
  },
  {
    key: "avgAnnualPatientValue",
    label: "Average annual value per patient",
    inputType: "currency",
    min: 0,
    max: 3000,
    step: 50,
  },
  {
    key: "avgRetentionYears",
    label: "Average patient retention",
    inputType: "number",
    min: 0,
    max: 15,
    step: 0.5,
    suffix: " yrs",
  },
];

export default function PatientAcquisitionCostCalculatorWorkspace() {
  const [inputs, setInputs] = useState<PatientAcquisitionCostCalculatorInputs>(
    patientAcquisitionCostInitialInputs
  );
  const results = useMemo(() => calculatePatientAcquisitionCost(inputs), [inputs]);
  const recommendations = useMemo(
    () => getPatientAcquisitionCostRecommendations(inputs, results),
    [inputs, results]
  );

  function updateInput(
    key: keyof PatientAcquisitionCostCalculatorInputs,
    value: number,
    field: FieldConfig
  ) {
    if (Number.isNaN(value)) return;
    setInputs((current) => ({
      ...current,
      [key]: clamp(value, field.min, field.max),
    }));
  }

  return (
    <div className="space-y-8">
      <CalculatorShell
        title="Calculate patient acquisition cost"
        description="Estimate how much it costs to acquire each new patient, then compare that cost against lifetime value and payback period."
        sidebar={
          <>
            <ResultCard
              label="Cost per new patient"
              value={formatCalculatorCurrency(results.cac)}
              description={`Modeled LTV:CAC ratio is ${formatCalculatorNumber(results.ltvToCacRatio)}x, a ${results.healthLabel} range.`}
              tone="primary"
            />
            <ResultsGrid>
              <ResultCard label="Lifetime value" value={formatCalculatorCurrency(results.lifetimeValue)} />
              <ResultCard label="Payback period" value={`${formatCalculatorNumber(results.paybackMonths)} mo`} />
              <ResultCard label="Annual spend" value={formatCalculatorCurrency(results.annualMarketingSpend)} />
              <ResultCard label="Annual patients" value={formatCalculatorNumber(results.annualNewPatients)} />
            </ResultsGrid>
            <ClaimListingCTA
              href="/claim?source=patient-acquisition-cost-calculator"
              description="A verified directory listing can be one of the lower-cost patient acquisition channels to measure."
              label="Claim your listing"
            />
          </>
        }
      >
        <CalculatorSection
          title="Marketing and patient inputs"
          description="Use a typical month and include all marketing channels in the spend number."
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

        <CalculatorSection title="Annual implications">
          <ResultsGrid>
            <ResultCard label="Marketing spend/year" value={formatCalculatorCurrency(results.annualMarketingSpend)} />
            <ResultCard label="New patients/year" value={formatCalculatorNumber(results.annualNewPatients)} />
            <ResultCard label="Estimated LTV" value={formatCalculatorCurrency(results.lifetimeValue)} tone="success" />
            <ResultCard label="LTV:CAC ratio" value={`${formatCalculatorNumber(results.ltvToCacRatio)}x`} tone="success" />
          </ResultsGrid>
        </CalculatorSection>

        <CalculatorSection title="Actions">
          <CalculatorActions>
            <button
              type="button"
              onClick={() => setInputs(patientAcquisitionCostInitialInputs)}
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
        description="Use CAC to compare marketing channels, not just to judge total spending."
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
        <InsightCard title="LTV stays a separate tool">
          This calculator uses estimated lifetime value to interpret CAC. The standalone New Patient
          Lifetime Value workspace remains a separate future Dentist Success Hub product.
        </InsightCard>
        <WarningCard title="Estimate only">
          This tool is for business planning. It does not replace bookkeeping, tax, legal, financial,
          or clinical advice, and results are not saved in this phase.
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
    id: `patient-acquisition-cost-${field.key}`,
    label: field.label,
    value,
    onChange,
    min: field.min,
    max: field.max,
    step: field.step,
    suffix: field.suffix,
    helperText: field.helperText,
  };

  if (field.inputType === "currency") return <CurrencyInput {...props} />;
  return <NumberInput {...props} />;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
