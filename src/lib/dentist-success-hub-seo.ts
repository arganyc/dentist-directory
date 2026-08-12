import type { Metadata } from "next";

import {
  DENTIST_SUCCESS_HUB_CATEGORIES,
  DENTIST_SUCCESS_HUB_TOOLS,
  type DentistSuccessHubTool,
} from "./dentist-success-hub-tools";

const SITE_URL = "https://www.usdentistsdirectory.com";
const SITE_NAME = "USDentistsDirectory";
const TOOLS_PATH = "/dentist-success-hub/tools";

type JsonLdObject = Record<string, unknown>;

export function getDentistSuccessHubToolsMetadata(): Metadata {
  const title = `Dentist Success Hub Tools - ${DENTIST_SUCCESS_HUB_TOOLS.length} Dental Practice Tools`;
  const description = `Explore Dentist Success Hub tools for ${formatList(
    DENTIST_SUCCESS_HUB_CATEGORIES
  )}, all generated from the shared tool registry.`;

  return createMetadata({
    title,
    description,
    canonicalPath: TOOLS_PATH,
    keywords: DENTIST_SUCCESS_HUB_CATEGORIES,
  });
}

export function getDentistSuccessHubToolMetadata(tool: DentistSuccessHubTool): Metadata {
  return createMetadata({
    title: tool.seoTitle,
    description: tool.seoDescription,
    canonicalPath: getToolPath(tool),
    keywords: tool.keywords,
  });
}

export function getDentistSuccessHubToolsBreadcrumbSchema(): JsonLdObject {
  return createBreadcrumbSchema([
    { name: "Dentist Success Hub", path: "/dentist-success-hub" },
    { name: "Tools", path: TOOLS_PATH },
  ]);
}

export function getDentistSuccessHubToolBreadcrumbSchema(tool: DentistSuccessHubTool): JsonLdObject {
  return createBreadcrumbSchema([
    { name: "Dentist Success Hub", path: "/dentist-success-hub" },
    { name: "Tools", path: TOOLS_PATH },
    { name: tool.title, path: getToolPath(tool) },
  ]);
}

export function getDentistSuccessHubToolListSchema(
  tools: readonly DentistSuccessHubTool[] = DENTIST_SUCCESS_HUB_TOOLS
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Dentist Success Hub Tools",
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.title,
      url: absoluteUrl(getToolPath(tool)),
    })),
  };
}

export function getDentistSuccessHubToolSoftwareSchema(tool: DentistSuccessHubTool): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: tool.seoDescription,
    url: absoluteUrl(getToolPath(tool)),
    keywords: tool.keywords.join(", "),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability:
        tool.status === "coming-soon"
          ? "https://schema.org/PreOrder"
          : "https://schema.org/InStock",
    },
  };
}

export function getDentistSuccessHubToolSeoSchemas(tool: DentistSuccessHubTool): JsonLdObject[] {
  return [
    getDentistSuccessHubToolBreadcrumbSchema(tool),
    getDentistSuccessHubToolSoftwareSchema(tool),
  ];
}

export function getDentistSuccessHubToolsSeoSchemas(): JsonLdObject[] {
  return [
    getDentistSuccessHubToolsBreadcrumbSchema(),
    getDentistSuccessHubToolListSchema(),
  ];
}

function createMetadata({
  title,
  description,
  canonicalPath,
  keywords,
}: {
  title: string;
  description: string;
  canonicalPath: string;
  keywords: readonly string[];
}): Metadata {
  const url = absoluteUrl(canonicalPath);

  return {
    title,
    description,
    keywords: [...keywords],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function createBreadcrumbSchema(items: Array<{ name: string; path: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function getToolPath(tool: DentistSuccessHubTool): string {
  return `${TOOLS_PATH}/${tool.slug}`;
}

function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

function formatList(values: readonly string[]): string {
  const normalizedValues = values.map((value) => value.toLowerCase());
  if (normalizedValues.length <= 1) return normalizedValues.join("");

  return `${normalizedValues.slice(0, -1).join(", ")}, and ${normalizedValues.at(-1)}`;
}
