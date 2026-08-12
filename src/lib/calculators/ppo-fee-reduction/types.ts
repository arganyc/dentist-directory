export type PpoFeeReductionCalculatorInputs = {
  monthlyBilledProduction: number;
  inNetworkPatientPct: number;
  inNetworkAdjustmentPct: number;
  outNetworkAdjustmentPct: number;
};

export type PpoFeeReductionCalculatorResults = {
  inNetworkBilled: number;
  outNetworkBilled: number;
  inNetworkWriteOff: number;
  outNetworkWriteOff: number;
  totalWriteOff: number;
  collectedProduction: number;
  writeOffPct: number;
  annualWriteOff: number;
};

export type PpoFeeReductionRecommendation = {
  title: string;
  description: string;
};

