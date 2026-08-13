import type {
  StaffCostRatioBenchmarkStatus,
  StaffCostRatioCalculatorInputs,
  StaffCostRatioCalculatorResults,
} from "./types";

export const STAFF_COST_RATIO_BENCHMARK_LOW = 25;
export const STAFF_COST_RATIO_BENCHMARK_HIGH = 30;
export const STAFF_COST_RATIO_MIN_COLLECTIONS = 1;
export const STAFF_COST_RATIO_MIN_FTE = 1;

export const staffCostRatioInitialInputs: StaffCostRatioCalculatorInputs = {
  monthlyCollections: 90000,
  totalStaffPayroll: 24000,
  fteStaffCount: 6,
};

export function calculateStaffCostRatio(
  rawInputs: StaffCostRatioCalculatorInputs
): StaffCostRatioCalculatorResults {
  const inputs = sanitizeStaffCostRatioInputs(rawInputs);
  const staffCostRatio =
    (inputs.totalStaffPayroll / Math.max(inputs.monthlyCollections, STAFF_COST_RATIO_MIN_COLLECTIONS)) *
    100;
  const payrollPerFte =
    inputs.totalStaffPayroll / Math.max(inputs.fteStaffCount, STAFF_COST_RATIO_MIN_FTE);
  const annualPayroll = inputs.totalStaffPayroll * 12;
  const vsBenchmark = getStaffCostRatioBenchmarkStatus(staffCostRatio);

  return {
    staffCostRatio,
    payrollPerFte,
    annualPayroll,
    vsBenchmark,
  };
}

export function sanitizeStaffCostRatioInputs(
  inputs: StaffCostRatioCalculatorInputs
): StaffCostRatioCalculatorInputs {
  return {
    monthlyCollections: nonNegativeFinite(inputs.monthlyCollections),
    totalStaffPayroll: nonNegativeFinite(inputs.totalStaffPayroll),
    fteStaffCount: nonNegativeFinite(inputs.fteStaffCount),
  };
}

function getStaffCostRatioBenchmarkStatus(
  staffCostRatio: number
): StaffCostRatioBenchmarkStatus {
  if (staffCostRatio < STAFF_COST_RATIO_BENCHMARK_LOW) return "below";
  if (staffCostRatio > STAFF_COST_RATIO_BENCHMARK_HIGH) return "above";
  return "within";
}

function nonNegativeFinite(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}
