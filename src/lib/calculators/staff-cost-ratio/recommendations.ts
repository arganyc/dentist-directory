import {
  STAFF_COST_RATIO_BENCHMARK_HIGH,
  STAFF_COST_RATIO_BENCHMARK_LOW,
} from "./calculator";
import type {
  StaffCostRatioCalculatorInputs,
  StaffCostRatioCalculatorResults,
  StaffCostRatioRecommendation,
} from "./types";

export function getStaffCostRatioRecommendations(
  inputs: StaffCostRatioCalculatorInputs,
  results: StaffCostRatioCalculatorResults
): StaffCostRatioRecommendation[] {
  const recommendations: StaffCostRatioRecommendation[] = [];

  if (inputs.monthlyCollections <= 0) {
    recommendations.push({
      title: "Add monthly collections",
      description:
        "Staff cost ratio depends on collections. Add a typical collected revenue month before interpreting the benchmark comparison.",
    });
  }

  if (inputs.totalStaffPayroll <= 0) {
    recommendations.push({
      title: "Add staff payroll",
      description:
        "Include staff wages, payroll taxes, and benefits before using this model for staffing or productivity conversations.",
    });
  }

  if (inputs.fteStaffCount <= 0) {
    recommendations.push({
      title: "Add FTE staff count",
      description:
        "FTE count is required for payroll-per-FTE interpretation. This model avoids division by zero, but a real staffing review needs a real FTE count.",
    });
  }

  if (results.vsBenchmark === "above") {
    recommendations.push({
      title: "Review staffing mix against collections",
      description: `Modeled staff cost ratio is above the existing ${STAFF_COST_RATIO_BENCHMARK_LOW}-${STAFF_COST_RATIO_BENCHMARK_HIGH}% reference band. Review collections, role mix, scheduling support, and production per staff hour before changing staffing levels.`,
    });
  } else if (results.vsBenchmark === "below") {
    recommendations.push({
      title: "Check whether the ratio is sustainably low",
      description:
        "A below-band ratio may reflect efficiency, but it can also signal understaffing or collections timing. Compare against service levels and schedule flow.",
    });
  } else {
    recommendations.push({
      title: "Track payroll and collections together",
      description:
        "Staff cost ratio is within the existing reference band. Keep collections and payroll categories consistent when comparing month to month.",
    });
  }

  recommendations.push({
    title: "Use payroll per FTE as a second lens",
    description: `Modeled payroll per FTE is ${formatCurrency(
      results.payrollPerFte
    )} per month. Use it to understand what is driving the ratio without treating it as an employment recommendation.`,
  });

  recommendations.push({
    title: "Keep this as an operations estimate",
    description:
      "Use this calculator for practice planning only. It does not provide employment-law, tax, accounting, compensation, or staffing advice.",
  });

  return recommendations;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
