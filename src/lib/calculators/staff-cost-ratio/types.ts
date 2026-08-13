export type StaffCostRatioCalculatorInputs = {
  monthlyCollections: number;
  totalStaffPayroll: number;
  fteStaffCount: number;
};

export type StaffCostRatioBenchmarkStatus = "below" | "within" | "above";

export type StaffCostRatioCalculatorResults = {
  staffCostRatio: number;
  payrollPerFte: number;
  annualPayroll: number;
  vsBenchmark: StaffCostRatioBenchmarkStatus;
};

export type StaffCostRatioRecommendation = {
  title: string;
  description: string;
};
