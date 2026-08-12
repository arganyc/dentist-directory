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
  PercentageInput,
  PrintButton,
  RecommendationCard,
  ResultCard,
  ResultsGrid,
  ShareButton,
  WarningCard,
} from "@/components/calculator-framework";
import {
  calculatePpoFeeReduction,
  getPpoFeeReductionRecommendations,
  ppoFeeReductionInitialInputs,
  type PpoFeeReductionCalculatorInputs,
} from "@/lib/calculators/ppo-fee-reduction";

type FieldConfig = {
  key: keyof PpoFeeReductionCalculatorInputs;
  label: string;
  inputType: "currency" | "percentage";
  min: number;
  max: number;
  step: number;
  helperText?: string;
};

const fields: FieldConfig[] = [
  {
    key: "monthlyBilledProduction",
    label: "Monthly billed production",
    inputType: "currency",
    min: 0,
    max: 200000,
    step: 1000,
    helperText: "Use full-fee billed production before contractual adjustments or discounts.",
  },
  {
    key: "inNetworkPatientPct",
    label: "In-network patient mix",
    inputType: "percentage",
    min: 0,
    max: 100,
    step: 5,
    helperText: "Estimate the share of production associated with in-network patients.",
  },
  {
    key: "inNetworkAdjustmentPct",
    label: "In-network adjustment",
    inputType: "percentage",
    min: 0,
    max: 100,
    step: 1,
    helperText: "Use the blended contracted adjustment for in-network payer schedules.",
  },
  {
    key: "outNetworkAdjustmentPct",
    label: "Out-of-network adjustment",
    inputType: "percentage",
    min: 0,
    max: 100,
    step: 1,
    helperText: "Include non-PPO courtesy adjustments, discounts, or other expected reductions.",
  },
];

export default function PpoFeeReductionCalculatorWorkspace() {
  const [inputs, setInputs] = useState<PpoFeeReductionCalculatorInputs>(ppoFeeReductionInitialInputs);
  const results = useMemo(() => calculatePpoFeeReduction(inputs), [inputs]);
  const recommendations = useMemo(
    () => getPpoFeeReductionRecommendations(inputs, results),
    [inputs, results]
  );

  function updateInput(key: keyof PpoFeeReductionCalculatorInputs, value: number, field: FieldConfig) {
    if (Number.isNaN(value)) return;
    setInputs((current) => ({
      ...current,
      [key]: clamp(value, field.min, field.max),
    }));
  }

  return (
    <div className="space-y-8">
      <CalculatorShell
        title="Estimate PPO and fee-adjustment impact"
        description="Model how payer mix and contractual adjustments affect billed production, collected production, and annual write-off exposure."
        sidebar={
          <>
            <ResultCard
              label="Monthly write-off"
              value={formatCalculatorCurrency(results.totalWriteOff)}
              description={`${formatCalculatorNumber(results.writeOffPct)}% of modeled billed production is adjusted before collection.`}
              tone="primary"
            />
            <ResultsGrid>
              <ResultCard label="Collected production" value={formatCalculatorCurrency(results.collectedProduction)} />
              <ResultCard label="Annualized impact" value={formatCalculatorCurrency(results.annualWriteOff)} />
              <ResultCard label="In-network write-off" value={formatCalculatorCurrency(results.inNetworkWriteOff)} />
              <ResultCard label="Out-of-network write-off" value={formatCalculatorCurrency(results.outNetworkWriteOff)} />
            </ResultsGrid>
            <ClaimListingCTA
              href="/claim?source=ppo-fee-reduction-calculator"
              description="Claim your profile now so future DentistOS reports can connect financial planning work to your practice workspace."
              label="Claim your listing"
            />
          </>
        }
      >
        <CalculatorSection
          title="Production and payer mix"
          description="Use a typical month and blended adjustment assumptions. Keep payer-specific decisions separate from this planning estimate."
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

        <CalculatorSection title="Network breakdown">
          <ResultsGrid>
            <ResultCard label="In-network billed" value={formatCalculatorCurrency(results.inNetworkBilled)} />
            <ResultCard label="Out-of-network billed" value={formatCalculatorCurrency(results.outNetworkBilled)} />
            <ResultCard label="In-network adjustment" value={formatCalculatorCurrency(results.inNetworkWriteOff)} tone="warning" />
            <ResultCard label="Out-of-network adjustment" value={formatCalculatorCurrency(results.outNetworkWriteOff)} tone="warning" />
          </ResultsGrid>
        </CalculatorSection>

        <CalculatorSection title="Actions">
          <CalculatorActions>
            <button
              type="button"
              onClick={() => setInputs(ppoFeeReductionInitialInputs)}
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
        description="Use this estimate to make cleaner operational reports before reviewing payer-by-payer contracts."
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
        <InsightCard title="PPO impact, not a blanket assumption">
          PPO participation and contractual adjustments can create insurance write-offs, but this
          workspace separates in-network and out-of-network assumptions so every write-off is not
          treated as PPO-caused.
        </InsightCard>
        <WarningCard title="Estimate only">
          This tool is for practice planning. It does not provide legal, accounting, tax,
          payer-contract, or contract-negotiation advice, and results are not saved in this phase.
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
    id: `ppo-fee-reduction-${field.key}`,
    label: field.label,
    value,
    onChange,
    min: field.min,
    max: field.max,
    step: field.step,
    helperText: field.helperText,
  };

  if (field.inputType === "currency") return <CurrencyInput {...props} />;
  return <PercentageInput {...props} />;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
