import type {
  HygieneProductionBenchmarkStatus,
  HygieneProductionCalculatorInputs,
  HygieneProductionCalculatorResults,
} from "./types";

export const HYGIENE_PRODUCTION_BENCHMARK_LOW = 120;
export const HYGIENE_PRODUCTION_BENCHMARK_HIGH = 160;
export const HYGIENE_PRODUCTION_MIN_CHAIR_HOURS = 0.25;

export const hygieneProductionInitialInputs: HygieneProductionCalculatorInputs = {
  visitsPerDay: 9,
  avgProductionPerVisit: 165,
  chairHoursPerDay: 7,
  workingDaysPerWeek: 4,
  workingWeeksPerYear: 48,
};

export function calculateHygieneProduction(
  rawInputs: HygieneProductionCalculatorInputs
): HygieneProductionCalculatorResults {
  const inputs = sanitizeHygieneProductionInputs(rawInputs);
  const dailyProduction = inputs.visitsPerDay * inputs.avgProductionPerVisit;
  const hourlyProduction =
    dailyProduction / Math.max(inputs.chairHoursPerDay, HYGIENE_PRODUCTION_MIN_CHAIR_HOURS);
  const weeklyProduction = dailyProduction * inputs.workingDaysPerWeek;
  const annualProduction = weeklyProduction * inputs.workingWeeksPerYear;
  const monthlyProduction = annualProduction / 12;
  const vsBenchmark = getHygieneProductionBenchmarkStatus(hourlyProduction);

  return {
    dailyProduction,
    hourlyProduction,
    weeklyProduction,
    monthlyProduction,
    annualProduction,
    vsBenchmark,
  };
}

export function sanitizeHygieneProductionInputs(
  inputs: HygieneProductionCalculatorInputs
): HygieneProductionCalculatorInputs {
  return {
    visitsPerDay: nonNegativeFinite(inputs.visitsPerDay),
    avgProductionPerVisit: nonNegativeFinite(inputs.avgProductionPerVisit),
    chairHoursPerDay: nonNegativeFinite(inputs.chairHoursPerDay),
    workingDaysPerWeek: nonNegativeFinite(inputs.workingDaysPerWeek),
    workingWeeksPerYear: nonNegativeFinite(inputs.workingWeeksPerYear),
  };
}

function getHygieneProductionBenchmarkStatus(
  hourlyProduction: number
): HygieneProductionBenchmarkStatus {
  if (hourlyProduction < HYGIENE_PRODUCTION_BENCHMARK_LOW) return "below";
  if (hourlyProduction > HYGIENE_PRODUCTION_BENCHMARK_HIGH) return "above";
  return "within";
}

function nonNegativeFinite(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}
