import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

import {
  DENTIST_SUCCESS_HUB_CATEGORIES,
  DENTIST_SUCCESS_HUB_TOOLS,
  DENTIST_SUCCESS_HUB_TOOL_STATUSES,
  DENTIST_SUCCESS_HUB_TOOL_TYPES,
  getDentistSuccessHubTool,
  getDentistSuccessHubToolsByCategory,
  validateToolRegistry,
  type DentistSuccessHubTool,
} from "../src/lib/dentist-success-hub-tools.ts";

test("Dentist Success Hub tool registry validates", () => {
  const result = validateToolRegistry();

  assert.deepEqual(result, { valid: true, errors: [] });
  assert.ok(DENTIST_SUCCESS_HUB_TOOLS.length >= 30);
  assert.ok(DENTIST_SUCCESS_HUB_TOOLS.length <= 40);
});

test("tool registry contains supported types statuses and categories only", () => {
  for (const tool of DENTIST_SUCCESS_HUB_TOOLS) {
    assert.ok(DENTIST_SUCCESS_HUB_TOOL_TYPES.includes(tool.toolType));
    assert.ok(DENTIST_SUCCESS_HUB_TOOL_STATUSES.includes(tool.status));
    assert.ok(DENTIST_SUCCESS_HUB_CATEGORIES.includes(tool.category));
    assert.ok(tool.keywords.length > 0);
    assert.ok(tool.relatedTools.length > 0);
  }
});

test("tool registry detects duplicate slugs", () => {
  const duplicate = [
    DENTIST_SUCCESS_HUB_TOOLS[0],
    { ...DENTIST_SUCCESS_HUB_TOOLS[1], slug: DENTIST_SUCCESS_HUB_TOOLS[0].slug },
  ];

  const result = validateToolRegistry(duplicate);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("duplicate slug")));
});

test("tool registry detects duplicate titles", () => {
  const duplicate = [
    DENTIST_SUCCESS_HUB_TOOLS[0],
    { ...DENTIST_SUCCESS_HUB_TOOLS[1], title: DENTIST_SUCCESS_HUB_TOOLS[0].title },
  ];

  const result = validateToolRegistry(duplicate);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("duplicate title")));
});

test("tool registry validation catches malformed definitions", () => {
  const malformed = [
    {
      ...DENTIST_SUCCESS_HUB_TOOLS[0],
      slug: "Bad Slug",
      category: "Unsupported",
      toolType: "spreadsheet",
      status: "planned",
      relatedTools: ["missing-tool"],
    } as unknown as DentistSuccessHubTool,
  ];

  const result = validateToolRegistry(malformed);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("URL-safe kebab-case")));
  assert.ok(result.errors.some((error) => error.includes("unsupported category")));
  assert.ok(result.errors.some((error) => error.includes("unsupported toolType")));
  assert.ok(result.errors.some((error) => error.includes("unsupported status")));
  assert.ok(result.errors.some((error) => error.includes("unknown related tool")));
});

test("tool registry lookup helpers return deterministic slices", () => {
  assert.equal(getDentistSuccessHubTool("no-show-cost-calculator")?.status, "active");
  assert.equal(getDentistSuccessHubTool("not-a-real-tool"), undefined);

  const aiTools = getDentistSuccessHubToolsByCategory("AI");
  assert.deepEqual(
    aiTools.map((tool) => tool.slug),
    DENTIST_SUCCESS_HUB_TOOLS.filter((tool) => tool.category === "AI").map((tool) => tool.slug)
  );
});

test("tool registry does not create routes or tool implementations", () => {
  for (const tool of DENTIST_SUCCESS_HUB_TOOLS) {
    assert.equal(
      existsSync(new URL(`../src/app/dentist-success-hub/${tool.slug}/page.tsx`, import.meta.url)),
      false
    );
    assert.equal(existsSync(new URL(`../src/app/tools/${tool.slug}/page.tsx`, import.meta.url)), false);
  }
});
