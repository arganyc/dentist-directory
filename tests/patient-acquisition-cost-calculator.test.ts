import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  calculatePatientAcquisitionCost,
  patientAcquisitionCostInitialInputs,
  type PatientAcquisitionCostCalculatorInputs,
} from "../src/lib/calculators/patient-acquisition-cost/index.ts";
import { getDentistSuccessHubTool } from "../src/lib/dentist-success-hub-tools.ts";

const sharedCalculatorModule = new URL(
  "../src/lib/calculators/patient-acquisition-cost/calculator.ts",
  import.meta.url
);
const sharedCalculatorTypes = new URL(
  "../src/lib/calculators/patient-acquisition-cost/types.ts",
  import.meta.url
);
const sharedCalculatorRecommendations = new URL(
  "../src/lib/calculators/patient-acquisition-cost/recommendations.ts",
  import.meta.url
);
const legacyCalculatorComponent = new URL(
  "../src/app/tools/member/new-patient-cac-calculator/NewPatientCacCalculator.tsx",
  import.meta.url
);
const legacyCalculatorRoute = new URL(
  "../src/app/tools/member/new-patient-cac-calculator/page.tsx",
  import.meta.url
);
const memberToolsLayout = new URL("../src/app/tools/member/layout.tsx", import.meta.url);
const hubToolRoute = new URL("../src/app/dentist-success-hub/tools/[slug]/page.tsx", import.meta.url);
const hubCalculatorWorkspace = new URL(
  "../src/components/patient-acquisition-cost-calculator-workspace.tsx",
  import.meta.url
);
const srcRoot = fileURLToPath(new URL("../src", import.meta.url));

test("shared patient acquisition formula preserves legacy default outputs", () => {
  const results = calculatePatientAcquisitionCost(patientAcquisitionCostInitialInputs);

  assertAlmostEqual(results.cac, 178.57142857142858);
  assert.equal(results.lifetimeValue, 4500);
  assertAlmostEqual(results.ltvToCacRatio, 25.2);
  assertAlmostEqual(results.paybackMonths, 2.857142857142857);
  assert.equal(results.annualMarketingSpend, 30000);
  assert.equal(results.annualNewPatients, 168);
  assert.equal(results.healthLabel, "healthy");
});

test("shared patient acquisition formula handles zero marketing spend", () => {
  const results = calculatePatientAcquisitionCost({
    ...patientAcquisitionCostInitialInputs,
    monthlyMarketingSpend: 0,
  });

  assert.equal(results.cac, 0);
  assert.equal(results.ltvToCacRatio, 4500);
  assert.equal(results.paybackMonths, 0);
  assert.equal(results.annualMarketingSpend, 0);
});

test("shared patient acquisition formula handles zero new patients safely", () => {
  const results = calculatePatientAcquisitionCost({
    ...patientAcquisitionCostInitialInputs,
    monthlyMarketingSpend: 1200,
    newPatientsPerMonth: 0,
  });

  assert.equal(results.cac, 1200);
  assert.equal(results.annualNewPatients, 0);
  assert.equal(Number.isFinite(results.cac), true);
});

test("shared patient acquisition formula handles zero lifetime value safely", () => {
  const results = calculatePatientAcquisitionCost({
    monthlyMarketingSpend: 1200,
    newPatientsPerMonth: 12,
    avgAnnualPatientValue: 0,
    avgRetentionYears: 0,
  });

  assert.equal(results.cac, 100);
  assert.equal(results.lifetimeValue, 0);
  assert.equal(results.ltvToCacRatio, 0);
  assert.equal(results.paybackMonths, 100);
  assert.equal(results.healthLabel, "tight");
});

test("shared patient acquisition formula calculates LTV:CAC ratio and payback", () => {
  const results = calculatePatientAcquisitionCost({
    monthlyMarketingSpend: 3000,
    newPatientsPerMonth: 10,
    avgAnnualPatientValue: 600,
    avgRetentionYears: 3,
  });

  assert.equal(results.cac, 300);
  assert.equal(results.lifetimeValue, 1800);
  assert.equal(results.ltvToCacRatio, 6);
  assert.equal(results.paybackMonths, 6);
  assert.equal(results.healthLabel, "healthy");
});

test("shared patient acquisition formula sanitizes invalid inputs safely", () => {
  const results = calculatePatientAcquisitionCost({
    monthlyMarketingSpend: Number.NaN,
    newPatientsPerMonth: Number.POSITIVE_INFINITY,
    avgAnnualPatientValue: -500,
    avgRetentionYears: -2,
  });

  assert.equal(results.cac, 0);
  assert.equal(results.lifetimeValue, 0);
  assert.equal(results.ltvToCacRatio, 0);
  assert.equal(results.paybackMonths, 0);
  assert.equal(results.annualMarketingSpend, 0);
  assert.equal(results.annualNewPatients, 0);
});

test("patient acquisition calculator module uses the shared calculator architecture", () => {
  assert.equal(existsSync(sharedCalculatorModule), true);
  assert.equal(existsSync(sharedCalculatorTypes), true);
  assert.equal(existsSync(sharedCalculatorRecommendations), true);

  const calculatorSource = readFileSync(sharedCalculatorModule, "utf8");
  const typesSource = readFileSync(sharedCalculatorTypes, "utf8");
  const recommendationsSource = readFileSync(sharedCalculatorRecommendations, "utf8");

  assert.match(calculatorSource, /export function calculatePatientAcquisitionCost/);
  assert.match(calculatorSource, /sanitizePatientAcquisitionCostInputs/);
  assert.match(typesSource, /export type PatientAcquisitionCostCalculatorInputs/);
  assert.match(typesSource, /export type PatientAcquisitionCostCalculatorResults/);
  assert.match(recommendationsSource, /export function getPatientAcquisitionCostRecommendations/);
  assert.doesNotMatch(calculatorSource, /useState|useMemo|window|document|React/);
});

test("legacy New Patient CAC route remains protected by member tools access", () => {
  const routeSource = readFileSync(legacyCalculatorRoute, "utf8");
  const componentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const layoutSource = readFileSync(memberToolsLayout, "utf8");

  assert.equal(existsSync(legacyCalculatorRoute), true);
  assert.match(routeSource, /NewPatientCacCalculator/);
  assert.match(componentSource, /calculatePatientAcquisitionCost/);
  assert.match(componentSource, /@\/lib\/calculators\/patient-acquisition-cost/);
  assert.match(layoutSource, /getToolsAccess/);
  assert.match(layoutSource, /Claim your listing to unlock these tools/);
});

test("Dentist Success Hub patient acquisition route renders a real calculator workspace", () => {
  const routeSource = readFileSync(hubToolRoute, "utf8");
  const workspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");
  const registryTool = getDentistSuccessHubTool("patient-acquisition-cost-calculator");

  assert.equal(registryTool?.status, "active");
  assert.match(routeSource, /PatientAcquisitionCostCalculatorWorkspace/);
  assert.match(routeSource, /tool\.slug === "patient-acquisition-cost-calculator"/);
  assert.match(workspaceSource, /CalculatorShell/);
  assert.match(workspaceSource, /calculatePatientAcquisitionCost/);
  assert.match(workspaceSource, /getPatientAcquisitionCostRecommendations/);
  assert.match(workspaceSource, /Save to DentistOS/);
  assert.match(workspaceSource, /Claim your listing/);
  assert.match(workspaceSource, /New Patient\s+Lifetime Value workspace remains a separate future Dentist Success Hub product/);
});

test("patient acquisition calculation logic exists only in the shared pure module", () => {
  const sourceFiles = listSourceFiles(srcRoot);
  const definitions = sourceFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .filter((source) => /function calculatePatientAcquisitionCost/.test(source));

  const legacyComponentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const hubRouteSource = readFileSync(hubToolRoute, "utf8");
  const hubWorkspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");

  assert.equal(definitions.length, 1);
  assert.doesNotMatch(legacyComponentSource, /const cac\s*=/);
  assert.doesNotMatch(legacyComponentSource, /const lifetimeValue\s*=/);
  assert.doesNotMatch(hubRouteSource, /const cac\s*=/);
  assert.doesNotMatch(hubWorkspaceSource, /const cac\s*=/);
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
