import type { PpoFeeReductionCalculatorInputs, PpoFeeReductionCalculatorResults } from "./types";

export const ppoFeeReductionInitialInputs: PpoFeeReductionCalculatorInputs = {
  monthlyBilledProduction: 90000,
  inNetworkPatientPct: 70,
  inNetworkAdjustmentPct: 28,
  outNetworkAdjustmentPct: 8,
};

export function calculatePpoFeeReduction(
  rawInputs: PpoFeeReductionCalculatorInputs
): PpoFeeReductionCalculatorResults {
  const inputs = sanitizePpoFeeReductionInputs(rawInputs);
  const inNetworkShare = inputs.inNetworkPatientPct / 100;
  const inNetworkBilled = inputs.monthlyBilledProduction * inNetworkShare;
  const outNetworkBilled = inputs.monthlyBilledProduction * (1 - inNetworkShare);
  const inNetworkWriteOff = inNetworkBilled * (inputs.inNetworkAdjustmentPct / 100);
  const outNetworkWriteOff = outNetworkBilled * (inputs.outNetworkAdjustmentPct / 100);
  const totalWriteOff = inNetworkWriteOff + outNetworkWriteOff;
  const collectedProduction = inputs.monthlyBilledProduction - totalWriteOff;
  const writeOffPct = (totalWriteOff / Math.max(inputs.monthlyBilledProduction, 1)) * 100;
  const annualWriteOff = totalWriteOff * 12;

  return {
    inNetworkBilled,
    outNetworkBilled,
    inNetworkWriteOff,
    outNetworkWriteOff,
    totalWriteOff,
    collectedProduction,
    writeOffPct,
    annualWriteOff,
  };
}

export function sanitizePpoFeeReductionInputs(
  inputs: PpoFeeReductionCalculatorInputs
): PpoFeeReductionCalculatorInputs {
  return {
    monthlyBilledProduction: nonNegativeFinite(inputs.monthlyBilledProduction),
    inNetworkPatientPct: percentage(inputs.inNetworkPatientPct),
    inNetworkAdjustmentPct: percentage(inputs.inNetworkAdjustmentPct),
    outNetworkAdjustmentPct: percentage(inputs.outNetworkAdjustmentPct),
  };
}

function nonNegativeFinite(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

function percentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}

