"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type CalculatorInputProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  type?: "number" | "range";
};

export type ResultCardTone = "default" | "primary" | "success" | "warning";

export function CalculatorShell({
  title,
  description,
  children,
  sidebar,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  sidebar?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      {(title || description) && (
        <header className="border-b border-slate-200 p-5 sm:p-6">
          {title && <h2 className="text-2xl font-bold text-slate-950">{title}</h2>}
          {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
        </header>
      )}
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">{children}</div>
        {sidebar && <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">{sidebar}</aside>}
      </div>
    </section>
  );
}

export function CalculatorSection({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
      {(title || description) && (
        <header className="mb-5">
          {title && <h3 className="text-lg font-bold text-slate-950">{title}</h3>}
          {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

export function CalculatorInput({
  id,
  label,
  value,
  onChange,
  helperText,
  min,
  max,
  step,
  prefix,
  suffix,
  type = "number",
}: CalculatorInputProps) {
  const displayValue = Number.isFinite(value) ? value : 0;

  return (
    <label htmlFor={id} className="block">
      <span className="flex items-center justify-between gap-3 text-sm font-bold text-slate-800">
        <span>{label}</span>
        <span className="shrink-0 rounded-md bg-white px-2 py-1 text-cyan-700 ring-1 ring-slate-200">
          {prefix}
          {formatCompactNumber(displayValue)}
          {suffix}
        </span>
      </span>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
        {prefix && <span className="text-sm text-slate-500">{prefix}</span>}
        <input
          id={id}
          type={type}
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none accent-cyan-700"
          aria-describedby={helperText ? `${id}-help` : undefined}
        />
        {suffix && <span className="text-sm text-slate-500">{suffix.trim()}</span>}
      </div>
      {helperText && (
        <p id={`${id}-help`} className="mt-2 text-xs leading-5 text-slate-500">
          {helperText}
        </p>
      )}
    </label>
  );
}

export function NumberInput(props: Omit<CalculatorInputProps, "type" | "prefix" | "suffix">) {
  return <CalculatorInput {...props} type="number" />;
}

export function CurrencyInput(props: Omit<CalculatorInputProps, "type" | "prefix">) {
  return <CalculatorInput {...props} type="number" prefix="$" />;
}

export function PercentageInput(props: Omit<CalculatorInputProps, "type" | "suffix">) {
  return <CalculatorInput {...props} type="number" suffix="%" />;
}

export function SliderInput(props: Omit<CalculatorInputProps, "type">) {
  return <CalculatorInput {...props} type="range" />;
}

export function ResultsGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function ResultCard({
  label,
  value,
  description,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  description?: string;
  tone?: ResultCardTone;
}) {
  return (
    <article className={cardClassForTone(tone)}>
      <p className={tone === "primary" ? "text-xs font-bold uppercase text-cyan-100" : "text-xs font-bold uppercase text-slate-500"}>
        {label}
      </p>
      <div className={tone === "primary" ? "mt-2 text-3xl font-bold text-white" : "mt-2 text-2xl font-bold text-slate-950"}>
        {value}
      </div>
      {description && (
        <p className={tone === "primary" ? "mt-2 text-sm leading-6 text-cyan-100" : "mt-2 text-sm leading-6 text-slate-600"}>
          {description}
        </p>
      )}
    </article>
  );
}

export function BenchmarkCard({
  title,
  value,
  benchmark,
  description,
}: {
  title: string;
  value: ReactNode;
  benchmark: string;
  description?: string;
}) {
  return (
    <article className="rounded-lg border border-cyan-200 bg-cyan-50 p-5">
      <p className="text-sm font-bold uppercase text-cyan-800">{benchmark}</p>
      <h3 className="mt-2 text-lg font-bold text-slate-950">{title}</h3>
      <div className="mt-3 text-2xl font-bold text-cyan-900">{value}</div>
      {description && <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>}
    </article>
  );
}

export function InsightCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="font-bold text-slate-950">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-slate-600">{children}</div>
    </article>
  );
}

export function RecommendationCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
      <h3 className="font-bold text-emerald-950">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-emerald-900">{children}</div>
    </article>
  );
}

export function WarningCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-amber-200 bg-amber-50 p-5">
      <h3 className="font-bold text-amber-950">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-amber-900">{children}</div>
    </article>
  );
}

export function CalculatorActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 sm:flex-row">{children}</div>;
}

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}

export function ShareButton({
  label = "Copy link",
  url,
}: {
  label?: string;
  url?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        const shareUrl = url ?? window.location.href;
        void navigator.clipboard?.writeText(shareUrl);
      }}
      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}

export function ClaimListingCTA({
  href = "/claim",
  title = "Claim your listing",
  description = "Connect this work to your public profile and future DentistOS reporting.",
  label = "Claim listing",
}: {
  href?: string;
  title?: string;
  description?: string;
  label?: string;
}) {
  return (
    <aside className="rounded-lg bg-slate-950 p-5 text-white">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-50"
      >
        {label}
      </Link>
    </aside>
  );
}

export function formatCalculatorCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCalculatorNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

function cardClassForTone(tone: ResultCardTone): string {
  if (tone === "primary") return "rounded-lg bg-cyan-800 p-5 text-white shadow-sm";
  if (tone === "success") return "rounded-lg border border-emerald-200 bg-emerald-50 p-5";
  if (tone === "warning") return "rounded-lg border border-amber-200 bg-amber-50 p-5";
  return "rounded-lg border border-slate-200 bg-white p-5";
}
