import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ToolBreadcrumb,
  ToolCard,
  ToolDisclaimer,
  ToolFAQ,
  ToolFooterCTA,
  ToolGrid,
  ToolHeader,
  ToolHero,
  ToolPage,
  ToolRecommendations,
  ToolSidebar,
  type ToolFAQItem,
} from "@/components/tool-engine";
import {
  DENTIST_SUCCESS_HUB_TOOLS,
  getDentistSuccessHubTool,
  type DentistSuccessHubTool,
} from "@/lib/dentist-success-hub-tools";

const SITE_URL = "https://www.usdentistsdirectory.com";

type RouteProps = PageProps<"/dentist-success-hub/tools/[slug]">;

export function generateStaticParams() {
  return DENTIST_SUCCESS_HUB_TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getDentistSuccessHubTool(slug);

  if (!tool) {
    return {
      title: "Dentist Success Hub Tool Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const path = `/dentist-success-hub/tools/${tool.slug}`;

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDescription,
      url: `${SITE_URL}${path}`,
      siteName: "USDentistsDirectory",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.seoTitle,
      description: tool.seoDescription,
    },
  };
}

export default async function DentistSuccessHubToolDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const tool = getDentistSuccessHubTool(slug);

  if (!tool) notFound();

  const relatedTools = tool.relatedTools
    .map((relatedSlug) => getDentistSuccessHubTool(relatedSlug))
    .filter((relatedTool): relatedTool is DentistSuccessHubTool => Boolean(relatedTool));

  const toolJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: tool.seoDescription,
    url: `${SITE_URL}/dentist-success-hub/tools/${tool.slug}`,
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

  return (
    <ToolPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
      />

      <ToolBreadcrumb
        items={[
          { label: "Dentist Success Hub", href: "/dentist-success-hub" },
          { label: "Tools", href: "/dentist-success-hub/tools" },
          { label: tool.title },
        ]}
      />

      <ToolHero
        eyebrow={`${tool.category} ${tool.toolType}`}
        title={tool.title}
        description={tool.shortDescription}
        primaryAction={primaryActionForTool(tool)}
        secondaryAction={{ label: "Back to tools", href: "/dentist-success-hub/tools" }}
        meta={
          <div className="flex flex-wrap gap-3">
            <span>{statusLabel(tool.status)}</span>
            <span aria-hidden>|</span>
            <span>{tool.estimatedTime}</span>
            <span aria-hidden>|</span>
            <span>{tool.badge}</span>
          </div>
        }
      >
        <ToolStatusPanel tool={tool} />
      </ToolHero>

      <div id="workspace" className="grid gap-8 border-t border-slate-200 py-10 lg:grid-cols-[1fr_320px]">
        <main className="space-y-8">
          {tool.status === "active" && <ActiveToolPlaceholder tool={tool} />}
          {tool.status === "coming-soon" && <ComingSoonPreview tool={tool} />}
          {tool.status === "premium" && <PremiumPreview tool={tool} />}
          {tool.status === "beta" && <BetaPreview tool={tool} />}

          <ToolDisclaimer>
            This page is a product workspace shell. It does not provide clinical, legal, financial, or tax advice,
            and this routing phase does not implement calculator or generator logic.
          </ToolDisclaimer>
        </main>

        <ToolSidebar
          sections={[
            {
              title: "Tool details",
              content: (
                <dl className="space-y-3">
                  <div>
                    <dt className="font-bold text-slate-900">Category</dt>
                    <dd>{tool.category}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-900">Type</dt>
                    <dd>{tool.toolType}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-900">Status</dt>
                    <dd>{statusLabel(tool.status)}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-900">Estimated time</dt>
                    <dd>{tool.estimatedTime}</dd>
                  </div>
                </dl>
              ),
            },
            {
              title: "Keywords",
              content: (
                <div className="flex flex-wrap gap-2">
                  {tool.keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                      {keyword}
                    </span>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>

      <ToolRecommendations
        title="Related tools"
        items={relatedTools.map((relatedTool) => ({
          title: relatedTool.title,
          description: relatedTool.shortDescription,
          href: `/dentist-success-hub/tools/${relatedTool.slug}`,
          badge: statusLabel(relatedTool.status),
        }))}
      />

      <ToolFAQ items={faqForTool(tool)} />

      <ToolFooterCTA
        title="Ready to connect this work to your practice?"
        description="Claim your listing or create a free account to prepare for saved reports inside DentistOS."
        primaryAction={{ label: "Create free account", href: "/login" }}
        secondaryAction={{ label: "Claim your practice", href: "/claim" }}
      />
    </ToolPage>
  );
}

function ToolStatusPanel({ tool }: { tool: DentistSuccessHubTool }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <p className="text-sm font-bold uppercase text-cyan-700">{statusLabel(tool.status)}</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-950">{tool.badge} workspace</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        This route is powered by the Dentist Success Hub registry, so metadata, SEO copy, status, and related tools
        stay consistent as the platform grows.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-white p-4">
          <p className="font-bold text-slate-950">Category</p>
          <p className="mt-1 text-slate-600">{tool.category}</p>
        </div>
        <div className="rounded-lg bg-white p-4">
          <p className="font-bold text-slate-950">Time</p>
          <p className="mt-1 text-slate-600">{tool.estimatedTime}</p>
        </div>
      </div>
    </div>
  );
}

function ActiveToolPlaceholder({ tool }: { tool: DentistSuccessHubTool }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <ToolHeader
        eyebrow="Placeholder form"
        title="Start this workspace"
        description="The route is available now. Calculation, audit, generator, assistant, report, and workflow execution will be added in later product phases."
      />
      <form aria-label={`${tool.title} placeholder form`} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-800">
          Practice name
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            name="practiceName"
            placeholder="Example Dental"
            readOnly
          />
        </label>
        <label className="text-sm font-bold text-slate-800">
          Practice website
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            name="website"
            placeholder="https://example.com"
            readOnly
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="button"
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white"
            aria-disabled="true"
          >
            Preview only
          </button>
        </div>
      </form>
    </section>
  );
}

function ComingSoonPreview({ tool }: { tool: DentistSuccessHubTool }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <ToolHeader
        eyebrow="Coming soon"
        title={`${tool.title} preview`}
        description="This workspace is listed publicly now so dentists can understand what is planned before the interactive tool is released."
      />
      <ToolGrid columns="two" className="mt-6">
        <ToolCard
          title="Inputs"
          description="The final tool will collect only the practice data needed for this workflow."
          badge="Planned"
        />
        <ToolCard
          title="Insights"
          description="The final tool will return practical next steps that can be saved inside DentistOS."
          badge="Planned"
        />
      </ToolGrid>
    </section>
  );
}

function PremiumPreview({ tool }: { tool: DentistSuccessHubTool }) {
  return (
    <section className="rounded-lg border border-cyan-200 bg-cyan-50 p-6 shadow-sm">
      <ToolHeader
        eyebrow="Premium workspace"
        title={`${tool.title} will require an upgraded plan`}
        description="This page previews a future premium DentistOS workspace. No billing or premium access control is implemented in this phase."
      />
      <Link
        href="/login"
        className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-800"
      >
        Create free account
      </Link>
    </section>
  );
}

function BetaPreview({ tool }: { tool: DentistSuccessHubTool }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <ToolHeader
        eyebrow="Beta"
        title={`${tool.title} beta preview`}
        description="This workspace is prepared for controlled beta access in a future phase."
      />
    </section>
  );
}

function primaryActionForTool(tool: DentistSuccessHubTool) {
  if (tool.status === "premium") return { label: "Create free account", href: "/login" };
  if (tool.status === "coming-soon") {
    return { label: "Browse active tools", href: "/dentist-success-hub/tools#active-tools" };
  }
  return { label: "Preview workspace", href: "#workspace" };
}

function statusLabel(status: DentistSuccessHubTool["status"]): string {
  const labels: Record<DentistSuccessHubTool["status"], string> = {
    active: "Active",
    beta: "Beta",
    "coming-soon": "Coming Soon",
    premium: "Premium",
  };

  return labels[status];
}

function faqForTool(tool: DentistSuccessHubTool): ToolFAQItem[] {
  return [
    {
      question: `Is ${tool.title} available today?`,
      answer:
        tool.status === "active"
          ? "The route and placeholder workspace are available now. Full tool execution is intentionally deferred."
          : "This page is a preview. Full tool execution is intentionally deferred.",
    },
    {
      question: "Will this save results in DentistOS?",
      answer: "Saved reports are planned for the DentistOS platform, but no result storage is added in this routing phase.",
    },
    {
      question: "Does this change my public listing?",
      answer:
        "No. These tool pages do not modify public dentist profiles, claims, publishing data, or DentistOS account records.",
    },
  ];
}
