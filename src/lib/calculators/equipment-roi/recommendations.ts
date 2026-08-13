import type {
  EquipmentRoiCalculatorInputs,
  EquipmentRoiCalculatorResults,
  EquipmentRoiRecommendation,
} from "./types";

export function getEquipmentRoiRecommendations(
  inputs: EquipmentRoiCalculatorInputs,
  results: EquipmentRoiCalculatorResults
): EquipmentRoiRecommendation[] {
  const recommendations: EquipmentRoiRecommendation[] = [];

  if (inputs.equipmentCost <= 0) {
    recommendations.push({
      title: "Add equipment cost",
      description:
        "The purchase price is required before break-even and five-year return can be interpreted.",
    });
  }

  if (inputs.monthlyIncrementalRevenue <= 0) {
    recommendations.push({
      title: "Validate revenue assumptions",
      description:
        "Added monthly revenue is the main driver of ROI. Use conservative utilization assumptions instead of best-case case volume.",
    });
  }

  if (results.netMonthlyBenefitPreLoan <= 0) {
    recommendations.push({
      title: "Break-even is not currently reached",
      description:
        "Operating costs are equal to or greater than the added revenue before financing. Revisit utilization, revenue, or ongoing cost assumptions before relying on the purchase model.",
    });
  } else {
    recommendations.push({
      title: "Review the break-even timeline",
      description: `The pre-financing model reaches break-even in ${formatMonths(
        results.breakEvenMonths
      )}. Compare that timeline with the expected useful life and team adoption curve.`,
    });
  }

  if (inputs.financingMonths <= 0) {
    recommendations.push({
      title: "Cash purchase scenario",
      description:
        "No financing term is modeled, so monthly payment is zero. Compare this against actual cash-flow constraints separately.",
    });
  } else if (results.netMonthlyBenefit < 0) {
    recommendations.push({
      title: "Financing pressure exceeds monthly benefit",
      description:
        "The simplified monthly payment is larger than the modeled pre-loan benefit. Review financing term, purchase price, and ramp-up assumptions.",
    });
  }

  if (results.fiveYearReturn < 0) {
    recommendations.push({
      title: "Five-year return is negative",
      description:
        "The five-year model does not recover the equipment cost under these assumptions. Recheck utilization, operating costs, and expected revenue before proceeding.",
    });
  } else {
    recommendations.push({
      title: "Stress-test utilization",
      description:
        "Run conservative and optimistic revenue scenarios to see how sensitive the five-year return is to case volume and adoption speed.",
    });
  }

  recommendations.push({
    title: "Keep advice boundaries clear",
    description:
      "Use this as a directional planning estimate. It does not provide lending, tax, legal, accounting, or financing advice.",
  });

  return recommendations;
}

function formatMonths(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)} months`;
}
