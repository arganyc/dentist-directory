import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  calculateOverheadPercentage,
  overheadPercentageInitialInputs,
  OVERHEAD_BENCHMARK_HIGH,
  OVERHEAD_BENCHMARK_LOW,
} from "../src/lib/calculators/overhead-percentage/index.ts";
import { getDentistSuccessHubTool } from "../src/lib/dentist-success-hub-tools.ts";

const sharedCalculatorModule = new URL(
  "../src/lib/calculators/overhead-percentage/calculator.ts",
  import.meta.url
);
const sharedCalculatorTypes = new URL(
  "../src/lib/calculators/overhead-percentage/types.ts",
  import.meta.url
);
const sharedCalculatorRecommendations = new URL(
  "../src/lib/calculators/overhead-percentage/recommendations.ts",
  import.meta.url
);
const legacyCalculatorComponent = new URL(
  "../src/app/tools/member/overhead-percentage-calculator/OverheadCalculator.tsx",
  import.meta.url
);
const legacyCalculatorRoute = new URL(
  "../src/app/tools/member/overhead-percentage-calculator/page.tsx",
  import.meta.url
);
const memberToolsLayout = new URL("../src/app/tools/member/layout.tsx", import.meta.url);
const hubToolRoute = new URL("../src/app/dentist-success-hub/tools/[slug]/page.tsx", import.meta.url);
const hubCalculatorWorkspace = new URL(
  "../src/components/overhead-percentage-calculator-workspace.tsx",
  import.meta.url
);
const srcRoot = fileURLToPath(new URL("../src", import.meta.url));

test("shared overhead formula preserves legacy default outputs", () => {
  const results = calculateOverheadPercentage(overheadPercentageInitialInputs);

  assert.equal(results.totalOverhead, 44000);
  assertAlmostEqual(results.overheadPct, 48.888888888888886);
  assert.equal(results.netBeforeOwnerPay, 46000);
  assert.equal(results.annualNet, 552000);
  assert.equal(results.annualOverhead, 528000);
  assert.equal(results.annualCollections, 1080000);
  assert.equal(results.vsBenchmark, "below");
});

test("shared overhead formula handles zero collections safely", () => {
  const results = calculateOverheadPercentage({
    monthlyCollections: 0,
    staffPayroll: 1000,
    facilityRent: 500,
    labFees: 0,
    supplies: 0,
    otherOverhead: 0,
  });

  assert.equal(results.totalOverhead, 1500);
  assert.equal(results.netBeforeOwnerPay, -1500);
  assert.equal(results.annualNet, -18000);
  assert.equal(Number.isFinite(results.overheadPct), true);
  assert.equal(results.vsBenchmark, "above");
});

test("shared overhead formula identifies high payroll overhead", () => {
  const results = calculateOverheadPercentage({
    monthlyCollections: 90000,
    staffPayroll: 60000,
    facilityRent: 6000,
    labFees: 5000,
    supplies: 4000,
    otherOverhead: 5000,
  });

  assert.equal(results.totalOverhead, 80000);
  assertAlmostEqual(results.overheadPct, 88.88888888888889);
  assert.equal(results.netBeforeOwnerPay, 10000);
  assert.equal(results.vsBenchmark, "above");
});

test("shared overhead formula identifies low overhead", () => {
  const results = calculateOverheadPercentage({
    monthlyCollections: 100000,
    staffPayroll: 15000,
    facilityRent: 5000,
    labFees: 3000,
    supplies: 3000,
    otherOverhead: 4000,
  });

  assert.equal(results.totalOverhead, 30000);
  assert.equal(results.overheadPct, 30);
  assert.equal(results.netBeforeOwnerPay, 70000);
  assert.equal(results.vsBenchmark, "below");
});

test("shared overhead formula handles benchmark boundary calculations", () => {
  const withinLow = calculateOverheadPercentage({
    monthlyCollections: 100000,
    staffPayroll: 60000,
    facilityRent: 0,
    labFees: 0,
    supplies: 0,
    otherOverhead: 0,
  });
  const withinHigh = calculateOverheadPercentage({
    monthlyCollections: 100000,
    staffPayroll: 65000,
    facilityRent: 0,
    labFees: 0,
    supplies: 0,
    otherOverhead: 0,
  });

  assert.equal(OVERHEAD_BENCHMARK_LOW, 60);
  assert.equal(OVERHEAD_BENCHMARK_HIGH, 65);
  assert.equal(withinLow.overheadPct, 60);
  assert.equal(withinLow.vsBenchmark, "within");
  assert.equal(withinHigh.overheadPct, 65);
  assert.equal(withinHigh.vsBenchmark, "within");
});

test("shared overhead formula sanitizes invalid inputs safely", () => {
  const results = calculateOverheadPercentage({
    monthlyCollections: Number.NaN,
    staffPayroll: Number.POSITIVE_INFINITY,
    facilityRent: -500,
    labFees: Number.NEGATIVE_INFINITY,
    supplies: -1,
    otherOverhead: -100,
  });

  assert.equal(results.totalOverhead, 0);
  assert.equal(results.overheadPct, 0);
  assert.equal(results.netBeforeOwnerPay, 0);
  assert.equal(results.annualNet, 0);
  assert.equal(results.annualOverhead, 0);
  assert.equal(results.annualCollections, 0);
  assert.equal(results.vsBenchmark, "below");
});

test("overhead calculator module uses the shared calculator architecture", () => {
  assert.equal(existsSync(sharedCalculatorModule), true);
  assert.equal(existsSync(sharedCalculatorTypes), true);
  assert.equal(existsSync(sharedCalculatorRecommendations), true);

  const calculatorSource = readFileSync(sharedCalculatorModule, "utf8");
  const typesSource = readFileSync(sharedCalculatorTypes, "utf8");
  const recommendationsSource = readFileSync(sharedCalculatorRecommendations, "utf8");

  assert.match(calculatorSource, /export function calculateOverheadPercentage/);
  assert.match(calculatorSource, /sanitizeOverheadPercentageInputs/);
  assert.match(typesSource, /export type OverheadPercentageCalculatorInputs/);
  assert.match(typesSource, /export type OverheadPercentageCalculatorResults/);
  assert.match(recommendationsSource, /export function getOverheadPercentageRecommendations/);
  assert.doesNotMatch(calculatorSource, /useState|useMemo|window|document|React/);
});

test("legacy Overhead Percentage route remains protected by member tools access", () => {
  const routeSource = readFileSync(legacyCalculatorRoute, "utf8");
  const componentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const layoutSource = readFileSync(memberToolsLayout, "utf8");

  assert.equal(existsSync(legacyCalculatorRoute), true);
  assert.match(routeSource, /OverheadCalculator/);
  assert.match(componentSource, /calculateOverheadPercentage/);
  assert.match(componentSource, /@\/lib\/calculators\/overhead-percentage/);
  assert.match(layoutSource, /getToolsAccess/);
  assert.match(layoutSource, /Claim your listing to unlock these tools/);
});

test("Dentist Success Hub overhead route renders a real calculator workspace", () => {
  const routeSource = readFileSync(hubToolRoute, "utf8");
  const workspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");
  const registryTool = getDentistSuccessHubTool("overhead-percentage-calculator");

  assert.equal(registryTool?.status, "active");
  assert.match(routeSource, /OverheadPercentageCalculatorWorkspace/);
  assert.match(routeSource, /tool\.slug === "overhead-percentage-calculator"/);
  assert.match(routeSource, /overhead-percentage-calculator/);
  assert.match(workspaceSource, /CalculatorShell/);
  assert.match(workspaceSource, /CalculatorFieldGrid/);
  assert.match(workspaceSource, /CalculatorActionBar/);
  assert.match(workspaceSource, /calculateOverheadPercentage/);
  assert.match(workspaceSource, /getOverheadPercentageRecommendations/);
  assert.match(workspaceSource, /Claim your listing/);
  assert.match(workspaceSource, /Owner compensation is excluded/);
});

test("overhead calculation logic exists only in the shared pure module", () => {
  const sourceFiles = listSourceFiles(srcRoot);
  const definitions = sourceFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .filter((source) => /function calculateOverheadPercentage/.test(source));

  const legacyComponentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const hubRouteSource = readFileSync(hubToolRoute, "utf8");
  const hubWorkspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");

  assert.equal(definitions.length, 1);
  assert.doesNotMatch(legacyComponentSource, /const totalOverhead\s*=/);
  assert.doesNotMatch(legacyComponentSource, /const overheadPct\s*=/);
  assert.doesNotMatch(hubRouteSource, /const totalOverhead\s*=/);
  assert.doesNotMatch(hubWorkspaceSource, /const totalOverhead\s*=/);
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
