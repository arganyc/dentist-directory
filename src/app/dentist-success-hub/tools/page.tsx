import type { Metadata } from "next";
import Link from "next/link";

import {
  ToolBreadcrumb,
  ToolCard,
  ToolFooterCTA,
  ToolGrid,
  ToolHeader,
  ToolHero,
  ToolPage,
} from "@/components/tool-engine";
import {
  DENTIST_SUCCESS_HUB_CATEGORIES,
  DENTIST_SUCCESS_HUB_TOOLS,
  DENTIST_SUCCESS_HUB_TOOL_STATUSES,
  DENTIST_SUCCESS_HUB_TOOL_TYPES,
  getDentistSuccessHubEstimatedTimes,
  searchDentistSuccessHubTools,
  type DentistSuccessHubToolSearchFilters,
  type DentistSuccessHubTool,
} from "@/lib/dentist-success-hub-tools";

const SITE_URL = "https://www.usdentistsdirectory.com";
const PAGE_URL = `${SITE_URL}/dentist-success-hub/tools`;

export const metadata: Metadata = {
  title: "Free Dental Practice Tools - Dentist Success Hub",
  description:
    "Explore Dentist Success Hub tools for dental marketing, operations, finance, AI, SEO, and practice profile visibility.",
  alternates: {
    canonical: "/dentist-success-hub/tools",
  },
  openGraph: {
    title: "Free Dental Practice Tools - Dentist Success Hub",
    description:
      "Browse free and upcoming Dentist Success Hub tools for growing a stronger dental practice.",
    url: PAGE_URL,
    siteName: "USDentistsDirectory",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Dental Practice Tools",
    description: "Explore Dentist Success Hub tools for practice growth, operations, SEO, and AI.",
  },
};

const statusLabels: Record<DentistSuccessHubTool["status"], string> = {
  active: "Active",
  beta: "Beta",
  "coming-soon": "Coming Soon",
  premium: "Premium",
};

const toolListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Dentist Success Hub Tools",
  itemListElement: DENTIST_SUCCESS_HUB_TOOLS.map((tool, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: tool.title,
    url: `${PAGE_URL}/${tool.slug}`,
  })),
};

type ToolsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const estimatedTimes = getDentistSuccessHubEstimatedTimes();

export default async function DentistSuccessHubToolsPage({ searchParams }: ToolsPageProps) {
  const params = searchParams ? await searchParams : {};
  const filters = filtersFromSearchParams(params);
  const filteredTools = searchDentistSuccessHubTools(filters);
  const hasFilters = Object.values(filters).some(Boolean);
  const activeCount = DENTIST_SUCCESS_HUB_TOOLS.filter((tool) => tool.status === "active").length;
  const comingSoonCount = DENTIST_SUCCESS_HUB_TOOLS.filter(
    (tool) => tool.status === "coming-soon"
  ).length;

  return (
    <ToolPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolListJsonLd) }}
      />

      <ToolBreadcrumb
        items={[
          { label: "Dentist Success Hub", href: "/dentist-success-hub" },
          { label: "Tools" },
        ]}
      />

      <ToolHero
        eyebrow="Tool directory"
        title="Explore every Dentist Success Hub tool"
        description="Browse practical workspaces for marketing, operations, finance, AI, local visibility, and practice growth. Tool pages are generated from the shared registry."
        primaryAction={{ label: "Search tools", href: "#tool-results" }}
        secondaryAction={{ label: "Claim your practice", href: "/claim" }}
        meta={
          <div className="flex flex-wrap gap-3">
            <span>{DENTIST_SUCCESS_HUB_TOOLS.length} total tools</span>
            <span aria-hidden>|</span>
            <span>{activeCount} active</span>
            <span aria-hidden>|</span>
            <span>{comingSoonCount} coming soon</span>
          </div>
        }
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-cyan-700">Built from one registry</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {DENTIST_SUCCESS_HUB_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`#${categorySlug(category)}`}
                className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold text-slate-800 hover:border-cyan-300 hover:text-cyan-800"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </ToolHero>

      <section id="tool-results" className="border-t border-slate-200 py-10">
        <ToolHeader
          eyebrow="Search and filter"
          title="Find the right practice tool"
          description="Search by title, keyword, or description, then filter by category, status, type, and estimated time."
        />
        <ToolSearchForm filters={filters} />
      </section>

      <section className="border-t border-slate-200 py-10">
        <ToolHeader
          eyebrow={`${filteredTools.length} ${filteredTools.length === 1 ? "result" : "results"}`}
          title={hasFilters ? "Matching tools" : "All tools"}
          description={
            hasFilters
              ? "Results are filtered directly from the Dentist Success Hub tool registry."
              : "Every card below is generated from the Dentist Success Hub tool registry."
          }
          actions={
            hasFilters ? (
              <Link href="/dentist-success-hub/tools" className="text-sm font-bold text-cyan-700 hover:text-cyan-900">
                Clear filters
              </Link>
            ) : null
          }
        />

        {filteredTools.length === 0 ? (
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-xl font-bold text-slate-950">No matching tools</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Try a broader search or clear one of the filters.
            </p>
          </div>
        ) : (
          DENTIST_SUCCESS_HUB_CATEGORIES.map((category) => {
            const tools = filteredTools.filter((tool) => tool.category === category);
            if (tools.length === 0) return null;

            return (
              <section key={category} id={categorySlug(category)} className="pt-10">
                <ToolHeader
                  eyebrow={`${tools.length} tools`}
                  title={category}
                  description={categoryDescription(category)}
                />
                <ToolGrid className="mt-8">
                  {tools.map((tool) => (
                    <ToolCard key={tool.slug} {...toolCardFromRegistry(tool)} />
                  ))}
                </ToolGrid>
              </section>
            );
          })
        )}
      </section>

      <ToolFooterCTA
        title="Build your practice workspace one tool at a time"
        description="Start with a free tool, then connect your practice listing when you are ready to save reports inside DentistOS."
        primaryAction={{ label: "Create free account", href: "/login" }}
        secondaryAction={{ label: "Claim your listing", href: "/claim" }}
      />
    </ToolPage>
  );
}

function ToolSearchForm({ filters }: { filters: DentistSuccessHubToolSearchFilters }) {
  return (
    <form action="/dentist-success-hub/tools" className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
        <label className="text-sm font-bold text-slate-800">
          Search
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            type="search"
            name="q"
            defaultValue={filters.query}
            placeholder="SEO, no-show, reviews"
          />
        </label>

        <label className="text-sm font-bold text-slate-800">
          Category
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            name="category"
            defaultValue={filters.category}
          >
            <option value="">All</option>
            {DENTIST_SUCCESS_HUB_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-bold text-slate-800">
          Status
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            name="status"
            defaultValue={filters.status}
          >
            <option value="">All</option>
            {DENTIST_SUCCESS_HUB_TOOL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-bold text-slate-800">
          Type
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            name="toolType"
            defaultValue={filters.toolType}
          >
            <option value="">All</option>
            {DENTIST_SUCCESS_HUB_TOOL_TYPES.map((toolType) => (
              <option key={toolType} value={toolType}>
                {titleCase(toolType)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-bold text-slate-800">
          Time
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            name="estimatedTime"
            defaultValue={filters.estimatedTime}
          >
            <option value="">All</option>
            {estimatedTimes.map((estimatedTime) => (
              <option key={estimatedTime} value={estimatedTime}>
                {estimatedTime}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-800"
          >
            Apply
          </button>
        </div>
      </div>
    </form>
  );
}

function filtersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): DentistSuccessHubToolSearchFilters {
  return {
    query: firstParam(searchParams.q),
    category: firstParam(searchParams.category),
    status: firstParam(searchParams.status),
    toolType: firstParam(searchParams.toolType),
    estimatedTime: firstParam(searchParams.estimatedTime),
  };
}

function firstParam(value: string | string[] | undefined): string | undefined {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = rawValue?.trim();
  return normalizedValue || undefined;
}

function toolCardFromRegistry(tool: DentistSuccessHubTool) {
  return {
    title: tool.title,
    description: tool.shortDescription,
    href: `/dentist-success-hub/tools/${tool.slug}`,
    eyebrow: tool.category,
    badge: statusLabels[tool.status],
    footer: tool.estimatedTime,
  };
}

function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function categoryDescription(category: DentistSuccessHubTool["category"]): string {
  const descriptions: Record<DentistSuccessHubTool["category"], string> = {
    Marketing: "Plan patient acquisition, local search visibility, campaigns, and review growth.",
    Financial: "Model production, collections, patient value, margins, and long-term practice economics.",
    Operations: "Evaluate capacity, scheduling, recall, no-shows, and operatory performance.",
    AI: "Preview future AI workflows for dental content, communication, and office productivity.",
    "Profile & Visibility": "Improve directory accuracy, completeness, trust signals, and listing ownership.",
    Resources: "Use practical analysis tools and guidance built for dental teams.",
  };

  return descriptions[category];
}

function titleCase(value: string): string {
  return value
    .split("-")
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
