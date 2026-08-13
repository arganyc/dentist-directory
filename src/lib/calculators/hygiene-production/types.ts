export type HygieneProductionCalculatorInputs = {
  visitsPerDay: number;
  avgProductionPerVisit: number;
  chairHoursPerDay: number;
  workingDaysPerWeek: number;
  workingWeeksPerYear: number;
};

export type HygieneProductionBenchmarkStatus = "below" | "within" | "above";

export type HygieneProductionCalculatorResults = {
  dailyProduction: number;
  hourlyProduction: number;
  weeklyProduction: number;
  monthlyProduction: number;
  annualProduction: number;
  vsBenchmark: HygieneProductionBenchmarkStatus;
};

export type HygieneProductionRecommendation = {
  title: string;
  description: string;
};
