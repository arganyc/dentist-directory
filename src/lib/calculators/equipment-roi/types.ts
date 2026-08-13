export type EquipmentRoiCalculatorInputs = {
  equipmentCost: number;
  monthlyIncrementalRevenue: number;
  monthlyOperatingCost: number;
  financingMonths: number;
};

export type EquipmentRoiCalculatorResults = {
  monthlyLoanPayment: number;
  netMonthlyBenefitPreLoan: number;
  netMonthlyBenefit: number;
  breakEvenMonths: number;
  breakEvenReached: boolean;
  annualBenefitPreLoan: number;
  fiveYearReturn: number;
  fiveYearRoiPct: number;
};

export type EquipmentRoiRecommendation = {
  title: string;
  description: string;
};
