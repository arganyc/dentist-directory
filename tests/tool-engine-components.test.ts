import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const componentPath = new URL("../src/components/tool-engine.tsx", import.meta.url);
const source = readFileSync(componentPath, "utf8");

test("tool engine component module exists", () => {
  assert.equal(existsSync(componentPath), true);
});

test("tool engine exports all reusable components", () => {
  for (const componentName of [
    "ToolPage",
    "ToolHero",
    "ToolHeader",
    "ToolJsonLd",
    "ToolCard",
    "ToolGrid",
    "ToolSidebar",
    "ToolBreadcrumb",
    "ToolFAQ",
    "ToolDisclaimer",
    "ToolRecommendations",
    "ToolFooterCTA",
  ]) {
    assert.match(source, new RegExp(`export function ${componentName}`));
  }
});

test("tool engine exposes generic reusable data contracts", () => {
  for (const typeName of [
    "ToolAction",
    "ToolBreadcrumbItem",
    "ToolCardItem",
    "ToolSidebarSection",
    "ToolFAQItem",
    "ToolRecommendation",
  ]) {
    assert.match(source, new RegExp(`export type ${typeName}`));
  }
});

test("tool engine remains generic and has no hardcoded dentist tools", () => {
  assert.doesNotMatch(
    source,
    /No-Show Cost Calculator|New Patient Lifetime Value|Production Goal Calculator|Google Business Audit|Practice Profile Score/
  );
});

test("tool engine does not touch auth database claims or publishing", () => {
  assert.doesNotMatch(
    source,
    /getSql|DENTISTOS_PUBLISH_TOKEN|dentistos-auth|dentistos-claim|dentistos-listings|toolsAccess|CREATE TABLE|POST\(|GET\(/
  );
});
