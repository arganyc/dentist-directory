import type { NoShowCostCalculatorInputs, NoShowCostCalculatorResults } from "./types";

export const noShowCostCalculatorInitialInputs: NoShowCostCalculatorInputs = {
  averageProduction: 525,
  cancellationsPerWeek: 7,
  noShowsPerWeek: 3,
  rebookingRate: 45,
  chairHoursPerVisit: 1,
  workingWeeks: 48,
  hygieneVisitValue: 185,
  treatmentVisitValue: 950,
  newPatientValue: 900,
};

export function calculateNoShowCost(
  rawInputs: NoShowCostCalculatorInputs
): NoShowCostCalculatorResults {
  const inputs = sanitizeNoShowCostInputs(rawInputs);
  const unrecoveredCancellationRate = 1 - inputs.rebookingRate / 100;
  const weeklyCancellationLoss =
    inputs.cancellationsPerWeek * inputs.averageProduction * unrecoveredCancellationRate;
  const weeklyNoShowLoss = inputs.noShowsPerWeek * inputs.averageProduction;
  const weeklyLoss = weeklyCancellationLoss + weeklyNoShowLoss;
  const annualLoss = weeklyLoss * inputs.workingWeeks;
  const monthlyLoss = annualLoss / 12;
  const missedVisits = inputs.cancellationsPerWeek + inputs.noShowsPerWeek;
  const annualChairHours = missedVisits * inputs.chairHoursPerVisit * inputs.workingWeeks;
  const hygieneAtRisk = missedVisits * 0.6 * inputs.hygieneVisitValue * inputs.workingWeeks;
  const treatmentAtRisk = missedVisits * 0.4 * inputs.treatmentVisitValue * inputs.workingWeeks;
  const newPatientsToOffset = Math.ceil(annualLoss / Math.max(inputs.newPatientValue, 1));
  const recovered25 = annualLoss * 0.25;
  const recovered50 = annualLoss * 0.5;
  const recovered75 = annualLoss * 0.75;

  return {
    weeklyCancellationLoss,
    weeklyNoShowLoss,
    weeklyLoss,
    monthlyLoss,
    annualLoss,
    missedVisits,
    annualChairHours,
    hygieneAtRisk,
    treatmentAtRisk,
    newPatientsToOffset,
    recovered25,
    recovered50,
    recovered75,
  };
}

export function sanitizeNoShowCostInputs(
  inputs: NoShowCostCalculatorInputs
): NoShowCostCalculatorInputs {
  return {
    averageProduction: nonNegativeFinite(inputs.averageProduction),
    cancellationsPerWeek: nonNegativeFinite(inputs.cancellationsPerWeek),
    noShowsPerWeek: nonNegativeFinite(inputs.noShowsPerWeek),
    rebookingRate: clamp(nonNegativeFinite(inputs.rebookingRate), 0, 100),
    chairHoursPerVisit: nonNegativeFinite(inputs.chairHoursPerVisit),
    workingWeeks: nonNegativeFinite(inputs.workingWeeks),
    hygieneVisitValue: nonNegativeFinite(inputs.hygieneVisitValue),
    treatmentVisitValue: nonNegativeFinite(inputs.treatmentVisitValue),
    newPatientValue: nonNegativeFinite(inputs.newPatientValue),
  };
}

function nonNegativeFinite(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

