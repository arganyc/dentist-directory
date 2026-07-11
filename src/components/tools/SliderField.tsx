"use client";

export type FieldConfig<K extends string> = {
  key: K;
  label: string;
  prefix?: string;
  suffix?: string;
  min: number;
  max: number;
  step: number;
};

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default function SliderField<K extends string>({
  field,
  value,
  onChange,
}: {
  field: FieldConfig<K>;
  value: number;
  onChange: (key: K, rawValue: string, field: FieldConfig<K>) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800">
        <span>{field.label}</span>
        <span className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-blue-700">
          {field.prefix}
          {formatNumber(value)}
          {field.suffix}
        </span>
      </span>
      <input
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(event) => onChange(field.key, event.target.value, field)}
        className="mt-3 w-full accent-blue-600"
      />
      <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
        {field.prefix ? <span className="text-sm text-slate-500">{field.prefix}</span> : null}
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(event) => onChange(field.key, event.target.value, field)}
          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
        />
        {field.suffix ? <span className="text-sm text-slate-500">{field.suffix.trim()}</span> : null}
      </div>
    </label>
  );
}
