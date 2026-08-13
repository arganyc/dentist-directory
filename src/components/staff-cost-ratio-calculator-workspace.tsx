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
  calculateStaffCostRatio,
  getStaffCostRatioRecommendations,
  staffCostRatioInitialInputs,
  STAFF_COST_RATIO_BENCHMARK_HIGH,
  STAFF_COST_RATIO_BENCHMARK_LOW,
  type StaffCostRatioBenchmarkStatus,
  type StaffCostRatioCalculatorInputs,
} from "@/lib/calculators/staff-cost-ratio";

type FieldKey = Extract<keyof StaffCostRatioCalculatorInputs, string>;

const fields: CalculatorFieldConfig<FieldKey>[] = [
  {
    key: "monthlyCollections",
    label: "Monthly collections",
    inputType: "currency",
    min: 0,
    max: 200000,
    step: 1000,
    helperText: "Use collected revenue for a typical month.",
  },
  {
    key: "totalStaffPayroll",
    label: "Staff payroll and benefits",
    inputType: "currency",
    min: 0,
    max: 80000,
    step: 500,
    helperText: "Exclude owner-dentist compensation to match the legacy member calculator.",
  },
  {
    key: "fteStaffCount",
    label: "FTE staff count",
    inputType: "number",
    min: 0,
    max: 25,
    step: 1,
    helperText: "Use full-time equivalent staff count, excluding owner-dentists.",
  },
];

export default function StaffCostRatioCalculatorWorkspace() {
  const [inputs, setInputs] = useState<StaffCostRatioCalculatorInputs>(
    staffCostRatioInitialInputs
  );
  const results = useMemo(() => calculateStaffCostRatio(inputs), [inputs]);
  const recommendations = useMemo(
    () => getStaffCostRatioRecommendations(inputs, results),
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
        title="Calculate staff cost ratio"
        description="Compare monthly staff payroll and benefits against collections, then review payroll per FTE and annualized payroll."
        sidebar={
          <>
            <ResultCard
              label="Staff cost ratio"
              value={`${formatCalculatorNumber(results.staffCostRatio)}%`}
              description={`Monthly KPI: staff cost ratio is payroll divided by monthly collections. Existing reference band is ${STAFF_COST_RATIO_BENCHMARK_LOW}-${STAFF_COST_RATIO_BENCHMARK_HIGH}% of collections.`}
              tone={resultToneForBenchmark(results.vsBenchmark)}
            />
            <ResultsGrid>
              <ResultCard label="Monthly payroll" value={formatCalculatorCurrency(inputs.totalStaffPayroll)} />
              <ResultCard label="Annual payroll" value={formatCalculatorCurrency(results.annualPayroll)} />
              <ResultCard label="Payroll per FTE" value={formatCalculatorCurrency(results.payrollPerFte)} />
              <ResultCard label="Benchmark status" value={results.vsBenchmark} tone={resultToneForBenchmark(results.vsBenchmark)} />
            </ResultsGrid>
            <ClaimListingCTA
              href="/claim?source=staff-cost-ratio-calculator"
              description="Claim your profile now so future DentistOS reports can connect staffing and production planning to your practice workspace."
              label="Claim your listing"
            />
          </>
        }
      >
        <CalculatorSection
          title="Collections and payroll inputs"
          description="Use a typical month and keep payroll categories consistent when comparing results over time."
        >
          <CalculatorFieldGrid
            fields={fields}
            values={inputs}
            idPrefix="staff-cost-ratio"
            onChange={updateInput}
          />
        </CalculatorSection>

        <CalculatorSection title="What drives the ratio">
          <ResultsGrid>
            <ResultCard
              label="Collections denominator"
              value={formatCalculatorCurrency(inputs.monthlyCollections)}
              description="Higher collections lower the ratio when payroll is unchanged."
              tone="info"
            />
            <ResultCard
              label="Payroll numerator"
              value={formatCalculatorCurrency(inputs.totalStaffPayroll)}
              description="Payroll and benefits directly increase the ratio."
            />
            <ResultCard
              label="Modeled FTE count"
              value={formatCalculatorNumber(inputs.fteStaffCount)}
              description="FTE count explains payroll per staff member, but does not change the ratio directly."
            />
            <ResultCard
              label="Annualized payroll"
              value={formatCalculatorCurrency(results.annualPayroll)}
              description="Monthly staff payroll multiplied by 12."
            />
          </ResultsGrid>
        </CalculatorSection>

        <CalculatorSection title="Actions">
          <CalculatorActionBar onReset={() => setInputs(staffCostRatioInitialInputs)} />
        </CalculatorSection>
      </CalculatorShell>

      <CalculatorSection
        title="Actionable recommendations"
        description="Use these prompts to review staffing mix, collections, payroll structure, and productivity visibility."
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
        <InsightCard title="Collections and payroll move together">
          The ratio can rise because payroll increased, collections softened, or both. Review the
          numerator and denominator before interpreting the benchmark status.
        </InsightCard>
        <WarningCard title="Estimate only">
          This tool is for practice planning. It does not provide employment-law, tax, accounting,
          compensation, staffing, or financial advice, and results are not saved in this phase.
        </WarningCard>
      </div>
    </div>
  );
}

function resultToneForBenchmark(status: StaffCostRatioBenchmarkStatus) {
  if (status === "within") return "success";
  if (status === "above") return "warning";
  return "info";
}
