import Link from "next/link";

import {
  ToolBreadcrumb,
  ToolCard,
  ToolFooterCTA,
  ToolGrid,
  ToolHeader,
  ToolHero,
  ToolJsonLd,
  ToolPage,
} from "@/components/tool-engine";
import {
  DENTIST_SUCCESS_HUB_TOOLS,
  DENTIST_SUCCESS_HUB_TOOL_STATUSES,
  DENTIST_SUCCESS_HUB_TOOL_TYPES,
  getDentistSuccessHubActiveTools,
  getDentistSuccessHubCategorySummaries,
  getDentistSuccessHubEstimatedTimes,
  getDentistSuccessHubStatusLabel,
  searchDentistSuccessHubTools,
  toDentistSuccessHubToolCard,
  type DentistSuccessHubToolSearchFilters,
} from "@/lib/dentist-success-hub-tools";
import {
  getDentistSuccessHubToolsMetadata,
  getDentistSuccessHubToolsSeoSchemas,
} from "@/lib/dentist-success-hub-seo";

export const metadata = getDentistSuccessHubToolsMetadata();

type ToolsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const estimatedTimes = getDentistSuccessHubEstimatedTimes();
const categorySummaries = getDentistSuccessHubCategorySummaries();

export default async function DentistSuccessHubToolsPage({ searchParams }: ToolsPageProps) {
  const params = searchParams ? await searchParams : {};
  const filters = filtersFromSearchParams(params);
  const filteredTools = searchDentistSuccessHubTools(filters);
  const hasFilters = Object.values(filters).some(Boolean);
  const activeTools = getDentistSuccessHubActiveTools();
  const activeCount = activeTools.length;
  const comingSoonCount = DENTIST_SUCCESS_HUB_TOOLS.filter(
    (tool) => tool.status === "coming-soon"
  ).length;

  return (
    <ToolPage>
      <ToolJsonLd data={getDentistSuccessHubToolsSeoSchemas()} />

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
            {categorySummaries.map((category) => (
              <Link
                key={category.name}
                href={`#${category.anchor}`}
                className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold text-slate-800 hover:border-cyan-300 hover:text-cyan-800"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </ToolHero>

      {activeTools.length > 0 && (
        <section id="active-tools" className="border-t border-slate-200 py-10">
          <ToolHeader
            eyebrow="Available now"
            title="Active tools"
            description="Active tools are automatically pulled from the shared Dentist Success Hub registry."
          />
          <ToolGrid className="mt-8">
            {activeTools.map((tool) => (
              <ToolCard key={tool.slug} {...toDentistSuccessHubToolCard(tool)} />
            ))}
          </ToolGrid>
        </section>
      )}

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
          categorySummaries.map((category) => {
            const tools = filteredTools.filter((tool) => tool.category === category.name);
            if (tools.length === 0) return null;

            return (
              <section key={category.name} id={category.anchor} className="pt-10">
                <ToolHeader
                  eyebrow={`${tools.length} tools`}
                  title={category.name}
                  description={category.description}
                />
                <ToolGrid className="mt-8">
                  {tools.map((tool) => (
                    <ToolCard key={tool.slug} {...toDentistSuccessHubToolCard(tool)} />
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
            {categorySummaries.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
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
                {getDentistSuccessHubStatusLabel(status)}
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


function titleCase(value: string): string {
  return value
    .split("-")
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
