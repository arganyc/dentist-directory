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

export type NoShowCostRecommendation = {
  title: string;
  description: string;
};

