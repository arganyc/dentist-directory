import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  calculatePpoFeeReduction,
  ppoFeeReductionInitialInputs,
} from "../src/lib/calculators/ppo-fee-reduction/index.ts";
import { getDentistSuccessHubTool } from "../src/lib/dentist-success-hub-tools.ts";

const sharedCalculatorModule = new URL(
  "../src/lib/calculators/ppo-fee-reduction/calculator.ts",
  import.meta.url
);
const sharedCalculatorTypes = new URL(
  "../src/lib/calculators/ppo-fee-reduction/types.ts",
  import.meta.url
);
const sharedCalculatorRecommendations = new URL(
  "../src/lib/calculators/ppo-fee-reduction/recommendations.ts",
  import.meta.url
);
const legacyCalculatorComponent = new URL(
  "../src/app/tools/member/insurance-writeoff-calculator/InsuranceWriteoffCalculator.tsx",
  import.meta.url
);
const legacyCalculatorRoute = new URL(
  "../src/app/tools/member/insurance-writeoff-calculator/page.tsx",
  import.meta.url
);
const memberToolsLayout = new URL("../src/app/tools/member/layout.tsx", import.meta.url);
const hubToolRoute = new URL("../src/app/dentist-success-hub/tools/[slug]/page.tsx", import.meta.url);
const hubCalculatorWorkspace = new URL(
  "../src/components/ppo-fee-reduction-calculator-workspace.tsx",
  import.meta.url
);
const srcRoot = fileURLToPath(new URL("../src", import.meta.url));

test("shared PPO fee reduction formula preserves legacy default outputs", () => {
  const results = calculatePpoFeeReduction(ppoFeeReductionInitialInputs);

  assertAlmostEqual(results.inNetworkBilled, 63000);
  assertAlmostEqual(results.outNetworkBilled, 27000);
  assertAlmostEqual(results.inNetworkWriteOff, 17640);
  assertAlmostEqual(results.outNetworkWriteOff, 2160);
  assertAlmostEqual(results.totalWriteOff, 19800);
  assert.equal(results.collectedProduction, 70200);
  assertAlmostEqual(results.writeOffPct, 22);
  assertAlmostEqual(results.annualWriteOff, 237600);
});

test("shared PPO fee reduction formula handles 100% in-network", () => {
  const results = calculatePpoFeeReduction({
    monthlyBilledProduction: 100000,
    inNetworkPatientPct: 100,
    inNetworkAdjustmentPct: 20,
    outNetworkAdjustmentPct: 10,
  });

  assert.equal(results.inNetworkBilled, 100000);
  assert.equal(results.outNetworkBilled, 0);
  assert.equal(results.inNetworkWriteOff, 20000);
  assert.equal(results.outNetworkWriteOff, 0);
  assert.equal(results.totalWriteOff, 20000);
  assert.equal(results.collectedProduction, 80000);
  assert.equal(results.annualWriteOff, 240000);
});

test("shared PPO fee reduction formula handles 0% in-network", () => {
  const results = calculatePpoFeeReduction({
    monthlyBilledProduction: 100000,
    inNetworkPatientPct: 0,
    inNetworkAdjustmentPct: 20,
    outNetworkAdjustmentPct: 10,
  });

  assert.equal(results.inNetworkBilled, 0);
  assert.equal(results.outNetworkBilled, 100000);
  assert.equal(results.inNetworkWriteOff, 0);
  assert.equal(results.outNetworkWriteOff, 10000);
  assert.equal(results.totalWriteOff, 10000);
  assert.equal(results.collectedProduction, 90000);
  assert.equal(results.writeOffPct, 10);
});

test("shared PPO fee reduction formula handles zero billed production", () => {
  const results = calculatePpoFeeReduction({
    ...ppoFeeReductionInitialInputs,
    monthlyBilledProduction: 0,
  });

  assert.equal(results.inNetworkBilled, 0);
  assert.equal(results.outNetworkBilled, 0);
  assert.equal(results.totalWriteOff, 0);
  assert.equal(results.collectedProduction, 0);
  assert.equal(results.writeOffPct, 0);
  assert.equal(results.annualWriteOff, 0);
});

test("shared PPO fee reduction formula handles zero adjustments", () => {
  const results = calculatePpoFeeReduction({
    monthlyBilledProduction: 75000,
    inNetworkPatientPct: 65,
    inNetworkAdjustmentPct: 0,
    outNetworkAdjustmentPct: 0,
  });

  assert.equal(results.totalWriteOff, 0);
  assert.equal(results.collectedProduction, 75000);
  assert.equal(results.writeOffPct, 0);
  assert.equal(results.annualWriteOff, 0);
});

test("shared PPO fee reduction formula clamps percentage boundaries", () => {
  const results = calculatePpoFeeReduction({
    monthlyBilledProduction: 1000,
    inNetworkPatientPct: 150,
    inNetworkAdjustmentPct: 150,
    outNetworkAdjustmentPct: -20,
  });

  assert.equal(results.inNetworkBilled, 1000);
  assert.equal(results.outNetworkBilled, 0);
  assert.equal(results.inNetworkWriteOff, 1000);
  assert.equal(results.outNetworkWriteOff, 0);
  assert.equal(results.totalWriteOff, 1000);
  assert.equal(results.collectedProduction, 0);
  assert.equal(results.writeOffPct, 100);
});

test("shared PPO fee reduction formula sanitizes invalid inputs safely", () => {
  const results = calculatePpoFeeReduction({
    monthlyBilledProduction: Number.NaN,
    inNetworkPatientPct: Number.POSITIVE_INFINITY,
    inNetworkAdjustmentPct: Number.NEGATIVE_INFINITY,
    outNetworkAdjustmentPct: -5,
  });

  assert.equal(results.inNetworkBilled, 0);
  assert.equal(results.outNetworkBilled, 0);
  assert.equal(results.totalWriteOff, 0);
  assert.equal(results.collectedProduction, 0);
  assert.equal(results.writeOffPct, 0);
  assert.equal(results.annualWriteOff, 0);
});

test("PPO fee reduction calculator module uses the shared calculator architecture", () => {
  assert.equal(existsSync(sharedCalculatorModule), true);
  assert.equal(existsSync(sharedCalculatorTypes), true);
  assert.equal(existsSync(sharedCalculatorRecommendations), true);

  const calculatorSource = readFileSync(sharedCalculatorModule, "utf8");
  const typesSource = readFileSync(sharedCalculatorTypes, "utf8");
  const recommendationsSource = readFileSync(sharedCalculatorRecommendations, "utf8");

  assert.match(calculatorSource, /export function calculatePpoFeeReduction/);
  assert.match(calculatorSource, /sanitizePpoFeeReductionInputs/);
  assert.match(typesSource, /export type PpoFeeReductionCalculatorInputs/);
  assert.match(typesSource, /export type PpoFeeReductionCalculatorResults/);
  assert.match(recommendationsSource, /export function getPpoFeeReductionRecommendations/);
  assert.doesNotMatch(calculatorSource, /useState|useMemo|window|document|React/);
});

test("legacy Insurance Write-Off route remains protected by member tools access", () => {
  const routeSource = readFileSync(legacyCalculatorRoute, "utf8");
  const componentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const layoutSource = readFileSync(memberToolsLayout, "utf8");

  assert.equal(existsSync(legacyCalculatorRoute), true);
  assert.match(routeSource, /InsuranceWriteoffCalculator/);
  assert.match(componentSource, /calculatePpoFeeReduction/);
  assert.match(componentSource, /@\/lib\/calculators\/ppo-fee-reduction/);
  assert.match(layoutSource, /getToolsAccess/);
  assert.match(layoutSource, /Claim your listing to unlock these tools/);
});

test("Dentist Success Hub PPO fee reduction route renders a real calculator workspace", () => {
  const routeSource = readFileSync(hubToolRoute, "utf8");
  const workspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");
  const registryTool = getDentistSuccessHubTool("ppo-fee-reduction-calculator");

  assert.equal(registryTool?.status, "active");
  assert.match(routeSource, /PpoFeeReductionCalculatorWorkspace/);
  assert.match(routeSource, /tool\.slug === "ppo-fee-reduction-calculator"/);
  assert.match(workspaceSource, /CalculatorShell/);
  assert.match(workspaceSource, /calculatePpoFeeReduction/);
  assert.match(workspaceSource, /getPpoFeeReductionRecommendations/);
  assert.match(workspaceSource, /Save to DentistOS/);
  assert.match(workspaceSource, /Claim your listing/);
  assert.match(workspaceSource, /does not provide legal, accounting, tax,\s+payer-contract/);
});

test("PPO fee reduction calculation logic exists only in the shared pure module", () => {
  const sourceFiles = listSourceFiles(srcRoot);
  const definitions = sourceFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .filter((source) => /function calculatePpoFeeReduction/.test(source));

  const legacyComponentSource = readFileSync(legacyCalculatorComponent, "utf8");
  const hubRouteSource = readFileSync(hubToolRoute, "utf8");
  const hubWorkspaceSource = readFileSync(hubCalculatorWorkspace, "utf8");

  assert.equal(definitions.length, 1);
  assert.doesNotMatch(legacyComponentSource, /const inNetworkWriteOff\s*=/);
  assert.doesNotMatch(legacyComponentSource, /const outNetworkWriteOff\s*=/);
  assert.doesNotMatch(hubRouteSource, /const totalWriteOff\s*=/);
  assert.doesNotMatch(hubWorkspaceSource, /const inNetworkWriteOff\s*=/);
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
