import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  calculateNoShowCost,
  noShowCostCalculatorInitialInputs,
  type NoShowCostCalculatorInputs,
} from "../src/lib/no-show-cost-calculator.ts";

const sharedCalculatorModule = new URL("../src/lib/no-show-cost-calculator.ts", import.meta.url);
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

test("legacy calculator route still renders the existing public calculator component", () => {
  const routeSource = readFileSync(legacyCalculatorRoute, "utf8");
  const componentSource = readFileSync(legacyCalculatorComponent, "utf8");

  assert.equal(existsSync(legacyCalculatorRoute), true);
  assert.match(routeSource, /CancellationLossCalculator/);
  assert.match(routeSource, /canonical:\s*"\/tools\/dental-cancellation-loss-calculator"/);
  assert.match(componentSource, /calculateNoShowCost/);
  assert.match(componentSource, /noShowCostCalculatorInitialInputs/);
});

test("Dentist Success Hub no-show route renders the real calculator instead of only a placeholder", () => {
  const source = readFileSync(hubToolRoute, "utf8");

  assert.match(source, /NoShowCostCalculatorWorkspace/);
  assert.match(source, /CancellationLossCalculator/);
  assert.match(source, /tool\.slug === "no-show-cost-calculator"/);
  assert.match(source, /Save reports in DentistOS/);
  assert.match(source, /Claim your listing/);
});

test("no-show calculation logic exists only in the shared pure module", () => {
  const sourceFiles = listSourceFiles(srcRoot);
  const definitions = sourceFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .filter((source) => /function calculateNoShowCost/.test(source));

  const legacyComponentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const hubRouteSource = readFileSync(hubToolRoute, "utf8");

  assert.equal(definitions.length, 1);
  assert.doesNotMatch(legacyComponentSource, /const weeklyCancellationLoss\s*=/);
  assert.doesNotMatch(hubRouteSource, /const weeklyCancellationLoss\s*=/);
  assert.doesNotMatch(hubRouteSource, /const weeklyNoShowLoss\s*=/);
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
