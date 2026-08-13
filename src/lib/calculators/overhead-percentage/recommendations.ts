import type {
  OverheadPercentageCalculatorInputs,
  OverheadPercentageCalculatorResults,
  OverheadPercentageRecommendation,
} from "./types";
import { OVERHEAD_BENCHMARK_HIGH, OVERHEAD_BENCHMARK_LOW } from "./calculator";

export function getOverheadPercentageRecommendations(
  inputs: OverheadPercentageCalculatorInputs,
  results: OverheadPercentageCalculatorResults
): OverheadPercentageRecommendation[] {
  const recommendations: OverheadPercentageRecommendation[] = [];
  const payrollPct = percentOfCollections(inputs.staffPayroll, inputs.monthlyCollections);
  const labPct = percentOfCollections(inputs.labFees, inputs.monthlyCollections);
  const marginPct = 100 - results.overheadPct;

  if (inputs.monthlyCollections <= 0) {
    recommendations.push({
      title: "Add collections before benchmarking",
      description:
        "Overhead percentage depends on collections. Enter a typical collections month before using the benchmark comparison.",
    });
  } else if (results.vsBenchmark === "above") {
    recommendations.push({
      title: "Prioritize the largest overhead categories",
      description: `Modeled overhead is ${formatPercent(
        results.overheadPct
      )}, above the ${OVERHEAD_BENCHMARK_LOW}-${OVERHEAD_BENCHMARK_HIGH}% reference band used by the legacy member tool. Start with the largest controllable categories.`,
    });
  } else if (results.vsBenchmark === "below") {
    recommendations.push({
      title: "Validate unusually low overhead",
      description: `Modeled overhead is ${formatPercent(
        results.overheadPct
      )}, below the ${OVERHEAD_BENCHMARK_LOW}-${OVERHEAD_BENCHMARK_HIGH}% reference band. Confirm that all normal monthly expenses are included before drawing conclusions.`,
    });
  } else {
    recommendations.push({
      title: "Maintain overhead visibility",
      description: `Modeled overhead is ${formatPercent(
        results.overheadPct
      )}, within the ${OVERHEAD_BENCHMARK_LOW}-${OVERHEAD_BENCHMARK_HIGH}% reference band. Keep tracking categories monthly so small changes do not compound unnoticed.`,
    });
  }

  if (payrollPct > 30) {
    recommendations.push({
      title: "Review payroll against collections",
      description: `Payroll and benefits model at ${formatPercent(
        payrollPct
      )} of collections. Review staffing levels, schedule capacity, and role coverage against actual production demand.`,
    });
  }

  if (labPct > 10) {
    recommendations.push({
      title: "Inspect lab-fee mix",
      description: `Lab fees model at ${formatPercent(
        labPct
      )} of collections. Compare lab-heavy procedure mix against collected revenue and case acceptance trends.`,
    });
  }

  if (marginPct < 20) {
    recommendations.push({
      title: "Protect operating margin",
      description: `Modeled operating margin before owner compensation is ${formatPercent(
        marginPct
      )}. Improve collections visibility before making staffing, facility, or supply decisions.`,
    });
  }

  recommendations.push({
    title: "Compare the same categories over time",
    description: `Monthly operating income before owner compensation models at ${formatCurrency(
      results.netBeforeOwnerPay
    )}. Use consistent categories each month so trend changes are meaningful.`,
  });

  return recommendations;
}

function percentOfCollections(value: number, monthlyCollections: number): number {
  return (value / Math.max(monthlyCollections, 1)) * 100;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)}%`;
}
