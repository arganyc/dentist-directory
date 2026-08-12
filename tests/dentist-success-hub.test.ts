import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { getDentistSuccessHubFeaturedTools } from "../src/lib/dentist-success-hub-tools.ts";

const pagePath = new URL("../src/app/dentist-success-hub/page.tsx", import.meta.url);
const pageSource = readFileSync(pagePath, "utf8");
const navbarSource = readFileSync(new URL("../src/components/Navbar.tsx", import.meta.url), "utf8");
const sitemapSource = readFileSync(
  new URL("../src/app/api/sitemap-static/route.ts", import.meta.url),
  "utf8"
);
const publishingRouteSource = readFileSync(
  new URL("../src/app/api/dentistos/listings/route.ts", import.meta.url),
  "utf8"
);

test("Dentist Success Hub route exists with SaaS landing-page sections", () => {
  assert.equal(existsSync(pagePath), true);
  assert.match(pageSource, /Dentist Success Hub/);
  assert.match(pageSource, /Everything you need to grow a stronger dental practice/);
  assert.match(pageSource, /Why Dentists Love It/);
  assert.match(pageSource, /Explore the Hub/);
  assert.match(pageSource, /Featured Tools/);
  assert.match(pageSource, /How It Works/);
  assert.match(pageSource, /Meet DentistOS/);
  assert.match(pageSource, /Frequently Asked Questions/);
  assert.match(pageSource, /Ready to grow your practice/);
});

test("Dentist Success Hub includes requested CTAs and trust notes", () => {
  assert.match(pageSource, /Explore Free Tools/);
  assert.match(pageSource, /Claim Your Practice/);
  assert.match(pageSource, /Free forever/);
  assert.match(pageSource, /Built for dental practices/);
  assert.match(pageSource, /No credit card required/);
  assert.match(pageSource, /Create Free Account/);
});

test("Dentist Success Hub presents featured tools from the registry", () => {
  assert.match(pageSource, /getDentistSuccessHubFeaturedTools/);
  assert.match(pageSource, /getDentistSuccessHubToolHref/);
  assert.doesNotMatch(pageSource, /const FEATURED_TOOLS/);
  assert.equal(getDentistSuccessHubFeaturedTools().length, 10);
  assert.ok(getDentistSuccessHubFeaturedTools().every((tool) => tool.title && tool.shortDescription));
});

test("Dentist Success Hub is wired into navigation sitemap and SEO metadata", () => {
  assert.match(navbarSource, /href="\/dentist-success-hub"/);
  assert.match(navbarSource, /Dentist Success Hub/);
  assert.match(sitemapSource, /\/dentist-success-hub/);
  assert.match(pageSource, /canonical: "\/dentist-success-hub"/);
  assert.match(pageSource, /"@type": "FAQPage"/);
  assert.match(pageSource, /"@type": "SoftwareApplication"/);
  assert.match(pageSource, /nationwide-dental-directory-hero\.png/);
});

test("Dentist Success Hub does not alter the DentistOS publishing API route", () => {
  assert.match(publishingRouteSource, /DENTISTOS_PUBLISH_TOKEN/);
  assert.match(publishingRouteSource, /createDentistOSListingsPostHandler/);
  assert.doesNotMatch(pageSource, /DENTISTOS_PUBLISH_TOKEN|upsertDentistOSListing|getSql/);
});
