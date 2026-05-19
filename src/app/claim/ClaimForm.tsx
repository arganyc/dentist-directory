"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function ClaimForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 700));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
            aria-hidden
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-900">Submission received</h2>
        <p className="mt-2 text-slate-700">
          Thanks — we'll verify your information and reach out within one business day. Watch for an
          email from <span className="font-semibold">verify@smilefinder.example</span>.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Submit another listing →
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your Name" name="name" placeholder="Dr. Jane Smith" required />
        <Field label="Email" name="email" type="email" placeholder="you@practice.com" required />
        <Field label="Phone" name="phone" type="tel" placeholder="(555) 555-0100" required />
        <Field
          label="NPI Number"
          name="npi"
          placeholder="10-digit NPI"
          pattern="\d{10}"
          required
          hint="National Provider Identifier — used to verify your license"
        />
      </div>

      <Field label="Practice Name" name="practiceName" placeholder="Smith Family Dental" required />

      <Field
        label="Practice Address"
        name="address"
        placeholder="123 Main St, City, State, ZIP"
        required
      />

      <Field
        label="Website"
        name="website"
        type="url"
        placeholder="https://yourpractice.com"
        hint="Optional — shown as a link on your profile. Free listings get rel=&quot;nofollow&quot;; upgrade to remove."
      />

      <div>
        <label className="block text-sm font-semibold text-slate-800">
          Message <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          name="message"
          rows={4}
          placeholder="Tell us about your practice or note an existing listing you want to claim."
          className="mt-1.5 block w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex items-start gap-2 rounded-md bg-blue-50 px-3 py-2 ring-1 ring-blue-100">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="consent" className="text-xs text-slate-700">
          I confirm I am authorized to claim this practice listing and the information provided is
          accurate.
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {status === "submitting" ? "Submitting…" : "Submit Listing"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  pattern,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  pattern?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-slate-800">
        {label} {required && <span className="text-blue-600">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        pattern={pattern}
        className="mt-1.5 block w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
