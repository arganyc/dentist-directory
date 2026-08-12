import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  calculateNoShowCost,
  noShowCostCalculatorInitialInputs,
  type NoShowCostCalculatorInputs,
} from "../src/lib/calculators/no-show-cost/index.ts";

const sharedCalculatorModule = new URL("../src/lib/calculators/no-show-cost/calculator.ts", import.meta.url);
const sharedCalculatorTypes = new URL("../src/lib/calculators/no-show-cost/types.ts", import.meta.url);
const sharedCalculatorRecommendations = new URL(
  "../src/lib/calculators/no-show-cost/recommendations.ts",
  import.meta.url
);
const calculatorFramework = new URL("../src/components/calculator-framework.tsx", import.meta.url);
const hubCalculatorWorkspace = new URL(
  "../src/components/no-show-cost-calculator-workspace.tsx",
  import.meta.url
);
const legacyCalculatorComponent = new URL(
  "../src/app/tools/dental-cancellation-loss-calculator/CancellationLossCalculator.tsx",
  import.meta.url
);
const legacyCalculatorRoute = new URL(
  "../src/app/tools/dental-cancellation-loss-calculator/page.tsx",
  import.meta.url
);
const hubToolRoute = new URL("../src/app/dentist-success-hub/tools/[slug]/page.tsx", import.meta.url);
const srcRoot = fileURLToPath(new URL("../src", import.meta.url));

test("shared no-show formula preserves the legacy default outputs", () => {
  const results = calculateNoShowCost(noShowCostCalculatorInitialInputs);

  assertAlmostEqual(results.weeklyCancellationLoss, 2021.25);
  assert.equal(results.weeklyNoShowLoss, 1575);
  assertAlmostEqual(results.weeklyLoss, 3596.25);
  assertAlmostEqual(results.annualLoss, 172620);
  assertAlmostEqual(results.monthlyLoss, 14385);
  assert.equal(results.missedVisits, 10);
  assert.equal(results.annualChairHours, 480);
  assert.equal(results.hygieneAtRisk, 53280);
  assert.equal(results.treatmentAtRisk, 182400);
  assert.equal(results.newPatientsToOffset, 192);
  assert.equal(results.recovered25, 43155);
  assert.equal(results.recovered50, 86310);
  assert.equal(results.recovered75, 129465);
});

test("shared no-show formula handles cancellation-only cases", () => {
  const results = calculateNoShowCost({
    ...noShowCostCalculatorInitialInputs,
    averageProduction: 500,
    cancellationsPerWeek: 4,
    noShowsPerWeek: 0,
    rebookingRate: 25,
    workingWeeks: 50,
  });

  assert.equal(results.weeklyCancellationLoss, 1500);
  assert.equal(results.weeklyNoShowLoss, 0);
  assert.equal(results.weeklyLoss, 1500);
  assert.equal(results.annualLoss, 75000);
});

test("shared no-show formula handles no-show-only cases", () => {
  const results = calculateNoShowCost({
    ...noShowCostCalculatorInitialInputs,
    averageProduction: 500,
    cancellationsPerWeek: 0,
    noShowsPerWeek: 4,
    rebookingRate: 100,
    workingWeeks: 50,
  });

  assert.equal(results.weeklyCancellationLoss, 0);
  assert.equal(results.weeklyNoShowLoss, 2000);
  assert.equal(results.weeklyLoss, 2000);
  assert.equal(results.annualLoss, 100000);
});

test("shared no-show formula handles mixed cancellation and no-show cases", () => {
  const results = calculateNoShowCost({
    ...noShowCostCalculatorInitialInputs,
    averageProduction: 400,
    cancellationsPerWeek: 3,
    noShowsPerWeek: 2,
    rebookingRate: 50,
    chairHoursPerVisit: 1.5,
    workingWeeks: 40,
  });

  assert.equal(results.weeklyCancellationLoss, 600);
  assert.equal(results.weeklyNoShowLoss, 800);
  assert.equal(results.weeklyLoss, 1400);
  assert.equal(results.annualLoss, 56000);
  assert.equal(results.annualChairHours, 300);
});

test("shared no-show formula preserves rebooking and recovery behavior", () => {
  const noRecovery = calculateNoShowCost({
    ...noShowCostCalculatorInitialInputs,
    averageProduction: 1000,
    cancellationsPerWeek: 5,
    noShowsPerWeek: 0,
    rebookingRate: 0,
    workingWeeks: 10,
  });
  const fullRebooking = calculateNoShowCost({
    ...noShowCostCalculatorInitialInputs,
    averageProduction: 1000,
    cancellationsPerWeek: 5,
    noShowsPerWeek: 0,
    rebookingRate: 100,
    workingWeeks: 10,
  });

  assert.equal(noRecovery.annualLoss, 50000);
  assert.equal(fullRebooking.annualLoss, 0);
  assert.equal(noRecovery.recovered25, 12500);
  assert.equal(noRecovery.recovered50, 25000);
  assert.equal(noRecovery.recovered75, 37500);
});

test("shared no-show formula handles zero-value denominator edge cases safely", () => {
  const inputs: NoShowCostCalculatorInputs = {
    averageProduction: 500,
    cancellationsPerWeek: 0,
    noShowsPerWeek: 0,
    rebookingRate: 100,
    chairHoursPerVisit: 0,
    workingWeeks: 48,
    hygieneVisitValue: 0,
    treatmentVisitValue: 0,
    newPatientValue: 0,
  };

  const results = calculateNoShowCost(inputs);

  assert.equal(results.weeklyLoss, 0);
  assert.equal(results.annualLoss, 0);
  assert.equal(results.newPatientsToOffset, 0);
  assert.equal(Number.isFinite(results.newPatientsToOffset), true);
});

test("shared no-show formula sanitizes invalid edge inputs safely", () => {
  const results = calculateNoShowCost({
    averageProduction: Number.NaN,
    cancellationsPerWeek: -3,
    noShowsPerWeek: Number.POSITIVE_INFINITY,
    rebookingRate: 250,
    chairHoursPerVisit: -1,
    workingWeeks: -48,
    hygieneVisitValue: Number.NaN,
    treatmentVisitValue: -100,
    newPatientValue: -1,
  });

  assert.equal(results.weeklyLoss, 0);
  assert.equal(results.annualLoss, 0);
  assert.equal(results.annualChairHours, 0);
  assert.equal(results.newPatientsToOffset, 0);
});

test("no-show calculator module uses the future calculator architecture", () => {
  assert.equal(existsSync(sharedCalculatorModule), true);
  assert.equal(existsSync(sharedCalculatorTypes), true);
  assert.equal(existsSync(sharedCalculatorRecommendations), true);

  const calculatorSource = readFileSync(sharedCalculatorModule, "utf8");
  const typesSource = readFileSync(sharedCalculatorTypes, "utf8");
  const recommendationsSource = readFileSync(sharedCalculatorRecommendations, "utf8");

  assert.match(calculatorSource, /export function calculateNoShowCost/);
  assert.match(calculatorSource, /sanitizeNoShowCostInputs/);
  assert.match(typesSource, /export type NoShowCostCalculatorInputs/);
  assert.match(typesSource, /export type NoShowCostCalculatorResults/);
  assert.match(recommendationsSource, /export function getNoShowCostRecommendations/);
  assert.doesNotMatch(calculatorSource, /useState|useMemo|window|document|React/);
});

test("legacy calculator route still renders the existing public calculator component", () => {
  const routeSource = readFileSync(legacyCalculatorRoute, "utf8");
  const componentSource = readFileSync(legacyCalculatorComponent, "utf8");

  assert.equal(existsSync(legacyCalculatorRoute), true);
  assert.match(routeSource, /CancellationLossCalculator/);
  assert.match(routeSource, /canonical:\s*"\/tools\/dental-cancellation-loss-calculator"/);
  assert.match(componentSource, /calculateNoShowCost/);
  assert.match(componentSource, /noShowCostCalculatorInitialInputs/);
  assert.match(componentSource, /@\/lib\/calculators\/no-show-cost/);
});

test("Dentist Success Hub no-show route renders the real calculator instead of only a placeholder", () => {
  const source = readFileSync(hubToolRoute, "utf8");
  const workspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");

  assert.match(source, /NoShowCostCalculatorWorkspace/);
  assert.match(source, /tool\.slug === "no-show-cost-calculator"/);
  assert.match(workspaceSource, /CalculatorShell/);
  assert.match(workspaceSource, /calculateNoShowCost/);
  assert.match(workspaceSource, /getNoShowCostRecommendations/);
  assert.match(workspaceSource, /Save to DentistOS/);
  assert.match(workspaceSource, /Claim your listing/);
  assert.match(workspaceSource, /PrintButton/);
  assert.match(workspaceSource, /ShareButton/);
});

test("no-show calculation logic exists only in the shared pure module", () => {
  const sourceFiles = listSourceFiles(srcRoot);
  const definitions = sourceFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .filter((source) => /function calculateNoShowCost/.test(source));

  const legacyComponentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const hubRouteSource = readFileSync(hubToolRoute, "utf8");
  const hubWorkspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");

  assert.equal(definitions.length, 1);
  assert.doesNotMatch(legacyComponentSource, /const weeklyCancellationLoss\s*=/);
  assert.doesNotMatch(hubRouteSource, /const weeklyCancellationLoss\s*=/);
  assert.doesNotMatch(hubRouteSource, /const weeklyNoShowLoss\s*=/);
  assert.doesNotMatch(hubWorkspaceSource, /const weeklyCancellationLoss\s*=/);
  assert.doesNotMatch(hubWorkspaceSource, /const weeklyNoShowLoss\s*=/);
});

test("shared calculator UI framework exposes reusable accessible primitives", () => {
  const source = readFileSync(calculatorFramework, "utf8");

  for (const exportName of [
    "CalculatorShell",
    "CalculatorSection",
    "CalculatorInput",
    "CurrencyInput",
    "NumberInput",
    "PercentageInput",
    "SliderInput",
    "ResultsGrid",
    "ResultCard",
    "BenchmarkCard",
    "InsightCard",
    "RecommendationCard",
    "WarningCard",
    "CalculatorActions",
    "PrintButton",
    "ShareButton",
    "ClaimListingCTA",
  ]) {
    assert.match(source, new RegExp(`export function ${exportName}`));
  }

  assert.match(source, /htmlFor=\{id\}/);
  assert.match(source, /aria-describedby/);
  assert.doesNotMatch(source, /No-Show Cost Calculator|Cancellation Loss|weeklyCancellationLoss/);
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
