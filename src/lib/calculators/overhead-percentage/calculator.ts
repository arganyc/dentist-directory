import type {
  OverheadPercentageCalculatorInputs,
  OverheadPercentageCalculatorResults,
} from "./types";

export const OVERHEAD_BENCHMARK_LOW = 60;
export const OVERHEAD_BENCHMARK_HIGH = 65;

export const overheadPercentageInitialInputs: OverheadPercentageCalculatorInputs = {
  monthlyCollections: 90000,
  staffPayroll: 24000,
  facilityRent: 6000,
  labFees: 5000,
  supplies: 4000,
  otherOverhead: 5000,
};

export function calculateOverheadPercentage(
  rawInputs: OverheadPercentageCalculatorInputs
): OverheadPercentageCalculatorResults {
  const inputs = sanitizeOverheadPercentageInputs(rawInputs);
  const totalOverhead =
    inputs.staffPayroll + inputs.facilityRent + inputs.labFees + inputs.supplies + inputs.otherOverhead;
  const overheadPct = (totalOverhead / Math.max(inputs.monthlyCollections, 1)) * 100;
  const netBeforeOwnerPay = inputs.monthlyCollections - totalOverhead;
  const annualNet = netBeforeOwnerPay * 12;
  const annualOverhead = totalOverhead * 12;
  const annualCollections = inputs.monthlyCollections * 12;
  const vsBenchmark =
    overheadPct < OVERHEAD_BENCHMARK_LOW
      ? "below"
      : overheadPct > OVERHEAD_BENCHMARK_HIGH
        ? "above"
        : "within";

  return {
    totalOverhead,
    overheadPct,
    netBeforeOwnerPay,
    annualNet,
    annualOverhead,
    annualCollections,
    vsBenchmark,
  };
}

export function sanitizeOverheadPercentageInputs(
  inputs: OverheadPercentageCalculatorInputs
): OverheadPercentageCalculatorInputs {
  return {
    monthlyCollections: nonNegativeFinite(inputs.monthlyCollections),
    staffPayroll: nonNegativeFinite(inputs.staffPayroll),
    facilityRent: nonNegativeFinite(inputs.facilityRent),
    labFees: nonNegativeFinite(inputs.labFees),
    supplies: nonNegativeFinite(inputs.supplies),
    otherOverhead: nonNegativeFinite(inputs.otherOverhead),
  };
}

function nonNegativeFinite(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}
