import type {
  PatientAcquisitionCostCalculatorInputs,
  PatientAcquisitionCostCalculatorResults,
  PatientAcquisitionCostRecommendation,
} from "./types";

export function getPatientAcquisitionCostRecommendations(
  inputs: PatientAcquisitionCostCalculatorInputs,
  results: PatientAcquisitionCostCalculatorResults
): PatientAcquisitionCostRecommendation[] {
  const channelGuidance =
    results.healthLabel === "healthy"
      ? "Your modeled LTV:CAC ratio is in a healthy range. Keep tracking the channel mix so low-cost sources are not hidden by blended averages."
      : results.healthLabel === "workable"
        ? "Your modeled LTV:CAC ratio is workable, but small improvements in conversion rate, retention, or listing visibility can materially improve payback."
        : "Your modeled LTV:CAC ratio is tight. Review spend quality, lead-to-appointment conversion, and whether each channel is producing retained patients.";

  return [
    {
      title: "Track CAC by channel",
      description:
        "Separate paid search, SEO, directory visibility, referrals, and direct traffic before deciding which channel deserves more budget.",
    },
    {
      title: "Compare CAC to lifetime value",
      description: `At these inputs, each new patient costs ${formatCurrency(
        results.cac
      )} to acquire and has an estimated lifetime value of ${formatCurrency(results.lifetimeValue)}.`,
    },
    {
      title: "Watch payback period",
      description: `The modeled payback period is ${formatOneDecimal(
        results.paybackMonths
      )} months. Shorter payback gives the practice more room to scale marketing safely.`,
    },
    {
      title: "Improve local conversion paths",
      description:
        "A complete claimed listing, clear phone number, strong service pages, and recent review signals can lower blended acquisition cost.",
    },
    {
      title: "Review budget monthly",
      description: `This model annualizes ${formatCurrency(
        inputs.monthlyMarketingSpend * 12
      )} in marketing spend and ${formatOneDecimal(results.annualNewPatients)} new patients.`,
    },
    {
      title: "Interpret the ratio carefully",
      description: channelGuidance,
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

function formatOneDecimal(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

