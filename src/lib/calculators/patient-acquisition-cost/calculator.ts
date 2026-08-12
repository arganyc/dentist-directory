import type {
  PatientAcquisitionCostCalculatorInputs,
  PatientAcquisitionCostCalculatorResults,
} from "./types";

export const patientAcquisitionCostInitialInputs: PatientAcquisitionCostCalculatorInputs = {
  monthlyMarketingSpend: 2500,
  newPatientsPerMonth: 14,
  avgAnnualPatientValue: 750,
  avgRetentionYears: 6,
};

export function calculatePatientAcquisitionCost(
  rawInputs: PatientAcquisitionCostCalculatorInputs
): PatientAcquisitionCostCalculatorResults {
  const inputs = sanitizePatientAcquisitionCostInputs(rawInputs);
  const cac = inputs.monthlyMarketingSpend / Math.max(inputs.newPatientsPerMonth, 1);
  const lifetimeValue = inputs.avgAnnualPatientValue * inputs.avgRetentionYears;
  const ltvToCacRatio = lifetimeValue / Math.max(cac, 1);
  const paybackMonths = cac / Math.max(inputs.avgAnnualPatientValue / 12, 1);
  const annualMarketingSpend = inputs.monthlyMarketingSpend * 12;
  const annualNewPatients = inputs.newPatientsPerMonth * 12;
  const healthLabel = ltvToCacRatio >= 3 ? "healthy" : ltvToCacRatio >= 1.5 ? "workable" : "tight";

  return {
    cac,
    lifetimeValue,
    ltvToCacRatio,
    paybackMonths,
    annualMarketingSpend,
    annualNewPatients,
    healthLabel,
  };
}

export function sanitizePatientAcquisitionCostInputs(
  inputs: PatientAcquisitionCostCalculatorInputs
): PatientAcquisitionCostCalculatorInputs {
  return {
    monthlyMarketingSpend: nonNegativeFinite(inputs.monthlyMarketingSpend),
    newPatientsPerMonth: nonNegativeFinite(inputs.newPatientsPerMonth),
    avgAnnualPatientValue: nonNegativeFinite(inputs.avgAnnualPatientValue),
    avgRetentionYears: nonNegativeFinite(inputs.avgRetentionYears),
  };
}

function nonNegativeFinite(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

