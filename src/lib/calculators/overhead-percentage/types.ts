export type OverheadPercentageCalculatorInputs = {
  monthlyCollections: number;
  staffPayroll: number;
  facilityRent: number;
  labFees: number;
  supplies: number;
  otherOverhead: number;
};

export type OverheadBenchmarkStatus = "below" | "within" | "above";

export type OverheadPercentageCalculatorResults = {
  totalOverhead: number;
  overheadPct: number;
  netBeforeOwnerPay: number;
  annualNet: number;
  annualOverhead: number;
  annualCollections: number;
  vsBenchmark: OverheadBenchmarkStatus;
};

export type OverheadPercentageRecommendation = {
  title: string;
  description: string;
};
