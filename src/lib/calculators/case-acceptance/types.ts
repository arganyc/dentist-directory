export type CaseAcceptanceCalculatorInputs = {
  plansPresentedPerMonth: number;
  averageCaseValue: number;
  currentAcceptanceRate: number;
  targetAcceptanceRate: number;
};

export type CaseAcceptanceCalculatorResults = {
  acceptedCases: number;
  acceptedValue: number;
  unacceptedCases: number;
  lostValueMonthly: number;
  lostValueAnnual: number;
  targetAcceptedCases: number;
  targetProduction: number;
  upliftMonthly: number;
  upliftAnnual: number;
};

export type CaseAcceptanceRecommendation = {
  title: string;
  description: string;
};
