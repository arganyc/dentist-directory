import type {
  CaseAcceptanceCalculatorInputs,
  CaseAcceptanceCalculatorResults,
  CaseAcceptanceRecommendation,
} from "./types";

export function getCaseAcceptanceRecommendations(
  inputs: CaseAcceptanceCalculatorInputs,
  results: CaseAcceptanceCalculatorResults
): CaseAcceptanceRecommendation[] {
  const recommendations: CaseAcceptanceRecommendation[] = [];

  if (inputs.plansPresentedPerMonth <= 0) {
    recommendations.push({
      title: "Enter presented treatment plans",
      description:
        "Case acceptance depends on how many plans are actually presented. Add a normal monthly plan count before interpreting the opportunity.",
    });
  }

  if (inputs.averageCaseValue <= 0) {
    recommendations.push({
      title: "Add average case value",
      description:
        "Production impact depends on case value. Use a typical accepted case value before estimating missed production.",
    });
  }

  if (inputs.targetAcceptanceRate <= inputs.currentAcceptanceRate) {
    recommendations.push({
      title: "Set a target above the current rate",
      description:
        "The target acceptance rate is not above the current rate, so this model shows no improvement upside.",
    });
  } else if (results.upliftMonthly > 0) {
    recommendations.push({
      title: "Focus on the follow-up gap",
      description: `The target-rate scenario adds ${formatCurrency(
        results.upliftMonthly
      )} per month. Review follow-up timing for unaccepted plans before adding more patient demand.`,
    });
  }

  if (inputs.currentAcceptanceRate === 0 && inputs.plansPresentedPerMonth > 0) {
    recommendations.push({
      title: "Start with presentation tracking",
      description:
        "A zero acceptance rate usually means the workflow needs better tracking or no cases were accepted in the modeled month.",
    });
  } else if (inputs.currentAcceptanceRate === 100) {
    recommendations.push({
      title: "Validate perfect acceptance",
      description:
        "A 100% acceptance rate leaves no unaccepted case value in this model. Confirm that deferred, phased, and financing-pending cases are categorized consistently.",
    });
  }

  recommendations.push({
    title: "Separate case presentation from clinical care",
    description:
      "Use this as an operations planning estimate. Presentation clarity, financing options, and follow-up cadence can be reviewed without making clinical claims.",
  });

  recommendations.push({
    title: "Compare accepted and unaccepted production",
    description: `Current accepted production models at ${formatCurrency(
      results.acceptedValue
    )} per month, while unaccepted production models at ${formatCurrency(results.lostValueMonthly)} per month.`,
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
