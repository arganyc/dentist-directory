export type NoShowCostCalculatorInputs = {
  averageProduction: number;
  cancellationsPerWeek: number;
  noShowsPerWeek: number;
  rebookingRate: number;
  chairHoursPerVisit: number;
  workingWeeks: number;
  hygieneVisitValue: number;
  treatmentVisitValue: number;
  newPatientValue: number;
};

export type NoShowCostCalculatorResults = {
  weeklyCancellationLoss: number;
  weeklyNoShowLoss: number;
  weeklyLoss: number;
  monthlyLoss: number;
  annualLoss: number;
  missedVisits: number;
  annualChairHours: number;
  hygieneAtRisk: number;
  treatmentAtRisk: number;
  newPatientsToOffset: number;
  recovered25: number;
  recovered50: number;
  recovered75: number;
};

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
  inputs: NoShowCostCalculatorInputs
): NoShowCostCalculatorResults {
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
