export type PatientAcquisitionCostCalculatorInputs = {
  monthlyMarketingSpend: number;
  newPatientsPerMonth: number;
  avgAnnualPatientValue: number;
  avgRetentionYears: number;
};

export type PatientAcquisitionCostCalculatorResults = {
  cac: number;
  lifetimeValue: number;
  ltvToCacRatio: number;
  paybackMonths: number;
  annualMarketingSpend: number;
  annualNewPatients: number;
  healthLabel: "healthy" | "workable" | "tight";
};

export type PatientAcquisitionCostRecommendation = {
  title: string;
  description: string;
};

