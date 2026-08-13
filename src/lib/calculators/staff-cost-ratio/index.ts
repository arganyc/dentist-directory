export {
  calculateStaffCostRatio,
  sanitizeStaffCostRatioInputs,
  staffCostRatioInitialInputs,
  STAFF_COST_RATIO_BENCHMARK_HIGH,
  STAFF_COST_RATIO_BENCHMARK_LOW,
  STAFF_COST_RATIO_MIN_COLLECTIONS,
  STAFF_COST_RATIO_MIN_FTE,
} from "./calculator";
export { getStaffCostRatioRecommendations } from "./recommendations";
export type {
  StaffCostRatioBenchmarkStatus,
  StaffCostRatioCalculatorInputs,
  StaffCostRatioCalculatorResults,
  StaffCostRatioRecommendation,
} from "./types";
