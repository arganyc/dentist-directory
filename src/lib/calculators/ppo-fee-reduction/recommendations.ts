import type {
  PpoFeeReductionCalculatorInputs,
  PpoFeeReductionCalculatorResults,
  PpoFeeReductionRecommendation,
} from "./types";

export function getPpoFeeReductionRecommendations(
  inputs: PpoFeeReductionCalculatorInputs,
  results: PpoFeeReductionCalculatorResults
): PpoFeeReductionRecommendation[] {
  return [
    {
      title: "Review payer mix separately",
      description: `This model allocates ${formatPercent(
        inputs.inNetworkPatientPct
      )} of billed production to in-network patients. Review each payer separately before changing participation strategy.`,
    },
    {
      title: "Track contractual adjustment impact",
      description: `Estimated monthly write-offs are ${formatCurrency(
        results.totalWriteOff
      )}, or ${formatPercent(results.writeOffPct)} of billed production before collection.`,
    },
    {
      title: "Compare collected production",
      description: `At these inputs, estimated collected production is ${formatCurrency(
        results.collectedProduction
      )} per month after modeled adjustments.`,
    },
    {
      title: "Separate PPO and non-PPO discounts",
      description:
        "Do not assume every write-off is caused by PPO participation. Separate contracted adjustments, courtesy discounts, refunds, and billing corrections.",
    },
    {
      title: "Monitor the trend over time",
      description: `Annualized write-off impact is ${formatCurrency(
        results.annualWriteOff
      )}. Compare the same calculation monthly to spot payer-mix or fee-schedule drift.`,
    },
    {
      title: "Improve collections visibility",
      description:
        "Use consistent adjustment categories in practice reports so the team can distinguish write-offs from unpaid balances and timing delays.",
    },
  ];
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

