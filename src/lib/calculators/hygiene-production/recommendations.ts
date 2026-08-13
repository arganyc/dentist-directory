import {
  HYGIENE_PRODUCTION_BENCHMARK_HIGH,
  HYGIENE_PRODUCTION_BENCHMARK_LOW,
} from "./calculator";
import type {
  HygieneProductionCalculatorInputs,
  HygieneProductionCalculatorResults,
  HygieneProductionRecommendation,
} from "./types";

export function getHygieneProductionRecommendations(
  inputs: HygieneProductionCalculatorInputs,
  results: HygieneProductionCalculatorResults
): HygieneProductionRecommendation[] {
  const recommendations: HygieneProductionRecommendation[] = [];

  if (inputs.visitsPerDay <= 0) {
    recommendations.push({
      title: "Add hygiene visits",
      description:
        "Hourly and annual production cannot be interpreted until the model includes a typical number of completed hygiene visits per day.",
    });
  }

  if (inputs.chairHoursPerDay <= 0) {
    recommendations.push({
      title: "Add chair hours",
      description:
        "Chair hours are required for an accurate hourly production view. This model avoids division by zero, but a real schedule should include usable chair time.",
    });
  }

  if (inputs.avgProductionPerVisit <= 0) {
    recommendations.push({
      title: "Add production per visit",
      description:
        "Use average completed hygiene production per visit before interpreting schedule capacity or annualized production.",
    });
  }

  if (results.vsBenchmark === "below") {
    recommendations.push({
      title: "Review schedule gaps and visit value",
      description: `Modeled hourly production is below the existing ${formatCurrency(
        HYGIENE_PRODUCTION_BENCHMARK_LOW
      )}-${formatCurrency(
        HYGIENE_PRODUCTION_BENCHMARK_HIGH
      )}/hr reference band. Review open chair time, visit mix, and hygiene appointment lengths.`,
    });
  } else if (results.vsBenchmark === "above") {
    recommendations.push({
      title: "Validate sustainability",
      description:
        "Hourly production is above the existing reference band. Confirm the modeled visit volume, chair hours, and production per visit reflect a sustainable schedule.",
    });
  } else {
    recommendations.push({
      title: "Track consistency over time",
      description:
        "Hourly production is within the existing reference band. Compare this metric month to month using the same visit and chair-hour definitions.",
    });
  }

  if (results.annualProduction > 0) {
    recommendations.push({
      title: "Connect daily production to annual capacity",
      description: `${formatCurrency(
        results.dailyProduction
      )} per day models to ${formatCurrency(
        results.annualProduction
      )} per year with the current days/week and weeks/year schedule.`,
    });
  }

  recommendations.push({
    title: "Use operational, not clinical, interpretation",
    description:
      "Use this estimate to review scheduling, capacity, and production visibility. It should not be used to make clinical recommendations.",
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
