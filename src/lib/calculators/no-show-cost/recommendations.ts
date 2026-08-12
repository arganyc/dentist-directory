import type { NoShowCostCalculatorInputs, NoShowCostCalculatorResults, NoShowCostRecommendation } from "./types";

export function getNoShowCostRecommendations(
  inputs: NoShowCostCalculatorInputs,
  results: NoShowCostCalculatorResults
): NoShowCostRecommendation[] {
  return [
    {
      title: "Protect the next 48 hours",
      description: `Keep a short-notice list for patients who can accept hygiene or emergency openings. Your current settings show ${formatOneDecimal(
        results.missedVisits
      )} missed visits each week.`,
    },
    {
      title: "Separate hygiene and treatment gaps",
      description: `This model estimates ${formatCurrency(results.hygieneAtRisk)} in hygiene value and ${formatCurrency(
        results.treatmentAtRisk
      )} in treatment value at risk annually.`,
    },
    {
      title: "Improve confirmation timing",
      description:
        "Confirm appointments earlier, then send a same-day reminder. Track whether your cancellation rebooking rate rises after two weeks.",
    },
    {
      title: "Fill demand from local discovery",
      description: `If lost production equals ${formatCurrency(results.annualLoss)} annually, roughly ${
        results.newPatientsToOffset
      } new patients at your estimated value could offset it.`,
    },
    {
      title: "Set a realistic recovery target",
      description: `A 25% recovery target is worth ${formatCurrency(
        results.recovered25
      )} per year at these inputs. Start there before aiming for a larger schedule-policy change.`,
    },
    {
      title: "Review monthly",
      description: `Track cancellations, no-shows, rebooking rate, and filled short-notice openings every month. This model currently assumes ${inputs.workingWeeks} working weeks per year.`,
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

