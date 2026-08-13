"use client";

import { useMemo, useState } from "react";

import {
  CalculatorActionBar,
  CalculatorFieldGrid,
  type CalculatorFieldConfig,
  CalculatorSection,
  CalculatorShell,
  ClaimListingCTA,
  formatCalculatorCurrency,
  formatCalculatorNumber,
  InsightCard,
  RecommendationCard,
  ResultCard,
  ResultsGrid,
  WarningCard,
} from "@/components/calculator-framework";
import {
  calculateEquipmentRoi,
  equipmentRoiInitialInputs,
  getEquipmentRoiRecommendations,
  type EquipmentRoiCalculatorInputs,
} from "@/lib/calculators/equipment-roi";

type FieldKey = Extract<keyof EquipmentRoiCalculatorInputs, string>;

const fields: CalculatorFieldConfig<FieldKey>[] = [
  {
    key: "equipmentCost",
    label: "Equipment cost",
    inputType: "currency",
    min: 0,
    max: 150000,
    step: 500,
  },
  {
    key: "monthlyIncrementalRevenue",
    label: "Added monthly revenue",
    inputType: "currency",
    min: 0,
    max: 15000,
    step: 100,
    helperText: "Use realistic case volume or utilization assumptions, not a best-case month.",
  },
  {
    key: "monthlyOperatingCost",
    label: "Monthly operating cost",
    inputType: "currency",
    min: 0,
    max: 3000,
    step: 50,
    helperText: "Include added supplies, maintenance, software, or service costs.",
  },
  {
    key: "financingMonths",
    label: "Financing months",
    inputType: "number",
    min: 0,
    max: 84,
    step: 6,
    suffix: " mo",
    helperText: "Zero means paid in cash. Payment is a simplified even split with no interest modeled.",
  },
];

export default function EquipmentRoiCalculatorWorkspace() {
  const [inputs, setInputs] = useState<EquipmentRoiCalculatorInputs>(
    equipmentRoiInitialInputs
  );
  const results = useMemo(() => calculateEquipmentRoi(inputs), [inputs]);
  const recommendations = useMemo(
    () => getEquipmentRoiRecommendations(inputs, results),
    [inputs, results]
  );

  function updateInput(key: FieldKey, value: number) {
    if (Number.isNaN(value)) return;
    setInputs((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <div className="space-y-8">
      <CalculatorShell
        title="Calculate equipment ROI"
        description="Model a simplified purchase scenario using equipment cost, incremental revenue, operating cost, and financing term."
        sidebar={
          <>
            <ResultCard
              label="Break-even"
              value={results.breakEvenReached ? `${formatCalculatorNumber(results.breakEvenMonths)} mo` : "Not reached"}
              description="Break-even uses added net revenue before financing, matching the legacy member calculator."
              tone={results.breakEvenReached ? "primary" : "warning"}
            />
            <ResultsGrid>
              <ResultCard
                label="Monthly payment"
                value={formatCalculatorCurrency(results.monthlyLoanPayment)}
                description="Simplified even split over the financing term; no interest is modeled."
                tone="info"
              />
              <ResultCard
                label="Net monthly benefit"
                value={formatCalculatorCurrency(results.netMonthlyBenefit)}
                description="Added revenue minus operating cost and simplified payment."
                tone={results.netMonthlyBenefit >= 0 ? "success" : "warning"}
              />
              <ResultCard
                label="Annualized benefit"
                value={formatCalculatorCurrency(results.annualBenefitPreLoan)}
                description="Pre-financing net monthly benefit multiplied by 12."
              />
              <ResultCard
                label="5-year ROI"
                value={`${formatCalculatorNumber(results.fiveYearRoiPct)}%`}
                description="Five-year return divided by equipment cost."
                tone={results.fiveYearReturn >= 0 ? "success" : "warning"}
              />
            </ResultsGrid>
            <ClaimListingCTA
              href="/claim?source=equipment-roi-calculator"
              description="Claim your profile now so future DentistOS reports can connect investment planning work to your practice workspace."
              label="Claim your listing"
            />
          </>
        }
      >
        <CalculatorSection
          title="Purchase and revenue inputs"
          description="Separate financing payment from ongoing operating costs so the model makes the cash-flow assumptions visible."
        >
          <CalculatorFieldGrid
            fields={fields}
            values={inputs}
            idPrefix="equipment-roi"
            onChange={updateInput}
          />
        </CalculatorSection>

        <CalculatorSection title="Five-year outlook">
          <ResultsGrid>
            <ResultCard
              label="Pre-financing benefit"
              value={formatCalculatorCurrency(results.netMonthlyBenefitPreLoan)}
              description="Added monthly revenue minus added operating cost."
              tone={results.netMonthlyBenefitPreLoan > 0 ? "success" : "warning"}
            />
            <ResultCard
              label="5-year return"
              value={formatCalculatorCurrency(results.fiveYearReturn)}
              description="Pre-financing benefit over 60 months minus equipment cost."
              tone={results.fiveYearReturn >= 0 ? "success" : "warning"}
            />
            <ResultCard
              label="Equipment cost"
              value={formatCalculatorCurrency(inputs.equipmentCost)}
              description="Purchase price before taxes, fees, or real financing interest."
            />
            <ResultCard
              label="Financing term"
              value={`${formatCalculatorNumber(inputs.financingMonths)} mo`}
              description="Used only for the simplified monthly payment view."
              tone="info"
            />
          </ResultsGrid>
        </CalculatorSection>

        <CalculatorSection title="Actions">
          <CalculatorActionBar onReset={() => setInputs(equipmentRoiInitialInputs)} />
        </CalculatorSection>
      </CalculatorShell>

      <CalculatorSection
        title="Actionable recommendations"
        description="Use these prompts to review utilization, revenue assumptions, operating costs, and financing term."
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
        <InsightCard title="What drives the result">
          Incremental revenue and operating cost drive break-even. Financing term affects the
          monthly payment view, but the legacy break-even calculation is pre-financing.
        </InsightCard>
        <WarningCard title="Estimate only">
          This tool is for practice planning. It does not provide lending, tax, legal,
          accounting, financing, or investment advice, and results are not saved in this phase.
        </WarningCard>
      </div>
    </div>
  );
}
