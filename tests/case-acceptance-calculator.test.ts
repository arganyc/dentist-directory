import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  calculateCaseAcceptance,
  caseAcceptanceInitialInputs,
} from "../src/lib/calculators/case-acceptance/index.ts";
import { getDentistSuccessHubTool } from "../src/lib/dentist-success-hub-tools.ts";

const sharedCalculatorModule = new URL(
  "../src/lib/calculators/case-acceptance/calculator.ts",
  import.meta.url
);
const sharedCalculatorTypes = new URL(
  "../src/lib/calculators/case-acceptance/types.ts",
  import.meta.url
);
const sharedCalculatorRecommendations = new URL(
  "../src/lib/calculators/case-acceptance/recommendations.ts",
  import.meta.url
);
const legacyCalculatorComponent = new URL(
  "../src/app/tools/member/case-acceptance-calculator/CaseAcceptanceCalculator.tsx",
  import.meta.url
);
const legacyCalculatorRoute = new URL(
  "../src/app/tools/member/case-acceptance-calculator/page.tsx",
  import.meta.url
);
const memberToolsLayout = new URL("../src/app/tools/member/layout.tsx", import.meta.url);
const hubToolRoute = new URL("../src/app/dentist-success-hub/tools/[slug]/page.tsx", import.meta.url);
const hubCalculatorWorkspace = new URL(
  "../src/components/case-acceptance-calculator-workspace.tsx",
  import.meta.url
);
const srcRoot = fileURLToPath(new URL("../src", import.meta.url));

test("shared case acceptance formula preserves legacy default outputs", () => {
  const results = calculateCaseAcceptance(caseAcceptanceInitialInputs);

  assertAlmostEqual(results.acceptedCases, 20.25);
  assert.equal(results.acceptedValue, 28350);
  assertAlmostEqual(results.unacceptedCases, 24.75);
  assertAlmostEqual(results.lostValueMonthly, 34650);
  assertAlmostEqual(results.lostValueAnnual, 415800);
  assertAlmostEqual(results.targetAcceptedCases, 29.25);
  assert.equal(results.targetProduction, 40950);
  assert.equal(results.upliftMonthly, 12600);
  assert.equal(results.upliftAnnual, 151200);
});

test("shared case acceptance formula handles current rate equal to target", () => {
  const results = calculateCaseAcceptance({
    plansPresentedPerMonth: 40,
    averageCaseValue: 1000,
    currentAcceptanceRate: 60,
    targetAcceptanceRate: 60,
  });

  assert.equal(results.acceptedCases, 24);
  assert.equal(results.acceptedValue, 24000);
  assert.equal(results.targetAcceptedCases, 24);
  assert.equal(results.targetProduction, 24000);
  assert.equal(results.upliftMonthly, 0);
  assert.equal(results.upliftAnnual, 0);
});

test("shared case acceptance formula handles target below current as zero upside", () => {
  const results = calculateCaseAcceptance({
    plansPresentedPerMonth: 40,
    averageCaseValue: 1000,
    currentAcceptanceRate: 75,
    targetAcceptanceRate: 50,
  });

  assert.equal(results.acceptedCases, 30);
  assert.equal(results.targetAcceptedCases, 20);
  assert.equal(results.targetProduction, 20000);
  assert.equal(results.upliftMonthly, 0);
  assert.equal(results.upliftAnnual, 0);
});

test("shared case acceptance formula handles zero treatment plans safely", () => {
  const results = calculateCaseAcceptance({
    ...caseAcceptanceInitialInputs,
    plansPresentedPerMonth: 0,
  });

  assert.equal(results.acceptedCases, 0);
  assert.equal(results.unacceptedCases, 0);
  assert.equal(results.acceptedValue, 0);
  assert.equal(results.lostValueMonthly, 0);
  assert.equal(results.upliftMonthly, 0);
});

test("shared case acceptance formula handles zero case value safely", () => {
  const results = calculateCaseAcceptance({
    plansPresentedPerMonth: 20,
    averageCaseValue: 0,
    currentAcceptanceRate: 50,
    targetAcceptanceRate: 70,
  });

  assert.equal(results.acceptedCases, 10);
  assert.equal(results.unacceptedCases, 10);
  assert.equal(results.acceptedValue, 0);
  assert.equal(results.lostValueMonthly, 0);
  assert.equal(results.targetProduction, 0);
  assert.equal(results.upliftMonthly, 0);
});

test("shared case acceptance formula handles zero percent acceptance", () => {
  const results = calculateCaseAcceptance({
    plansPresentedPerMonth: 10,
    averageCaseValue: 1200,
    currentAcceptanceRate: 0,
    targetAcceptanceRate: 50,
  });

  assert.equal(results.acceptedCases, 0);
  assert.equal(results.acceptedValue, 0);
  assert.equal(results.unacceptedCases, 10);
  assert.equal(results.lostValueMonthly, 12000);
  assert.equal(results.targetProduction, 6000);
  assert.equal(results.upliftMonthly, 6000);
});

test("shared case acceptance formula handles one hundred percent acceptance", () => {
  const results = calculateCaseAcceptance({
    plansPresentedPerMonth: 10,
    averageCaseValue: 1200,
    currentAcceptanceRate: 100,
    targetAcceptanceRate: 100,
  });

  assert.equal(results.acceptedCases, 10);
  assert.equal(results.acceptedValue, 12000);
  assert.equal(results.unacceptedCases, 0);
  assert.equal(results.lostValueMonthly, 0);
  assert.equal(results.upliftMonthly, 0);
});

test("shared case acceptance formula sanitizes invalid inputs safely", () => {
  const results = calculateCaseAcceptance({
    plansPresentedPerMonth: Number.NaN,
    averageCaseValue: Number.POSITIVE_INFINITY,
    currentAcceptanceRate: -20,
    targetAcceptanceRate: 150,
  });

  assert.equal(results.acceptedCases, 0);
  assert.equal(results.acceptedValue, 0);
  assert.equal(results.unacceptedCases, 0);
  assert.equal(results.lostValueMonthly, 0);
  assert.equal(results.targetAcceptedCases, 0);
  assert.equal(results.targetProduction, 0);
  assert.equal(results.upliftMonthly, 0);
  assert.equal(results.upliftAnnual, 0);
});

test("shared case acceptance formula calculates monthly and annual upside", () => {
  const results = calculateCaseAcceptance({
    plansPresentedPerMonth: 25,
    averageCaseValue: 2000,
    currentAcceptanceRate: 40,
    targetAcceptanceRate: 55,
  });

  assert.equal(results.acceptedValue, 20000);
  assertAlmostEqual(results.targetProduction, 27500);
  assertAlmostEqual(results.upliftMonthly, 7500);
  assertAlmostEqual(results.upliftAnnual, 90000);
});

test("case acceptance calculator module uses the shared calculator architecture", () => {
  assert.equal(existsSync(sharedCalculatorModule), true);
  assert.equal(existsSync(sharedCalculatorTypes), true);
  assert.equal(existsSync(sharedCalculatorRecommendations), true);

  const calculatorSource = readFileSync(sharedCalculatorModule, "utf8");
  const typesSource = readFileSync(sharedCalculatorTypes, "utf8");
  const recommendationsSource = readFileSync(sharedCalculatorRecommendations, "utf8");

  assert.match(calculatorSource, /export function calculateCaseAcceptance/);
  assert.match(calculatorSource, /sanitizeCaseAcceptanceInputs/);
  assert.match(typesSource, /export type CaseAcceptanceCalculatorInputs/);
  assert.match(typesSource, /export type CaseAcceptanceCalculatorResults/);
  assert.match(recommendationsSource, /export function getCaseAcceptanceRecommendations/);
  assert.doesNotMatch(calculatorSource, /useState|useMemo|window|document|React/);
});

test("legacy Case Acceptance route remains protected by member tools access", () => {
  const routeSource = readFileSync(legacyCalculatorRoute, "utf8");
  const componentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const layoutSource = readFileSync(memberToolsLayout, "utf8");

  assert.equal(existsSync(legacyCalculatorRoute), true);
  assert.match(routeSource, /CaseAcceptanceCalculator/);
  assert.match(componentSource, /calculateCaseAcceptance/);
  assert.match(componentSource, /@\/lib\/calculators\/case-acceptance/);
  assert.match(layoutSource, /getToolsAccess/);
  assert.match(layoutSource, /Claim your listing to unlock these tools/);
});

test("Dentist Success Hub case acceptance route renders a real calculator workspace", () => {
  const routeSource = readFileSync(hubToolRoute, "utf8");
  const workspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");
  const registryTool = getDentistSuccessHubTool("case-acceptance-calculator");

  assert.equal(registryTool?.status, "active");
  assert.match(routeSource, /CaseAcceptanceCalculatorWorkspace/);
  assert.match(routeSource, /tool\.slug === "case-acceptance-calculator"/);
  assert.match(workspaceSource, /CalculatorShell/);
  assert.match(workspaceSource, /CalculatorFieldGrid/);
  assert.match(workspaceSource, /CalculatorActionBar/);
  assert.match(workspaceSource, /calculateCaseAcceptance/);
  assert.match(workspaceSource, /getCaseAcceptanceRecommendations/);
  assert.match(workspaceSource, /Claim your listing/);
  assert.match(workspaceSource, /does not provide clinical/);
});

test("case acceptance calculation logic exists only in the shared pure module", () => {
  const sourceFiles = listSourceFiles(srcRoot);
  const definitions = sourceFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .filter((source) => /function calculateCaseAcceptance/.test(source));

  const legacyComponentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const hubRouteSource = readFileSync(hubToolRoute, "utf8");
  const hubWorkspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");

  assert.equal(definitions.length, 1);
  assert.doesNotMatch(legacyComponentSource, /const acceptedCases\s*=/);
  assert.doesNotMatch(legacyComponentSource, /const lostValueMonthly\s*=/);
  assert.doesNotMatch(hubRouteSource, /const acceptedCases\s*=/);
  assert.doesNotMatch(hubWorkspaceSource, /const acceptedCases\s*=/);
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
