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
  calculateHygieneProduction,
  getHygieneProductionRecommendations,
  hygieneProductionInitialInputs,
  HYGIENE_PRODUCTION_BENCHMARK_HIGH,
  HYGIENE_PRODUCTION_BENCHMARK_LOW,
  type HygieneProductionBenchmarkStatus,
  type HygieneProductionCalculatorInputs,
} from "@/lib/calculators/hygiene-production";

type FieldKey = Extract<keyof HygieneProductionCalculatorInputs, string>;

const fields: CalculatorFieldConfig<FieldKey>[] = [
  {
    key: "visitsPerDay",
    label: "Hygiene visits per day",
    inputType: "number",
    min: 0,
    max: 16,
    step: 1,
    helperText: "Use one hygienist's typical completed hygiene visits per day.",
  },
  {
    key: "avgProductionPerVisit",
    label: "Average production per visit",
    inputType: "currency",
    min: 0,
    max: 400,
    step: 10,
  },
  {
    key: "chairHoursPerDay",
    label: "Chair hours per day",
    inputType: "number",
    min: 0,
    max: 10,
    step: 0.5,
    suffix: " hrs",
    helperText: "Use productive hygiene chair hours, excluding lunch and known blockouts.",
  },
  {
    key: "workingDaysPerWeek",
    label: "Days per week",
    inputType: "number",
    min: 0,
    max: 7,
    step: 1,
  },
  {
    key: "workingWeeksPerYear",
    label: "Weeks per year",
    inputType: "number",
    min: 0,
    max: 52,
    step: 1,
  },
];

export default function HygieneProductionCalculatorWorkspace() {
  const [inputs, setInputs] = useState<HygieneProductionCalculatorInputs>(
    hygieneProductionInitialInputs
  );
  const results = useMemo(() => calculateHygieneProduction(inputs), [inputs]);
  const recommendations = useMemo(
    () => getHygieneProductionRecommendations(inputs, results),
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
        title="Calculate hygiene production per hour"
        description="Estimate daily, hourly, weekly, and annual hygiene production from visit volume, visit value, and available chair time."
        sidebar={
          <>
            <ResultCard
              label="Production per hour"
              value={formatCalculatorCurrency(results.hourlyProduction)}
              description={`Hourly KPI: hygiene performance is compared against chair time. Existing reference band is ${formatCalculatorCurrency(
                HYGIENE_PRODUCTION_BENCHMARK_LOW
              )}-${formatCalculatorCurrency(HYGIENE_PRODUCTION_BENCHMARK_HIGH)}/hr.`}
              tone={resultToneForBenchmark(results.vsBenchmark)}
            />
            <ResultsGrid>
              <ResultCard label="Daily production" value={formatCalculatorCurrency(results.dailyProduction)} />
              <ResultCard label="Weekly production" value={formatCalculatorCurrency(results.weeklyProduction)} />
              <ResultCard label="Monthly production" value={formatCalculatorCurrency(results.monthlyProduction)} />
              <ResultCard label="Annual production" value={formatCalculatorCurrency(results.annualProduction)} />
            </ResultsGrid>
            <ClaimListingCTA
              href="/claim?source=hygiene-production-calculator"
              description="Claim your profile now so future DentistOS reports can connect hygiene planning work to your practice workspace."
              label="Claim your listing"
            />
          </>
        }
      >
        <CalculatorSection
          title="Hygiene schedule inputs"
          description="Run this once per hygienist or chair pattern if your schedules differ across the week."
        >
          <CalculatorFieldGrid
            fields={fields}
            values={inputs}
            idPrefix="hygiene-production"
            onChange={updateInput}
          />
        </CalculatorSection>

        <CalculatorSection title="Capacity and efficiency view">
          <ResultsGrid>
            <ResultCard
              label="Benchmark status"
              value={results.vsBenchmark}
              description="Below, within, or above the existing legacy hourly production benchmark band."
              tone={resultToneForBenchmark(results.vsBenchmark)}
            />
            <ResultCard
              label="Visits per chair hour"
              value={formatCalculatorNumber(visitsPerChairHour(inputs))}
              description="This explains whether the hourly result is driven more by volume or available chair time."
              tone="info"
            />
            <ResultCard
              label="Production per visit"
              value={formatCalculatorCurrency(inputs.avgProductionPerVisit)}
              description="Visit value is one of the direct drivers of hygiene production."
            />
            <ResultCard
              label="Modeled schedule"
              value={`${formatCalculatorNumber(inputs.workingDaysPerWeek)} days/wk`}
              description={`${formatCalculatorNumber(inputs.workingWeeksPerYear)} working weeks per year.`}
            />
          </ResultsGrid>
        </CalculatorSection>

        <CalculatorSection title="Actions">
          <CalculatorActionBar onReset={() => setInputs(hygieneProductionInitialInputs)} />
        </CalculatorSection>
      </CalculatorShell>

      <CalculatorSection
        title="Actionable recommendations"
        description="Use these operational prompts to review scheduling consistency, hygiene capacity, and production visibility."
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
          Daily production comes from visits multiplied by average production per visit. Hourly
          production then divides that daily total by hygiene chair hours.
        </InsightCard>
        <WarningCard title="Estimate only">
          This tool is for practice planning. It does not provide clinical, legal, financial, tax,
          staffing, or scheduling advice, and results are not saved in this phase.
        </WarningCard>
      </div>
    </div>
  );
}

function visitsPerChairHour(inputs: HygieneProductionCalculatorInputs): number {
  if (inputs.chairHoursPerDay <= 0) return 0;
  return inputs.visitsPerDay / inputs.chairHoursPerDay;
}

function resultToneForBenchmark(status: HygieneProductionBenchmarkStatus) {
  if (status === "within") return "success";
  if (status === "below") return "warning";
  return "info";
}
