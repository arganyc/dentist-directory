import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  DENTIST_SUCCESS_HUB_CATEGORIES,
  DENTIST_SUCCESS_HUB_TOOLS,
  getDentistSuccessHubTool,
  getDentistSuccessHubToolsByCategory,
} from "../src/lib/dentist-success-hub-tools.ts";

const toolsDirectoryRoute = new URL("../src/app/dentist-success-hub/tools/page.tsx", import.meta.url);
const toolDetailRoute = new URL("../src/app/dentist-success-hub/tools/[slug]/page.tsx", import.meta.url);

test("Dentist Success Hub tool routes exist", () => {
  assert.equal(existsSync(toolsDirectoryRoute), true);
  assert.equal(existsSync(toolDetailRoute), true);
});

test("tool directory route is generated from the registry", () => {
  const source = readFileSync(toolsDirectoryRoute, "utf8");

  assert.match(source, /DENTIST_SUCCESS_HUB_TOOLS/);
  assert.match(source, /DENTIST_SUCCESS_HUB_CATEGORIES/);
  assert.match(source, /searchDentistSuccessHubTools/);
  assert.match(source, /getDentistSuccessHubEstimatedTimes/);
  assert.match(source, /ToolGrid/);
  assert.match(source, /ToolCard/);

  for (const category of DENTIST_SUCCESS_HUB_CATEGORIES) {
    assert.ok(getDentistSuccessHubToolsByCategory(category).length > 0);
  }
});

test("tool directory route exposes registry-backed search and filters", () => {
  const source = readFileSync(toolsDirectoryRoute, "utf8");

  assert.match(source, /name="q"/);
  assert.match(source, /name="category"/);
  assert.match(source, /name="status"/);
  assert.match(source, /name="toolType"/);
  assert.match(source, /name="estimatedTime"/);
  assert.match(source, /filtersFromSearchParams/);
  assert.match(source, /filteredTools/);
});

test("tool detail route loads metadata from registry", () => {
  const source = readFileSync(toolDetailRoute, "utf8");

  assert.match(source, /generateStaticParams/);
  assert.match(source, /generateMetadata/);
  assert.match(source, /getDentistSuccessHubTool/);
  assert.match(source, /notFound/);
});

test("tool detail route covers active coming-soon and premium states", () => {
  const source = readFileSync(toolDetailRoute, "utf8");
  const statuses = new Set(DENTIST_SUCCESS_HUB_TOOLS.map((tool) => tool.status));

  assert.equal(statuses.has("active"), true);
  assert.equal(statuses.has("coming-soon"), true);
  assert.equal(statuses.has("premium"), true);
  assert.match(source, /ActiveToolPlaceholder/);
  assert.match(source, /ComingSoonPreview/);
  assert.match(source, /PremiumPreview/);
});

test("tool routes are deterministic for every registry slug", () => {
  for (const tool of DENTIST_SUCCESS_HUB_TOOLS) {
    const resolvedTool = getDentistSuccessHubTool(tool.slug);

    assert.equal(resolvedTool?.slug, tool.slug);
    assert.equal(
      `/dentist-success-hub/tools/${tool.slug}`,
      `/dentist-success-hub/tools/${resolvedTool?.slug}`
    );
  }
});

test("tool routes do not introduce execution or protected-system dependencies", () => {
  const directorySource = readFileSync(toolsDirectoryRoute, "utf8");
  const detailSource = readFileSync(toolDetailRoute, "utf8");
  const combinedSource = `${directorySource}\n${detailSource}`;

  assert.doesNotMatch(combinedSource, /fetch\s*\(/);
  assert.doesNotMatch(combinedSource, /getSql/);
  assert.doesNotMatch(combinedSource, /DENTISTOS_PUBLISH_TOKEN/);
  assert.doesNotMatch(combinedSource, /getCurrentUser|requireUser/);
  assert.doesNotMatch(combinedSource, /from ["'].*claims/);
  assert.doesNotMatch(combinedSource, /from ["'].*publishing/);
  assert.doesNotMatch(combinedSource, /dentistos\/listings/);
});
