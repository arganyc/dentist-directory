import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  calculateHygieneProduction,
  hygieneProductionInitialInputs,
  HYGIENE_PRODUCTION_BENCHMARK_HIGH,
  HYGIENE_PRODUCTION_BENCHMARK_LOW,
  HYGIENE_PRODUCTION_MIN_CHAIR_HOURS,
} from "../src/lib/calculators/hygiene-production/index.ts";
import { getDentistSuccessHubTool } from "../src/lib/dentist-success-hub-tools.ts";

const sharedCalculatorModule = new URL(
  "../src/lib/calculators/hygiene-production/calculator.ts",
  import.meta.url
);
const sharedCalculatorTypes = new URL(
  "../src/lib/calculators/hygiene-production/types.ts",
  import.meta.url
);
const sharedCalculatorRecommendations = new URL(
  "../src/lib/calculators/hygiene-production/recommendations.ts",
  import.meta.url
);
const legacyCalculatorComponent = new URL(
  "../src/app/tools/member/hygiene-production-calculator/HygieneProductionCalculator.tsx",
  import.meta.url
);
const legacyCalculatorRoute = new URL(
  "../src/app/tools/member/hygiene-production-calculator/page.tsx",
  import.meta.url
);
const memberToolsLayout = new URL("../src/app/tools/member/layout.tsx", import.meta.url);
const hubToolRoute = new URL("../src/app/dentist-success-hub/tools/[slug]/page.tsx", import.meta.url);
const hubCalculatorWorkspace = new URL(
  "../src/components/hygiene-production-calculator-workspace.tsx",
  import.meta.url
);
const srcRoot = fileURLToPath(new URL("../src", import.meta.url));

test("shared hygiene production formula preserves legacy default outputs", () => {
  const results = calculateHygieneProduction(hygieneProductionInitialInputs);

  assert.equal(results.dailyProduction, 1485);
  assertAlmostEqual(results.hourlyProduction, 212.14285714285714);
  assert.equal(results.weeklyProduction, 5940);
  assert.equal(results.monthlyProduction, 23760);
  assert.equal(results.annualProduction, 285120);
  assert.equal(results.vsBenchmark, "above");
});

test("shared hygiene production formula handles zero visits safely", () => {
  const results = calculateHygieneProduction({
    ...hygieneProductionInitialInputs,
    visitsPerDay: 0,
  });

  assert.equal(results.dailyProduction, 0);
  assert.equal(results.hourlyProduction, 0);
  assert.equal(results.weeklyProduction, 0);
  assert.equal(results.annualProduction, 0);
  assert.equal(results.vsBenchmark, "below");
});

test("shared hygiene production formula handles zero chair hours without infinity", () => {
  const results = calculateHygieneProduction({
    visitsPerDay: 8,
    avgProductionPerVisit: 150,
    chairHoursPerDay: 0,
    workingDaysPerWeek: 4,
    workingWeeksPerYear: 48,
  });

  assert.equal(HYGIENE_PRODUCTION_MIN_CHAIR_HOURS, 0.25);
  assert.equal(results.dailyProduction, 1200);
  assert.equal(results.hourlyProduction, 4800);
  assert.equal(Number.isFinite(results.hourlyProduction), true);
});

test("shared hygiene production formula handles zero production per visit safely", () => {
  const results = calculateHygieneProduction({
    ...hygieneProductionInitialInputs,
    avgProductionPerVisit: 0,
  });

  assert.equal(results.dailyProduction, 0);
  assert.equal(results.hourlyProduction, 0);
  assert.equal(results.weeklyProduction, 0);
  assert.equal(results.annualProduction, 0);
  assert.equal(results.vsBenchmark, "below");
});

test("shared hygiene production formula identifies low hourly production", () => {
  const results = calculateHygieneProduction({
    visitsPerDay: 4,
    avgProductionPerVisit: 80,
    chairHoursPerDay: 10,
    workingDaysPerWeek: 4,
    workingWeeksPerYear: 48,
  });

  assert.equal(results.dailyProduction, 320);
  assert.equal(results.hourlyProduction, 32);
  assert.equal(results.vsBenchmark, "below");
});

test("shared hygiene production formula identifies high hourly production", () => {
  const results = calculateHygieneProduction({
    visitsPerDay: 12,
    avgProductionPerVisit: 250,
    chairHoursPerDay: 6,
    workingDaysPerWeek: 4,
    workingWeeksPerYear: 48,
  });

  assert.equal(results.dailyProduction, 3000);
  assert.equal(results.hourlyProduction, 500);
  assert.equal(results.vsBenchmark, "above");
});

test("shared hygiene production formula identifies benchmark boundary behavior", () => {
  const withinLow = calculateHygieneProduction({
    visitsPerDay: 6,
    avgProductionPerVisit: 120,
    chairHoursPerDay: 6,
    workingDaysPerWeek: 4,
    workingWeeksPerYear: 48,
  });
  const withinHigh = calculateHygieneProduction({
    visitsPerDay: 8,
    avgProductionPerVisit: 120,
    chairHoursPerDay: 6,
    workingDaysPerWeek: 4,
    workingWeeksPerYear: 48,
  });

  assert.equal(HYGIENE_PRODUCTION_BENCHMARK_LOW, 120);
  assert.equal(HYGIENE_PRODUCTION_BENCHMARK_HIGH, 160);
  assert.equal(withinLow.hourlyProduction, 120);
  assert.equal(withinLow.vsBenchmark, "within");
  assert.equal(withinHigh.hourlyProduction, 160);
  assert.equal(withinHigh.vsBenchmark, "within");
});

test("shared hygiene production formula sanitizes invalid inputs safely", () => {
  const results = calculateHygieneProduction({
    visitsPerDay: Number.NaN,
    avgProductionPerVisit: Number.POSITIVE_INFINITY,
    chairHoursPerDay: Number.NEGATIVE_INFINITY,
    workingDaysPerWeek: -4,
    workingWeeksPerYear: -48,
  });

  assert.equal(results.dailyProduction, 0);
  assert.equal(results.hourlyProduction, 0);
  assert.equal(results.weeklyProduction, 0);
  assert.equal(results.monthlyProduction, 0);
  assert.equal(results.annualProduction, 0);
  assert.equal(results.vsBenchmark, "below");
});

test("shared hygiene production formula calculates annual production", () => {
  const results = calculateHygieneProduction({
    visitsPerDay: 10,
    avgProductionPerVisit: 200,
    chairHoursPerDay: 8,
    workingDaysPerWeek: 5,
    workingWeeksPerYear: 50,
  });

  assert.equal(results.dailyProduction, 2000);
  assert.equal(results.weeklyProduction, 10000);
  assert.equal(results.annualProduction, 500000);
  assertAlmostEqual(results.monthlyProduction, 41666.666666666664);
});

test("hygiene production calculator module uses the shared calculator architecture", () => {
  assert.equal(existsSync(sharedCalculatorModule), true);
  assert.equal(existsSync(sharedCalculatorTypes), true);
  assert.equal(existsSync(sharedCalculatorRecommendations), true);

  const calculatorSource = readFileSync(sharedCalculatorModule, "utf8");
  const typesSource = readFileSync(sharedCalculatorTypes, "utf8");
  const recommendationsSource = readFileSync(sharedCalculatorRecommendations, "utf8");

  assert.match(calculatorSource, /export function calculateHygieneProduction/);
  assert.match(calculatorSource, /sanitizeHygieneProductionInputs/);
  assert.match(typesSource, /export type HygieneProductionCalculatorInputs/);
  assert.match(typesSource, /export type HygieneProductionCalculatorResults/);
  assert.match(recommendationsSource, /export function getHygieneProductionRecommendations/);
  assert.doesNotMatch(calculatorSource, /useState|useMemo|window|document|React/);
});

test("legacy Hygiene Production route remains protected by member tools access", () => {
  const routeSource = readFileSync(legacyCalculatorRoute, "utf8");
  const componentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const layoutSource = readFileSync(memberToolsLayout, "utf8");

  assert.equal(existsSync(legacyCalculatorRoute), true);
  assert.match(routeSource, /HygieneProductionCalculator/);
  assert.match(componentSource, /calculateHygieneProduction/);
  assert.match(componentSource, /@\/lib\/calculators\/hygiene-production/);
  assert.match(layoutSource, /getToolsAccess/);
  assert.match(layoutSource, /Claim your listing to unlock these tools/);
});

test("Dentist Success Hub hygiene production route renders a real calculator workspace", () => {
  const routeSource = readFileSync(hubToolRoute, "utf8");
  const workspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");
  const registryTool = getDentistSuccessHubTool("hygiene-production-calculator");

  assert.equal(registryTool?.status, "active");
  assert.match(routeSource, /HygieneProductionCalculatorWorkspace/);
  assert.match(routeSource, /tool\.slug === "hygiene-production-calculator"/);
  assert.match(workspaceSource, /CalculatorShell/);
  assert.match(workspaceSource, /CalculatorFieldGrid/);
  assert.match(workspaceSource, /CalculatorActionBar/);
  assert.match(workspaceSource, /calculateHygieneProduction/);
  assert.match(workspaceSource, /getHygieneProductionRecommendations/);
  assert.match(workspaceSource, /Claim your listing/);
  assert.match(workspaceSource, /does not provide clinical/);
});

test("hygiene production calculation logic exists only in the shared pure module", () => {
  const sourceFiles = listSourceFiles(srcRoot);
  const definitions = sourceFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .filter((source) => /function calculateHygieneProduction/.test(source));

  const legacyComponentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const hubRouteSource = readFileSync(hubToolRoute, "utf8");
  const hubWorkspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");

  assert.equal(definitions.length, 1);
  assert.doesNotMatch(legacyComponentSource, /const dailyProduction\s*=/);
  assert.doesNotMatch(legacyComponentSource, /const hourlyProduction\s*=/);
  assert.doesNotMatch(hubRouteSource, /const dailyProduction\s*=/);
  assert.doesNotMatch(hubWorkspaceSource, /const dailyProduction\s*=/);
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
