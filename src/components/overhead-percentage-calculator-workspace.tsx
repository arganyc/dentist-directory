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
  calculateOverheadPercentage,
  getOverheadPercentageRecommendations,
  overheadPercentageInitialInputs,
  OVERHEAD_BENCHMARK_HIGH,
  OVERHEAD_BENCHMARK_LOW,
  type OverheadPercentageCalculatorInputs,
} from "@/lib/calculators/overhead-percentage";

type FieldKey = Extract<keyof OverheadPercentageCalculatorInputs, string>;

const fields: CalculatorFieldConfig<FieldKey>[] = [
  {
    key: "monthlyCollections",
    label: "Monthly collections",
    inputType: "currency",
    min: 0,
    max: 200000,
    step: 1000,
    helperText: "Use collected revenue for a typical month, not billed production.",
  },
  {
    key: "staffPayroll",
    label: "Payroll and benefits",
    inputType: "currency",
    min: 0,
    max: 80000,
    step: 500,
    helperText: "Include non-owner staff wages, payroll taxes, and benefits.",
  },
  {
    key: "facilityRent",
    label: "Rent and facility costs",
    inputType: "currency",
    min: 0,
    max: 25000,
    step: 250,
  },
  {
    key: "labFees",
    label: "Lab fees",
    inputType: "currency",
    min: 0,
    max: 20000,
    step: 250,
  },
  {
    key: "supplies",
    label: "Supplies and small equipment",
    inputType: "currency",
    min: 0,
    max: 15000,
    step: 250,
  },
  {
    key: "otherOverhead",
    label: "Other overhead",
    inputType: "currency",
    min: 0,
    max: 20000,
    step: 250,
    helperText: "Include marketing, utilities, insurance, software, and miscellaneous operating costs.",
  },
];

export default function OverheadPercentageCalculatorWorkspace() {
  const [inputs, setInputs] = useState<OverheadPercentageCalculatorInputs>(
    overheadPercentageInitialInputs
  );
  const results = useMemo(() => calculateOverheadPercentage(inputs), [inputs]);
  const recommendations = useMemo(
    () => getOverheadPercentageRecommendations(inputs, results),
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
        title="Calculate overhead percentage"
        description="Estimate operating overhead as a share of collections, excluding owner-dentist compensation."
        sidebar={
          <>
            <ResultCard
              label="Overhead percentage"
              value={`${formatCalculatorNumber(results.overheadPct)}%`}
              description={`Monthly KPI: overhead is usually reviewed against monthly collections. Benchmark status: ${results.vsBenchmark} the ${OVERHEAD_BENCHMARK_LOW}-${OVERHEAD_BENCHMARK_HIGH}% reference band.`}
              tone={resultToneForBenchmark(results.vsBenchmark)}
            />
            <ResultsGrid>
              <ResultCard label="Total overhead" value={formatCalculatorCurrency(results.totalOverhead)} />
              <ResultCard label="Monthly operating income" value={formatCalculatorCurrency(results.netBeforeOwnerPay)} />
              <ResultCard label="Annual operating income" value={formatCalculatorCurrency(results.annualNet)} />
              <ResultCard label="Annual overhead" value={formatCalculatorCurrency(results.annualOverhead)} />
            </ResultsGrid>
            <ClaimListingCTA
              href="/claim?source=overhead-percentage-calculator"
              description="Claim your profile now so future DentistOS reports can connect financial planning work to your practice workspace."
              label="Claim your listing"
            />
          </>
        }
      >
        <CalculatorSection
          title="Collections and overhead inputs"
          description="Use a typical month and keep categories consistent so future comparisons remain meaningful."
        >
          <CalculatorFieldGrid
            fields={fields}
            values={inputs}
            idPrefix="overhead-percentage"
            onChange={updateInput}
          />
        </CalculatorSection>

        <CalculatorSection title="Benchmark comparison">
          <ResultsGrid>
            <ResultCard
              label="Benchmark band"
              value={`${OVERHEAD_BENCHMARK_LOW}-${OVERHEAD_BENCHMARK_HIGH}%`}
              description="Same reference band used by the legacy member calculator."
              tone="info"
            />
            <ResultCard
              label="Current status"
              value={results.vsBenchmark}
              description="Below, within, or above the benchmark band."
              tone={resultToneForBenchmark(results.vsBenchmark)}
            />
            <ResultCard label="Annual collections" value={formatCalculatorCurrency(results.annualCollections)} />
            <ResultCard label="Annual overhead" value={formatCalculatorCurrency(results.annualOverhead)} />
          </ResultsGrid>
        </CalculatorSection>

        <CalculatorSection title="Actions">
          <CalculatorActionBar onReset={() => setInputs(overheadPercentageInitialInputs)} />
        </CalculatorSection>
      </CalculatorShell>

      <CalculatorSection
        title="Actionable recommendations"
        description="Use overhead percentage as a directional operating metric, then review the underlying categories."
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
        <InsightCard title="Owner compensation is excluded">
          This workspace models operating overhead before owner-dentist compensation, matching the
          existing member tool. Keep that boundary consistent when comparing months.
        </InsightCard>
        <WarningCard title="Estimate only">
          This tool is for practice planning. It does not provide legal, accounting, tax,
          financial, staffing, or clinical advice, and results are not saved in this phase.
        </WarningCard>
      </div>
    </div>
  );
}

function resultToneForBenchmark(status: "below" | "within" | "above") {
  if (status === "within") return "success";
  if (status === "above") return "warning";
  return "info";
}
