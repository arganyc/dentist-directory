import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  calculateEquipmentRoi,
  equipmentRoiInitialInputs,
  EQUIPMENT_ROI_MIN_BREAK_EVEN_DENOMINATOR,
} from "../src/lib/calculators/equipment-roi/index.ts";
import { getDentistSuccessHubTool } from "../src/lib/dentist-success-hub-tools.ts";

const sharedCalculatorModule = new URL(
  "../src/lib/calculators/equipment-roi/calculator.ts",
  import.meta.url
);
const sharedCalculatorTypes = new URL(
  "../src/lib/calculators/equipment-roi/types.ts",
  import.meta.url
);
const sharedCalculatorRecommendations = new URL(
  "../src/lib/calculators/equipment-roi/recommendations.ts",
  import.meta.url
);
const legacyCalculatorComponent = new URL(
  "../src/app/tools/member/equipment-roi-calculator/EquipmentRoiCalculator.tsx",
  import.meta.url
);
const legacyCalculatorRoute = new URL(
  "../src/app/tools/member/equipment-roi-calculator/page.tsx",
  import.meta.url
);
const memberToolsLayout = new URL("../src/app/tools/member/layout.tsx", import.meta.url);
const hubToolRoute = new URL("../src/app/dentist-success-hub/tools/[slug]/page.tsx", import.meta.url);
const hubCalculatorWorkspace = new URL(
  "../src/components/equipment-roi-calculator-workspace.tsx",
  import.meta.url
);
const srcRoot = fileURLToPath(new URL("../src", import.meta.url));

test("shared equipment ROI formula preserves legacy default outputs", () => {
  const results = calculateEquipmentRoi(equipmentRoiInitialInputs);

  assertAlmostEqual(results.monthlyLoanPayment, 972.2222222222222);
  assert.equal(results.netMonthlyBenefitPreLoan, 2900);
  assertAlmostEqual(results.netMonthlyBenefit, 1927.7777777777778);
  assertAlmostEqual(results.breakEvenMonths, 12.068965517241379);
  assert.equal(results.breakEvenReached, true);
  assert.equal(results.annualBenefitPreLoan, 34800);
  assert.equal(results.fiveYearReturn, 139000);
  assertAlmostEqual(results.fiveYearRoiPct, 397.14285714285717);
});

test("shared equipment ROI formula handles zero equipment cost safely", () => {
  const results = calculateEquipmentRoi({
    ...equipmentRoiInitialInputs,
    equipmentCost: 0,
  });

  assert.equal(results.monthlyLoanPayment, 0);
  assert.equal(results.breakEvenMonths, 0);
  assert.equal(results.breakEvenReached, true);
  assert.equal(results.fiveYearRoiPct, 0);
});

test("shared equipment ROI formula handles zero added revenue", () => {
  const results = calculateEquipmentRoi({
    equipmentCost: 35000,
    monthlyIncrementalRevenue: 0,
    monthlyOperatingCost: 300,
    financingMonths: 36,
  });

  assert.equal(EQUIPMENT_ROI_MIN_BREAK_EVEN_DENOMINATOR, 1);
  assert.equal(results.netMonthlyBenefitPreLoan, -300);
  assertAlmostEqual(results.netMonthlyBenefit, -1272.2222222222222);
  assert.equal(results.breakEvenMonths, 35000);
  assert.equal(results.breakEvenReached, false);
  assert.equal(results.fiveYearReturn, -53000);
});

test("shared equipment ROI formula handles zero operating cost", () => {
  const results = calculateEquipmentRoi({
    equipmentCost: 35000,
    monthlyIncrementalRevenue: 3200,
    monthlyOperatingCost: 0,
    financingMonths: 36,
  });

  assert.equal(results.netMonthlyBenefitPreLoan, 3200);
  assertAlmostEqual(results.breakEvenMonths, 10.9375);
  assert.equal(results.fiveYearReturn, 157000);
});

test("shared equipment ROI formula handles zero financing months", () => {
  const results = calculateEquipmentRoi({
    ...equipmentRoiInitialInputs,
    financingMonths: 0,
  });

  assert.equal(results.monthlyLoanPayment, 0);
  assert.equal(results.netMonthlyBenefit, results.netMonthlyBenefitPreLoan);
});

test("shared equipment ROI formula handles negative net benefit", () => {
  const results = calculateEquipmentRoi({
    equipmentCost: 20000,
    monthlyIncrementalRevenue: 500,
    monthlyOperatingCost: 900,
    financingMonths: 24,
  });

  assert.equal(results.netMonthlyBenefitPreLoan, -400);
  assertAlmostEqual(results.netMonthlyBenefit, -1233.3333333333335);
  assert.equal(results.breakEvenMonths, 20000);
  assert.equal(results.breakEvenReached, false);
  assert.equal(results.fiveYearReturn, -44000);
});

test("shared equipment ROI formula calculates break-even", () => {
  const results = calculateEquipmentRoi({
    equipmentCost: 24000,
    monthlyIncrementalRevenue: 3000,
    monthlyOperatingCost: 1000,
    financingMonths: 24,
  });

  assert.equal(results.netMonthlyBenefitPreLoan, 2000);
  assert.equal(results.breakEvenMonths, 12);
  assert.equal(results.breakEvenReached, true);
});

test("shared equipment ROI formula calculates five-year return", () => {
  const results = calculateEquipmentRoi({
    equipmentCost: 50000,
    monthlyIncrementalRevenue: 4000,
    monthlyOperatingCost: 500,
    financingMonths: 50,
  });

  assert.equal(results.fiveYearReturn, 160000);
  assert.equal(results.fiveYearRoiPct, 320);
  assert.equal(results.annualBenefitPreLoan, 42000);
});

test("shared equipment ROI formula sanitizes invalid inputs safely", () => {
  const results = calculateEquipmentRoi({
    equipmentCost: Number.NaN,
    monthlyIncrementalRevenue: Number.POSITIVE_INFINITY,
    monthlyOperatingCost: -500,
    financingMonths: Number.NEGATIVE_INFINITY,
  });

  assert.equal(results.monthlyLoanPayment, 0);
  assert.equal(results.netMonthlyBenefitPreLoan, 0);
  assert.equal(results.netMonthlyBenefit, 0);
  assert.equal(results.breakEvenMonths, 0);
  assert.equal(results.fiveYearReturn, 0);
  assert.equal(results.fiveYearRoiPct, 0);
});

test("equipment ROI calculator module uses the shared calculator architecture", () => {
  assert.equal(existsSync(sharedCalculatorModule), true);
  assert.equal(existsSync(sharedCalculatorTypes), true);
  assert.equal(existsSync(sharedCalculatorRecommendations), true);

  const calculatorSource = readFileSync(sharedCalculatorModule, "utf8");
  const typesSource = readFileSync(sharedCalculatorTypes, "utf8");
  const recommendationsSource = readFileSync(sharedCalculatorRecommendations, "utf8");

  assert.match(calculatorSource, /export function calculateEquipmentRoi/);
  assert.match(calculatorSource, /sanitizeEquipmentRoiInputs/);
  assert.match(typesSource, /export type EquipmentRoiCalculatorInputs/);
  assert.match(typesSource, /export type EquipmentRoiCalculatorResults/);
  assert.match(recommendationsSource, /export function getEquipmentRoiRecommendations/);
  assert.doesNotMatch(calculatorSource, /useState|useMemo|window|document|React/);
});

test("legacy Equipment ROI route remains protected by member tools access", () => {
  const routeSource = readFileSync(legacyCalculatorRoute, "utf8");
  const componentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const layoutSource = readFileSync(memberToolsLayout, "utf8");

  assert.equal(existsSync(legacyCalculatorRoute), true);
  assert.match(routeSource, /EquipmentRoiCalculator/);
  assert.match(componentSource, /calculateEquipmentRoi/);
  assert.match(componentSource, /@\/lib\/calculators\/equipment-roi/);
  assert.match(layoutSource, /getToolsAccess/);
  assert.match(layoutSource, /Claim your listing to unlock these tools/);
});

test("Dentist Success Hub equipment ROI route renders a real calculator workspace", () => {
  const routeSource = readFileSync(hubToolRoute, "utf8");
  const workspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");
  const registryTool = getDentistSuccessHubTool("equipment-roi-calculator");

  assert.equal(registryTool?.status, "active");
  assert.match(routeSource, /EquipmentRoiCalculatorWorkspace/);
  assert.match(routeSource, /tool\.slug === "equipment-roi-calculator"/);
  assert.match(workspaceSource, /CalculatorShell/);
  assert.match(workspaceSource, /CalculatorFieldGrid/);
  assert.match(workspaceSource, /CalculatorActionBar/);
  assert.match(workspaceSource, /calculateEquipmentRoi/);
  assert.match(workspaceSource, /getEquipmentRoiRecommendations/);
  assert.match(workspaceSource, /Claim your listing/);
  assert.match(workspaceSource, /does not provide lending/);
});

test("equipment ROI calculation logic exists only in the shared pure module", () => {
  const sourceFiles = listSourceFiles(srcRoot);
  const definitions = sourceFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .filter((source) => /function calculateEquipmentRoi/.test(source));

  const legacyComponentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const hubRouteSource = readFileSync(hubToolRoute, "utf8");
  const hubWorkspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");

  assert.equal(definitions.length, 1);
  assert.doesNotMatch(legacyComponentSource, /const monthlyLoanPayment\s*=/);
  assert.doesNotMatch(legacyComponentSource, /const breakEvenMonths\s*=/);
  assert.doesNotMatch(hubRouteSource, /const monthlyLoanPayment\s*=/);
  assert.doesNotMatch(hubWorkspaceSource, /const monthlyLoanPayment\s*=/);
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
