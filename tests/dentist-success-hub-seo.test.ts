import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getDentistSuccessHubTool } from "../src/lib/dentist-success-hub-tools.ts";
import {
  getDentistSuccessHubToolBreadcrumbSchema,
  getDentistSuccessHubToolListSchema,
  getDentistSuccessHubToolMetadata,
  getDentistSuccessHubToolSeoSchemas,
  getDentistSuccessHubToolsBreadcrumbSchema,
  getDentistSuccessHubToolsMetadata,
  getDentistSuccessHubToolsSeoSchemas,
  getDentistSuccessHubToolSoftwareSchema,
} from "../src/lib/dentist-success-hub-seo.ts";

const toolsDirectoryRoute = new URL("../src/app/dentist-success-hub/tools/page.tsx", import.meta.url);
const toolDetailRoute = new URL("../src/app/dentist-success-hub/tools/[slug]/page.tsx", import.meta.url);

test("tool detail metadata is generated from registry fields", () => {
  const tool = getRequiredTool("local-seo-audit");
  const metadata = getDentistSuccessHubToolMetadata(tool);

  assert.equal(metadata.title, tool.seoTitle);
  assert.equal(metadata.description, tool.seoDescription);
  assert.deepEqual(metadata.keywords, tool.keywords);
  assert.deepEqual(metadata.alternates, {
    canonical: `/dentist-success-hub/tools/${tool.slug}`,
  });
  assert.deepEqual(metadata.openGraph, {
    title: tool.seoTitle,
    description: tool.seoDescription,
    url: `https://www.usdentistsdirectory.com/dentist-success-hub/tools/${tool.slug}`,
    siteName: "USDentistsDirectory",
    type: "website",
  });
  assert.deepEqual(metadata.twitter, {
    card: "summary_large_image",
    title: tool.seoTitle,
    description: tool.seoDescription,
  });
});

test("tool directory metadata is generated from registry collections", () => {
  const metadata = getDentistSuccessHubToolsMetadata();

  assert.match(String(metadata.title), /Dentist Success Hub Tools/);
  assert.match(String(metadata.title), /\d+ Dental Practice Tools/);
  assert.match(String(metadata.description), /marketing/);
  assert.match(String(metadata.description), /resources/);
  assert.deepEqual(metadata.alternates, {
    canonical: "/dentist-success-hub/tools",
  });
  assert.equal(metadata.openGraph?.siteName, "USDentistsDirectory");
  assert.equal(metadata.twitter?.card, "summary_large_image");
});

test("breadcrumb schema is generated for directory and tool pages", () => {
  const tool = getRequiredTool("no-show-cost-calculator");
  const directorySchema = getDentistSuccessHubToolsBreadcrumbSchema();
  const toolSchema = getDentistSuccessHubToolBreadcrumbSchema(tool);

  assert.equal(directorySchema["@type"], "BreadcrumbList");
  assert.deepEqual(
    (directorySchema.itemListElement as Array<{ name: string }>).map((item) => item.name),
    ["Dentist Success Hub", "Tools"]
  );

  assert.equal(toolSchema["@type"], "BreadcrumbList");
  assert.deepEqual(
    (toolSchema.itemListElement as Array<{ name: string }>).map((item) => item.name),
    ["Dentist Success Hub", "Tools", tool.title]
  );
});

test("software schema is generated from registry tool metadata", () => {
  const tool = getRequiredTool("practice-valuation-estimator");
  const schema = getDentistSuccessHubToolSoftwareSchema(tool);

  assert.equal(schema["@type"], "SoftwareApplication");
  assert.equal(schema.name, tool.title);
  assert.equal(schema.description, tool.seoDescription);
  assert.equal(schema.url, `https://www.usdentistsdirectory.com/dentist-success-hub/tools/${tool.slug}`);
  assert.equal(schema.keywords, tool.keywords.join(", "));
  assert.equal((schema.offers as { availability: string }).availability, "https://schema.org/InStock");
});

test("SEO schema bundles include expected structured data", () => {
  const tool = getRequiredTool("google-business-profile-audit");

  assert.deepEqual(
    getDentistSuccessHubToolSeoSchemas(tool).map((schema) => schema["@type"]),
    ["BreadcrumbList", "SoftwareApplication"]
  );
  assert.deepEqual(
    getDentistSuccessHubToolsSeoSchemas().map((schema) => schema["@type"]),
    ["BreadcrumbList", "ItemList"]
  );
  assert.equal(getDentistSuccessHubToolListSchema().itemListElement instanceof Array, true);
});

test("tool routes reuse shared SEO generation instead of duplicating metadata", () => {
  const directorySource = readFileSync(toolsDirectoryRoute, "utf8");
  const detailSource = readFileSync(toolDetailRoute, "utf8");

  assert.match(directorySource, /getDentistSuccessHubToolsMetadata/);
  assert.match(directorySource, /getDentistSuccessHubToolsSeoSchemas/);
  assert.match(detailSource, /getDentistSuccessHubToolMetadata/);
  assert.match(detailSource, /getDentistSuccessHubToolSeoSchemas/);
  assert.doesNotMatch(detailSource, /openGraph:\s*{/);
  assert.doesNotMatch(detailSource, /SoftwareApplication/);
});

function getRequiredTool(slug: string) {
  const tool = getDentistSuccessHubTool(slug);
  assert.ok(tool);
  return tool;
}
