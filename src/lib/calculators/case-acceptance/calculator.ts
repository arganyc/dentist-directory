import type {
  CaseAcceptanceCalculatorInputs,
  CaseAcceptanceCalculatorResults,
} from "./types";

export const caseAcceptanceInitialInputs: CaseAcceptanceCalculatorInputs = {
  plansPresentedPerMonth: 45,
  averageCaseValue: 1400,
  currentAcceptanceRate: 45,
  targetAcceptanceRate: 65,
};

export function calculateCaseAcceptance(
  rawInputs: CaseAcceptanceCalculatorInputs
): CaseAcceptanceCalculatorResults {
  const inputs = sanitizeCaseAcceptanceInputs(rawInputs);
  const currentRate = inputs.currentAcceptanceRate / 100;
  const targetRate = inputs.targetAcceptanceRate / 100;
  const acceptedCases = inputs.plansPresentedPerMonth * currentRate;
  const acceptedValue = acceptedCases * inputs.averageCaseValue;
  const unacceptedCases = inputs.plansPresentedPerMonth * (1 - currentRate);
  const lostValueMonthly = unacceptedCases * inputs.averageCaseValue;
  const lostValueAnnual = lostValueMonthly * 12;
  const targetAcceptedCases = inputs.plansPresentedPerMonth * targetRate;
  const targetProduction = targetAcceptedCases * inputs.averageCaseValue;
  const upliftMonthly = Math.max(targetProduction - acceptedValue, 0);
  const upliftAnnual = upliftMonthly * 12;

  return {
    acceptedCases,
    acceptedValue,
    unacceptedCases,
    lostValueMonthly,
    lostValueAnnual,
    targetAcceptedCases,
    targetProduction,
    upliftMonthly,
    upliftAnnual,
  };
}

export function sanitizeCaseAcceptanceInputs(
  inputs: CaseAcceptanceCalculatorInputs
): CaseAcceptanceCalculatorInputs {
  return {
    plansPresentedPerMonth: nonNegativeFinite(inputs.plansPresentedPerMonth),
    averageCaseValue: nonNegativeFinite(inputs.averageCaseValue),
    currentAcceptanceRate: percentage(inputs.currentAcceptanceRate),
    targetAcceptanceRate: percentage(inputs.targetAcceptanceRate),
  };
}

function nonNegativeFinite(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

function percentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}
