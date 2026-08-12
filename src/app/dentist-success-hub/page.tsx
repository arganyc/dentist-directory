import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ToolJsonLd } from "@/components/tool-engine";
import {
  getDentistSuccessHubCategorySummaries,
  getDentistSuccessHubFeaturedTools,
  getDentistSuccessHubStatusLabel,
  getDentistSuccessHubToolHref,
} from "@/lib/dentist-success-hub-tools";

const SITE_URL = "https://www.usdentistsdirectory.com";
const PAGE_URL = `${SITE_URL}/dentist-success-hub`;

export const metadata: Metadata = {
  title: "Dentist Success Hub - Free Growth Tools for Dental Practices",
  description:
    "Dentist Success Hub gives dental practices free tools for marketing, finance, operations, SEO, AI content, and profile visibility inside USDentistsDirectory.",
  alternates: {
    canonical: "/dentist-success-hub",
  },
  openGraph: {
    title: "Dentist Success Hub - Free Growth Tools for Dental Practices",
    description:
      "Free dental practice tools for marketing, finance, operations, SEO, AI content, and profile visibility.",
    url: PAGE_URL,
    siteName: "USDentistsDirectory",
    type: "website",
    images: [
      {
        url: "/blog/images/nationwide-dental-directory-hero.png",
        width: 1200,
        height: 630,
        alt: "Dentist Success Hub practice growth workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dentist Success Hub - Free Growth Tools",
    description:
      "Explore free tools for dental marketing, operations, finance, SEO, AI, and practice visibility.",
    images: ["/blog/images/nationwide-dental-directory-hero.png"],
  },
};

const FEATURES = [
  {
    title: "Know exactly where your practice is losing money",
    body: "Turn everyday operational inputs into clear monthly and annual opportunity estimates.",
    icon: "chart",
  },
  {
    title: "Improve local search visibility",
    body: "See what is missing from your online presence before patients choose another office.",
    icon: "search",
  },
  {
    title: "Understand marketing ROI",
    body: "Connect spend, leads, appointments, and production into a practical growth picture.",
    icon: "target",
  },
  {
    title: "Track practice performance",
    body: "Build a repeatable rhythm for reviewing the numbers that actually move the practice.",
    icon: "pulse",
  },
  {
    title: "Use AI to save hours every week",
    body: "Prepare better first drafts for profile copy, posts, emails, and patient communication.",
    icon: "spark",
  },
  {
    title: "Grow with confidence",
    body: "Move from scattered guesses to focused next steps for your team and listing.",
    icon: "shield",
  },
] as const;

const FAQS = [
  {
    question: "Is Dentist Success Hub free for dental practices?",
    answer:
      "Yes. Phase 1 is designed around free tools for dental practices, with no credit card required to explore the hub.",
  },
  {
    question: "Is Dentist Success Hub the same as DentistOS?",
    answer:
      "Dentist Success Hub is the public growth hub inside USDentistsDirectory. DentistOS is the authenticated practice workspace where saved reports, listing management, and future growth tracking will live.",
  },
  {
    question: "Do I need to claim my listing to use the tools?",
    answer:
      "Public tools can be explored freely. Claiming a listing connects your practice to DentistOS so future reports and listing improvements can be saved to the right workspace.",
  },
  {
    question: "Will these tools replace professional advice?",
    answer:
      "No. The tools are designed to support practice planning and decision-making, but they do not replace financial, legal, clinical, or marketing advice from qualified professionals.",
  },
] as const;

const HOW_IT_WORKS = [
  "Choose a free tool",
  "Receive actionable insights",
  "Save reports in DentistOS",
  "Grow your practice",
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Dentist Success Hub",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: PAGE_URL,
      description:
        "A free practice growth hub for dental marketing, finance, operations, SEO, AI content, and profile visibility tools.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: {
        "@type": "Organization",
        name: "USDentistsDirectory",
        url: SITE_URL,
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export default function DentistSuccessHubPage() {
  const categories = getDentistSuccessHubCategorySummaries();
  const featuredTools = getDentistSuccessHubFeaturedTools();

  return (
    <div className="bg-white text-slate-950">
      <ToolJsonLd data={jsonLd} />

      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <Image
          src="/blog/images/nationwide-dental-directory-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover opacity-[0.34]"
        />
        <div className="absolute inset-0 -z-10 bg-slate-950/70" aria-hidden />
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Dentist Success Hub
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              Everything you need to grow a stronger dental practice.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              Free tools for marketing, practice growth, operations, finance, SEO, and AI.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#featured-tools"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Explore Free Tools
              </Link>
              <Link
                href="/claim"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Claim Your Practice
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-200">
              <span>{"\u2713"} Free forever</span>
              <span>{"\u2713"} Built for dental practices</span>
              <span>{"\u2713"} No credit card required</span>
            </div>
          </div>

          <div className="mb-6 hidden self-end lg:block">
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <div className="rounded-lg bg-white p-5 text-slate-950 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
                      Practice snapshot
                    </p>
                    <p className="mt-1 text-xl font-bold">Growth workspace</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Free
                  </span>
                </div>
                <div className="mt-5 grid gap-3">
                  {[
                    ["Lost production", "$8,420", "No-show analyzer"],
                    ["Visibility gaps", "7", "Profile score"],
                    ["Saved hours", "5.5", "AI drafts"],
                  ].map(([label, value, caption]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-600">{label}</p>
                        <p className="text-2xl font-bold">{value}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{caption}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-lg bg-slate-950 p-4 text-white">
                  <p className="text-sm font-semibold">Next best action</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Complete your profile, then run the Local SEO Audit to find the fastest
                    visibility wins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Why Dentists Love It"
            title="Practical growth clarity without another bloated system."
            body="Dentist Success Hub is designed for owners and teams who need useful answers quickly, then want those answers saved inside a real practice workspace."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg"
              >
                <Icon name={feature.icon} className="h-11 w-11 rounded-lg bg-cyan-50 p-2.5 text-cyan-700" />
                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Explore the Hub"
            title="A complete growth library, organized around how dental practices actually work."
            body="Start with one focused workspace, then build a history of reports and improvements as DentistOS expands."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <Icon
                    name={category.icon}
                    className="h-12 w-12 rounded-lg bg-slate-950 p-3 text-white transition group-hover:bg-cyan-700"
                  />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {category.count} tools
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-950">
                  {category.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
                <p className="mt-5 text-sm font-bold text-cyan-700">Explore category</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="featured-tools" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Featured Tools"
            title="Featured practice workspaces from the hub."
            body="These cards are generated from the shared Tool Registry so titles, categories, timing, status, and descriptions stay connected across the product."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {featuredTools.map((tool) => (
              <Link
                key={tool.slug}
                href={getDentistSuccessHubToolHref(tool)}
                className="flex min-h-64 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                    {tool.category}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Free
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold leading-6 text-slate-950">
                  {tool.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{tool.shortDescription}</p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold">
                  <span className="text-slate-500">{tool.estimatedTime}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    {getDentistSuccessHubStatusLabel(tool.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="How It Works"
            title="Simple enough to start today. Structured enough to become your operating rhythm."
            body=""
            inverted
          />
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {HOW_IT_WORKS.map((step, index) => (
              <div key={step} className="relative rounded-lg border border-white/10 bg-white/10 p-6">
                <span className="text-sm font-bold text-cyan-200">0{index + 1}</span>
                <h3 className="mt-4 text-xl font-bold">{step}</h3>
                {index < HOW_IT_WORKS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950 md:flex"
                  >
                    -&gt;
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">
              Meet DentistOS
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">
              Dentist Success Hub is becoming a complete operating system for dental practices.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The public hub is the front door. DentistOS is the secure workspace where practices
              will save reports, manage listings, track growth, and turn recommendations into
              repeatable work.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Saved reports",
                "Dashboard",
                "Listing management",
                "Growth tracking",
                "AI recommendations",
                "Practice analytics",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
                    {"\u2713"}
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="mt-9 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Create Free Account
            </Link>
          </div>
          <div className="relative">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-2xl">
              <div className="rounded-lg bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      DentistOS
                    </p>
                    <p className="mt-1 text-xl font-bold">Practice command center</p>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
                  <div className="space-y-3">
                    {["Dashboard", "My Listing", "Success Hub", "Reports"].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                          index === 2
                            ? "bg-cyan-700 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-slate-950 p-5 text-white">
                    <p className="text-sm font-bold text-cyan-200">Saved report</p>
                    <h3 className="mt-3 text-2xl font-bold">
                      Local visibility plan
                    </h3>
                    <div className="mt-6 space-y-3">
                      {[72, 54, 86].map((width, index) => (
                        <div key={width}>
                          <div className="h-2 rounded-full bg-white/10">
                            <div
                              className="h-2 rounded-full bg-cyan-300"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            {["Profile completeness", "Review momentum", "Search readiness"][index]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Frequently Asked Questions"
            title="Useful answers for practice owners and managers."
            body=""
          />
          <div className="mt-10 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {FAQS.map((item) => (
              <details key={item.question} className="group p-6">
                <summary className="cursor-pointer list-none text-base font-bold text-slate-950">
                  <span className="flex items-center justify-between gap-4">
                    {item.question}
                    <span className="text-cyan-700 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-6 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cyan-700 px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold sm:text-4xl">
          Ready to grow your practice?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-cyan-50">
          Claim your listing today and connect your practice to the foundation DentistOS is built
          on.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/claim"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-cyan-800 shadow-sm transition hover:bg-cyan-50"
          >
            Claim your listing today
          </Link>
          <Link
            href="/dentistos/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Open DentistOS
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
  inverted = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  inverted?: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className={`text-sm font-bold uppercase tracking-[0.18em] ${inverted ? "text-cyan-200" : "text-cyan-700"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-4 text-3xl font-semibold sm:text-5xl ${inverted ? "text-white" : "text-slate-950"}`}>
        {title}
      </h2>
      {body && (
        <p className={`mt-5 text-lg leading-8 ${inverted ? "text-slate-300" : "text-slate-600"}`}>
          {body}
        </p>
      )}
    </div>
  );
}

function Icon({ name, className }: { name: string; className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {name === "chart" && <path d="M4 19h16M6 16V9m6 7V5m6 11v-4" />}
      {name === "search" && (
        <>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </>
      )}
      {name === "target" && (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        </>
      )}
      {name === "pulse" && <path d="M4 13h4l2-7 4 12 2-5h4" />}
      {name === "spark" && <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zm6 13 .8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16z" />}
      {name === "shield" && <path d="M12 3 20 7v5c0 5-3.4 8.5-8 9-4.6-.5-8-4-8-9V7l8-4zm-3 9 2 2 4-4" />}
      {name === "wallet" && <path d="M4 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4V7zm0 0V5h13m1 8h2" />}
      {name === "flow" && <path d="M6 6h5v5H6V6zm7 7h5v5h-5v-5zM8.5 11v2.5H13" />}
      {name === "profile" && <path d="M5 20a7 7 0 0 1 14 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />}
      {name === "book" && <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 0V4zm3 0v13" />}
    </svg>
  );
}
