import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  calculateStaffCostRatio,
  staffCostRatioInitialInputs,
  STAFF_COST_RATIO_BENCHMARK_HIGH,
  STAFF_COST_RATIO_BENCHMARK_LOW,
  STAFF_COST_RATIO_MIN_COLLECTIONS,
  STAFF_COST_RATIO_MIN_FTE,
} from "../src/lib/calculators/staff-cost-ratio/index.ts";
import { getDentistSuccessHubTool } from "../src/lib/dentist-success-hub-tools.ts";

const sharedCalculatorModule = new URL(
  "../src/lib/calculators/staff-cost-ratio/calculator.ts",
  import.meta.url
);
const sharedCalculatorTypes = new URL(
  "../src/lib/calculators/staff-cost-ratio/types.ts",
  import.meta.url
);
const sharedCalculatorRecommendations = new URL(
  "../src/lib/calculators/staff-cost-ratio/recommendations.ts",
  import.meta.url
);
const legacyCalculatorComponent = new URL(
  "../src/app/tools/member/staff-cost-ratio-calculator/StaffCostRatioCalculator.tsx",
  import.meta.url
);
const legacyCalculatorRoute = new URL(
  "../src/app/tools/member/staff-cost-ratio-calculator/page.tsx",
  import.meta.url
);
const memberToolsLayout = new URL("../src/app/tools/member/layout.tsx", import.meta.url);
const hubToolRoute = new URL("../src/app/dentist-success-hub/tools/[slug]/page.tsx", import.meta.url);
const hubCalculatorWorkspace = new URL(
  "../src/components/staff-cost-ratio-calculator-workspace.tsx",
  import.meta.url
);
const srcRoot = fileURLToPath(new URL("../src", import.meta.url));

test("shared staff cost formula preserves legacy default outputs", () => {
  const results = calculateStaffCostRatio(staffCostRatioInitialInputs);

  assertAlmostEqual(results.staffCostRatio, 26.666666666666668);
  assert.equal(results.payrollPerFte, 4000);
  assert.equal(results.annualPayroll, 288000);
  assert.equal(results.vsBenchmark, "within");
});

test("shared staff cost formula handles zero collections safely", () => {
  const results = calculateStaffCostRatio({
    monthlyCollections: 0,
    totalStaffPayroll: 24000,
    fteStaffCount: 6,
  });

  assert.equal(STAFF_COST_RATIO_MIN_COLLECTIONS, 1);
  assert.equal(results.staffCostRatio, 2400000);
  assert.equal(Number.isFinite(results.staffCostRatio), true);
  assert.equal(results.vsBenchmark, "above");
});

test("shared staff cost formula handles zero payroll safely", () => {
  const results = calculateStaffCostRatio({
    ...staffCostRatioInitialInputs,
    totalStaffPayroll: 0,
  });

  assert.equal(results.staffCostRatio, 0);
  assert.equal(results.payrollPerFte, 0);
  assert.equal(results.annualPayroll, 0);
  assert.equal(results.vsBenchmark, "below");
});

test("shared staff cost formula handles zero FTE safely", () => {
  const results = calculateStaffCostRatio({
    monthlyCollections: 90000,
    totalStaffPayroll: 24000,
    fteStaffCount: 0,
  });

  assert.equal(STAFF_COST_RATIO_MIN_FTE, 1);
  assert.equal(results.payrollPerFte, 24000);
  assert.equal(Number.isFinite(results.payrollPerFte), true);
});

test("shared staff cost formula identifies low ratio", () => {
  const results = calculateStaffCostRatio({
    monthlyCollections: 100000,
    totalStaffPayroll: 20000,
    fteStaffCount: 5,
  });

  assert.equal(results.staffCostRatio, 20);
  assert.equal(results.payrollPerFte, 4000);
  assert.equal(results.vsBenchmark, "below");
});

test("shared staff cost formula identifies high ratio", () => {
  const results = calculateStaffCostRatio({
    monthlyCollections: 100000,
    totalStaffPayroll: 35000,
    fteStaffCount: 7,
  });

  assert.equal(results.staffCostRatio, 35);
  assert.equal(results.payrollPerFte, 5000);
  assert.equal(results.vsBenchmark, "above");
});

test("shared staff cost formula handles benchmark boundaries", () => {
  const withinLow = calculateStaffCostRatio({
    monthlyCollections: 100000,
    totalStaffPayroll: 25000,
    fteStaffCount: 5,
  });
  const withinHigh = calculateStaffCostRatio({
    monthlyCollections: 100000,
    totalStaffPayroll: 30000,
    fteStaffCount: 5,
  });

  assert.equal(STAFF_COST_RATIO_BENCHMARK_LOW, 25);
  assert.equal(STAFF_COST_RATIO_BENCHMARK_HIGH, 30);
  assert.equal(withinLow.staffCostRatio, 25);
  assert.equal(withinLow.vsBenchmark, "within");
  assert.equal(withinHigh.staffCostRatio, 30);
  assert.equal(withinHigh.vsBenchmark, "within");
});

test("shared staff cost formula sanitizes invalid inputs safely", () => {
  const results = calculateStaffCostRatio({
    monthlyCollections: Number.NaN,
    totalStaffPayroll: Number.POSITIVE_INFINITY,
    fteStaffCount: Number.NEGATIVE_INFINITY,
  });

  assert.equal(results.staffCostRatio, 0);
  assert.equal(results.payrollPerFte, 0);
  assert.equal(results.annualPayroll, 0);
  assert.equal(results.vsBenchmark, "below");
});

test("shared staff cost formula calculates payroll per FTE and annual payroll", () => {
  const results = calculateStaffCostRatio({
    monthlyCollections: 120000,
    totalStaffPayroll: 36000,
    fteStaffCount: 9,
  });

  assert.equal(results.payrollPerFte, 4000);
  assert.equal(results.annualPayroll, 432000);
  assert.equal(results.staffCostRatio, 30);
});

test("staff cost ratio calculator module uses the shared calculator architecture", () => {
  assert.equal(existsSync(sharedCalculatorModule), true);
  assert.equal(existsSync(sharedCalculatorTypes), true);
  assert.equal(existsSync(sharedCalculatorRecommendations), true);

  const calculatorSource = readFileSync(sharedCalculatorModule, "utf8");
  const typesSource = readFileSync(sharedCalculatorTypes, "utf8");
  const recommendationsSource = readFileSync(sharedCalculatorRecommendations, "utf8");

  assert.match(calculatorSource, /export function calculateStaffCostRatio/);
  assert.match(calculatorSource, /sanitizeStaffCostRatioInputs/);
  assert.match(typesSource, /export type StaffCostRatioCalculatorInputs/);
  assert.match(typesSource, /export type StaffCostRatioCalculatorResults/);
  assert.match(recommendationsSource, /export function getStaffCostRatioRecommendations/);
  assert.doesNotMatch(calculatorSource, /useState|useMemo|window|document|React/);
});

test("legacy Staff Cost Ratio route remains protected by member tools access", () => {
  const routeSource = readFileSync(legacyCalculatorRoute, "utf8");
  const componentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const layoutSource = readFileSync(memberToolsLayout, "utf8");

  assert.equal(existsSync(legacyCalculatorRoute), true);
  assert.match(routeSource, /StaffCostRatioCalculator/);
  assert.match(componentSource, /calculateStaffCostRatio/);
  assert.match(componentSource, /@\/lib\/calculators\/staff-cost-ratio/);
  assert.match(layoutSource, /getToolsAccess/);
  assert.match(layoutSource, /Claim your listing to unlock these tools/);
});

test("Dentist Success Hub staff cost ratio route renders a real calculator workspace", () => {
  const routeSource = readFileSync(hubToolRoute, "utf8");
  const workspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");
  const registryTool = getDentistSuccessHubTool("staff-cost-ratio-calculator");

  assert.equal(registryTool?.status, "active");
  assert.match(routeSource, /StaffCostRatioCalculatorWorkspace/);
  assert.match(routeSource, /tool\.slug === "staff-cost-ratio-calculator"/);
  assert.match(workspaceSource, /CalculatorShell/);
  assert.match(workspaceSource, /CalculatorFieldGrid/);
  assert.match(workspaceSource, /CalculatorActionBar/);
  assert.match(workspaceSource, /calculateStaffCostRatio/);
  assert.match(workspaceSource, /getStaffCostRatioRecommendations/);
  assert.match(workspaceSource, /Claim your listing/);
  assert.match(workspaceSource, /does not provide employment-law/);
});

test("staff cost ratio calculation logic exists only in the shared pure module", () => {
  const sourceFiles = listSourceFiles(srcRoot);
  const definitions = sourceFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .filter((source) => /function calculateStaffCostRatio/.test(source));

  const legacyComponentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const hubRouteSource = readFileSync(hubToolRoute, "utf8");
  const hubWorkspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");

  assert.equal(definitions.length, 1);
  assert.doesNotMatch(legacyComponentSource, /const staffCostRatio\s*=/);
  assert.doesNotMatch(legacyComponentSource, /const payrollPerFte\s*=/);
  assert.doesNotMatch(hubRouteSource, /const staffCostRatio\s*=/);
  assert.doesNotMatch(hubWorkspaceSource, /const staffCostRatio\s*=/);
});

function listSourceFiles(directoryPath: string): string[] {
  return readdirSync(directoryPath).flatMap((name) => {
    const childPath = join(directoryPath, name);
    const stats = statSync(childPath);
    if (stats.isDirectory()) return listSourceFiles(childPath);
    return /\.(ts|tsx)$/.test(name) ? [childPath] : [];
  });
}

function assertAlmostEqual(actual: number, expected: number): void {
  assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} should equal ${expected}`);
}
