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
  getDentistSuccessHubToolsByCategory,
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

export default function DentistSuccessHubToolsPage() {
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
        primaryAction={{ label: "Start with active tools", href: "#active-tools" }}
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

      <section id="active-tools" className="border-t border-slate-200 py-10">
        <ToolHeader
          eyebrow="Available now"
          title="Active tools"
          description="These tools are available as public placeholders or safe workflows. Calculator logic is intentionally not implemented in this routing phase."
        />
        <ToolGrid className="mt-8">
          {DENTIST_SUCCESS_HUB_TOOLS.filter((tool) => tool.status === "active").map((tool) => (
            <ToolCard key={tool.slug} {...toolCardFromRegistry(tool)} />
          ))}
        </ToolGrid>
      </section>

      {DENTIST_SUCCESS_HUB_CATEGORIES.map((category) => {
        const tools = getDentistSuccessHubToolsByCategory(category);
        return (
          <section
            key={category}
            id={categorySlug(category)}
            className="border-t border-slate-200 py-10"
          >
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
      })}

      <ToolFooterCTA
        title="Build your practice workspace one tool at a time"
        description="Start with a free tool, then connect your practice listing when you are ready to save reports inside DentistOS."
        primaryAction={{ label: "Create free account", href: "/login" }}
        secondaryAction={{ label: "Claim your listing", href: "/claim" }}
      />
    </ToolPage>
  );
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
