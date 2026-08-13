import type {
  EquipmentRoiCalculatorInputs,
  EquipmentRoiCalculatorResults,
} from "./types";

export const EQUIPMENT_ROI_MIN_BREAK_EVEN_DENOMINATOR = 1;

export const equipmentRoiInitialInputs: EquipmentRoiCalculatorInputs = {
  equipmentCost: 35000,
  monthlyIncrementalRevenue: 3200,
  monthlyOperatingCost: 300,
  financingMonths: 36,
};

export function calculateEquipmentRoi(
  rawInputs: EquipmentRoiCalculatorInputs
): EquipmentRoiCalculatorResults {
  const inputs = sanitizeEquipmentRoiInputs(rawInputs);
  const monthlyLoanPayment =
    inputs.financingMonths > 0 ? inputs.equipmentCost / inputs.financingMonths : 0;
  const netMonthlyBenefitPreLoan =
    inputs.monthlyIncrementalRevenue - inputs.monthlyOperatingCost;
  const netMonthlyBenefit = netMonthlyBenefitPreLoan - monthlyLoanPayment;
  const breakEvenMonths =
    inputs.equipmentCost /
    Math.max(netMonthlyBenefitPreLoan, EQUIPMENT_ROI_MIN_BREAK_EVEN_DENOMINATOR);
  const annualBenefitPreLoan = netMonthlyBenefitPreLoan * 12;
  const fiveYearReturn = netMonthlyBenefitPreLoan * 60 - inputs.equipmentCost;
  const fiveYearRoiPct =
    inputs.equipmentCost > 0 ? (fiveYearReturn / inputs.equipmentCost) * 100 : 0;
  const breakEvenReached = inputs.equipmentCost <= 0 || netMonthlyBenefitPreLoan > 0;

  return {
    monthlyLoanPayment,
    netMonthlyBenefitPreLoan,
    netMonthlyBenefit,
    breakEvenMonths,
    breakEvenReached,
    annualBenefitPreLoan,
    fiveYearReturn,
    fiveYearRoiPct,
  };
}

export function sanitizeEquipmentRoiInputs(
  inputs: EquipmentRoiCalculatorInputs
): EquipmentRoiCalculatorInputs {
  return {
    equipmentCost: nonNegativeFinite(inputs.equipmentCost),
    monthlyIncrementalRevenue: nonNegativeFinite(inputs.monthlyIncrementalRevenue),
    monthlyOperatingCost: nonNegativeFinite(inputs.monthlyOperatingCost),
    financingMonths: nonNegativeFinite(inputs.financingMonths),
  };
}

function nonNegativeFinite(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}
