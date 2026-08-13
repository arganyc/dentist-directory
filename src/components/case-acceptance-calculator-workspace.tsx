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
  calculateCaseAcceptance,
  caseAcceptanceInitialInputs,
  getCaseAcceptanceRecommendations,
  type CaseAcceptanceCalculatorInputs,
} from "@/lib/calculators/case-acceptance";

type FieldKey = Extract<keyof CaseAcceptanceCalculatorInputs, string>;

const fields: CalculatorFieldConfig<FieldKey>[] = [
  {
    key: "plansPresentedPerMonth",
    label: "Treatment plans per month",
    inputType: "number",
    min: 0,
    max: 150,
    step: 1,
    helperText: "Use plans actually presented in a normal month, not all exams.",
  },
  {
    key: "averageCaseValue",
    label: "Average case value",
    inputType: "currency",
    min: 0,
    max: 8000,
    step: 50,
  },
  {
    key: "currentAcceptanceRate",
    label: "Current acceptance rate",
    inputType: "percentage",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    key: "targetAcceptanceRate",
    label: "Target acceptance rate",
    inputType: "percentage",
    min: 0,
    max: 100,
    step: 1,
    helperText: "Set a realistic planning target above the current rate to model upside.",
  },
];

export default function CaseAcceptanceCalculatorWorkspace() {
  const [inputs, setInputs] = useState<CaseAcceptanceCalculatorInputs>(
    caseAcceptanceInitialInputs
  );
  const results = useMemo(() => calculateCaseAcceptance(inputs), [inputs]);
  const recommendations = useMemo(
    () => getCaseAcceptanceRecommendations(inputs, results),
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
        title="Calculate case acceptance impact"
        description="Estimate accepted production, unaccepted treatment value, and the monthly or annual upside of reaching a target acceptance rate."
        sidebar={
          <>
            <ResultCard
              label="Annual upside"
              value={formatCalculatorCurrency(results.upliftAnnual)}
              description={`Annual KPI: monthly acceptance improvements compound across the year. Monthly upside is ${formatCalculatorCurrency(results.upliftMonthly)}.`}
              tone={results.upliftAnnual > 0 ? "primary" : "info"}
            />
            <ResultsGrid>
              <ResultCard
                label="Current accepted cases"
                value={formatCalculatorNumber(results.acceptedCases)}
              />
              <ResultCard
                label="Current accepted production"
                value={formatCalculatorCurrency(results.acceptedValue)}
              />
              <ResultCard
                label="Estimated missed production"
                value={formatCalculatorCurrency(results.lostValueMonthly)}
              />
              <ResultCard
                label="Target accepted production"
                value={formatCalculatorCurrency(results.targetProduction)}
              />
            </ResultsGrid>
            <ClaimListingCTA
              href="/claim?source=case-acceptance-calculator"
              description="Claim your profile now so future DentistOS reports can connect treatment-planning work to your practice workspace."
              label="Claim your listing"
            />
          </>
        }
      >
        <CalculatorSection
          title="Treatment plan inputs"
          description="Use a typical month and keep the same definition of a presented plan each time you compare results."
        >
          <CalculatorFieldGrid
            fields={fields}
            values={inputs}
            idPrefix="case-acceptance"
            onChange={updateInput}
          />
        </CalculatorSection>

        <CalculatorSection title="Monthly production view">
          <ResultsGrid>
            <ResultCard
              label="Accepted production"
              value={formatCalculatorCurrency(results.acceptedValue)}
              description="Current monthly production modeled from accepted treatment plans."
              tone="success"
            />
            <ResultCard
              label="Unaccepted production"
              value={formatCalculatorCurrency(results.lostValueMonthly)}
              description={`${formatCalculatorNumber(results.unacceptedCases)} plans per month are modeled as unaccepted.`}
              tone="warning"
            />
            <ResultCard
              label="Target accepted cases"
              value={formatCalculatorNumber(results.targetAcceptedCases)}
              description="How many cases would be accepted at the target rate."
              tone="info"
            />
            <ResultCard
              label="Monthly upside"
              value={formatCalculatorCurrency(results.upliftMonthly)}
              description="Additional monthly production from reaching the target rate."
              tone={results.upliftMonthly > 0 ? "success" : "info"}
            />
          </ResultsGrid>
        </CalculatorSection>

        <CalculatorSection title="Actions">
          <CalculatorActionBar onReset={() => setInputs(caseAcceptanceInitialInputs)} />
        </CalculatorSection>
      </CalculatorShell>

      <CalculatorSection
        title="Actionable recommendations"
        description="Use these operational prompts to review presentation workflow, follow-up cadence, and financing conversations."
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
        <InsightCard title="Target rates are planning scenarios">
          This workspace does not assume every unaccepted plan is recoverable. Use the target rate as a
          deterministic scenario for follow-up and presentation planning.
        </InsightCard>
        <WarningCard title="Estimate only">
          This tool is for practice planning. It does not provide clinical, legal, financial, tax,
          or treatment-planning advice, and results are not saved in this phase.
        </WarningCard>
      </div>
    </div>
  );
}
