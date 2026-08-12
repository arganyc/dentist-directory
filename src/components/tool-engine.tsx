import Link from "next/link";
import type { ReactNode } from "react";

export type ToolAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type ToolBreadcrumbItem = {
  label: string;
  href?: string;
};

export type ToolCardItem = {
  title: string;
  description: string;
  href?: string;
  eyebrow?: string;
  badge?: string;
  icon?: ReactNode;
  footer?: ReactNode;
};

export type ToolSidebarSection = {
  title: string;
  content: ReactNode;
};

export type ToolFAQItem = {
  question: string;
  answer: ReactNode;
};

export type ToolRecommendation = {
  title: string;
  description: string;
  href?: string;
  badge?: string;
};

type WithChildren = {
  children: ReactNode;
  className?: string;
};

export function ToolPage({ children, className = "" }: WithChildren) {
  return (
    <div className={cx("bg-white text-slate-950", className)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

export function ToolBreadcrumb({ items }: { items: ToolBreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden>/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="font-medium text-slate-600 hover:text-cyan-700">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function ToolHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  meta,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: ToolAction;
  secondaryAction?: ToolAction;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
      <div>
        {eyebrow && (
          <p className="text-sm font-bold uppercase text-cyan-700">{eyebrow}</p>
        )}
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] text-slate-950 sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
        {(primaryAction || secondaryAction) && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {primaryAction && <ActionLink action={{ ...primaryAction, variant: "primary" }} />}
            {secondaryAction && <ActionLink action={{ ...secondaryAction, variant: "secondary" }} />}
          </div>
        )}
        {meta && <div className="mt-6 text-sm text-slate-600">{meta}</div>}
      </div>
      {children && <div>{children}</div>}
    </section>
  );
}

export function ToolHeader({
  eyebrow,
  title,
  description,
  actions,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <header className={cx("max-w-3xl", align === "center" ? "mx-auto text-center" : "")}>
      {eyebrow && <p className="text-sm font-bold uppercase text-cyan-700">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>}
      {actions && <div className="mt-6">{actions}</div>}
    </header>
  );
}

export function ToolCard({
  title,
  description,
  href,
  eyebrow,
  badge,
  icon,
  footer,
}: ToolCardItem) {
  const content = (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow && <p className="text-xs font-bold uppercase text-cyan-700">{eyebrow}</p>}
          <h3 className="mt-2 text-lg font-bold leading-6 text-slate-950">{title}</h3>
        </div>
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{description}</p>
      {(badge || footer) && (
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {badge && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {badge}
            </span>
          )}
          {footer && <div className="text-xs font-semibold text-slate-500">{footer}</div>}
        </div>
      )}
    </article>
  );

  return href ? (
    <Link href={href} className="block h-full focus:outline-none focus:ring-2 focus:ring-cyan-500">
      {content}
    </Link>
  ) : (
    content
  );
}

export function ToolGrid({
  children,
  columns = "three",
  className = "",
}: WithChildren & {
  columns?: "two" | "three" | "four";
}) {
  const gridClass =
    columns === "two"
      ? "md:grid-cols-2"
      : columns === "four"
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "md:grid-cols-2 lg:grid-cols-3";

  return <div className={cx("grid gap-5", gridClass, className)}>{children}</div>;
}

export function ToolSidebar({
  sections,
  className = "",
}: {
  sections: ToolSidebarSection[];
  className?: string;
}) {
  if (sections.length === 0) return null;

  return (
    <aside className={cx("space-y-4", className)}>
      {sections.map((section) => (
        <section key={section.title} className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-950">{section.title}</h2>
          <div className="mt-3 text-sm leading-6 text-slate-600">{section.content}</div>
        </section>
      ))}
    </aside>
  );
}

export function ToolFAQ({
  items,
  title = "Frequently asked questions",
}: {
  items: ToolFAQItem[];
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="py-10">
      <ToolHeader title={title} align="center" />
      <div className="mx-auto mt-8 max-w-4xl divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {items.map((item) => (
          <details key={item.question} className="group p-5">
            <summary className="cursor-pointer list-none text-base font-bold text-slate-950">
              <span className="flex items-center justify-between gap-4">
                {item.question}
                <span className="text-cyan-700 transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <div className="mt-4 text-sm leading-6 text-slate-600">{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function ToolDisclaimer({
  title = "Important note",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
      <h2 className="font-bold">{title}</h2>
      <div className="mt-2">{children}</div>
    </aside>
  );
}

export function ToolRecommendations({
  items,
  title = "Recommended next",
}: {
  items: ToolRecommendation[];
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="py-10">
      <ToolHeader title={title} />
      <ToolGrid className="mt-6">
        {items.map((item) => (
          <ToolCard
            key={item.title}
            title={item.title}
            description={item.description}
            href={item.href}
            badge={item.badge}
          />
        ))}
      </ToolGrid>
    </section>
  );
}

export function ToolFooterCTA({
  title,
  description,
  primaryAction,
  secondaryAction,
}: {
  title: string;
  description: string;
  primaryAction: ToolAction;
  secondaryAction?: ToolAction;
}) {
  return (
    <section className="rounded-lg bg-slate-950 px-6 py-10 text-center text-white sm:px-10">
      <h2 className="text-3xl font-semibold leading-tight">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <ActionLink action={{ ...primaryAction, variant: "primary" }} inverse />
        {secondaryAction && <ActionLink action={{ ...secondaryAction, variant: "secondary" }} inverse />}
      </div>
    </section>
  );
}

function ActionLink({ action, inverse = false }: { action: ToolAction; inverse?: boolean }) {
  const isPrimary = action.variant !== "secondary";
  return (
    <Link
      href={action.href}
      className={cx(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2",
        isPrimary && !inverse ? "bg-slate-950 text-white hover:bg-cyan-800" : "",
        !isPrimary && !inverse
          ? "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          : "",
        isPrimary && inverse ? "bg-white text-slate-950 hover:bg-cyan-50" : "",
        !isPrimary && inverse ? "border border-white/30 text-white hover:bg-white/10" : ""
      )}
    >
      {action.label}
    </Link>
  );
}

function cx(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
