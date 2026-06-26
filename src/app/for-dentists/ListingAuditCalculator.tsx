"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const auditItems = [
  { id: "hours", label: "Current office hours" },
  { id: "services", label: "Complete service list" },
  { id: "insurance", label: "Accepted insurance" },
  { id: "photos", label: "Practice photos" },
  { id: "booking", label: "Booking or call-to-action link" },
  { id: "emergency", label: "Emergency availability" },
  { id: "reviews", label: "Review and trust signals" },
];

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function readNumber(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value < 0) return fallback;
  return value;
}

export default function ListingAuditCalculator() {
  const [city, setCity] = useState("your city");
  const [monthlySearches, setMonthlySearches] = useState(2400);
  const [newPatientValue, setNewPatientValue] = useState(850);
  const [profileCaptureRate, setProfileCaptureRate] = useState(0.008);
  const [checked, setChecked] = useState<Record<string, boolean>>({
    hours: true,
    services: false,
    insurance: false,
    photos: false,
    booking: false,
    emergency: false,
    reviews: false,
  });

  const results = useMemo(() => {
    const completeItems = auditItems.filter((item) => checked[item.id]).length;
    const score = Math.round((completeItems / auditItems.length) * 100);
    const missingItems = auditItems.length - completeItems;
    const profileGap = Math.max(0.15, 1 - score / 100);
    const monthlyMissedPatients = Math.max(
      1,
      Math.round(monthlySearches * profileCaptureRate * profileGap),
    );
    const annualMissedRevenue = monthlyMissedPatients * newPatientValue * 12;
    const improvedPatients = Math.max(1, Math.round(monthlyMissedPatients * 0.45));

    return {
      score,
      missingItems,
      monthlyMissedPatients,
      annualMissedRevenue,
      improvedPatients,
      profileGap,
    };
  }, [checked, monthlySearches, newPatientValue, profileCaptureRate]);

  const claimUrl = `/claim?city=${encodeURIComponent(city.trim() || "your area")}`;

  return (
    <section id="listing-audit" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
              Free growth tool
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              See what an incomplete listing may be costing your practice.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Run a quick listing audit, estimate missed new-patient revenue, then claim your
              profile to fix the highest-value gaps first.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="text-3xl font-extrabold text-blue-700">{results.score}%</div>
                <p className="mt-1 text-sm font-semibold text-slate-700">Listing score</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="text-3xl font-extrabold text-blue-700">
                  {results.monthlyMissedPatients}
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  missed patients/mo.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="text-3xl font-extrabold text-blue-700">
                  {currency(results.annualMissedRevenue)}
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  estimated annual gap
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
              A claimed profile can add booking links, emergency availability, insurance details,
              photos, and services that help high-intent patients decide to call.
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">City or market</span>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">
                  Monthly local searches
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={monthlySearches}
                  onChange={(event) =>
                    setMonthlySearches(readNumber(event.target.valueAsNumber, 2400))
                  }
                  className="mt-1.5 block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">
                  New patient value
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={newPatientValue}
                  onChange={(event) =>
                    setNewPatientValue(readNumber(event.target.valueAsNumber, 850))
                  }
                  className="mt-1.5 block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">
                  Search-to-patient rate
                </span>
                <select
                  value={profileCaptureRate}
                  onChange={(event) => setProfileCaptureRate(Number(event.target.value))}
                  className="mt-1.5 block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value={0.004}>Conservative - 0.4%</option>
                  <option value={0.008}>Typical - 0.8%</option>
                  <option value={0.015}>Aggressive - 1.5%</option>
                </select>
              </label>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-800">
                What does your current listing include?
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {auditItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={checked[item.id]}
                      onChange={(event) =>
                        setChecked((current) => ({
                          ...current,
                          [item.id]: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-blue-600 p-5 text-white">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                Opportunity estimate
              </p>
              <p className="mt-2 text-2xl font-extrabold">
                Claiming could help recover about {results.improvedPatients} patients per month.
              </p>
              <p className="mt-2 text-sm text-blue-100">
                Your profile is missing {results.missingItems} of {auditItems.length} conversion
                signals. That leaves an estimated {percent(results.profileGap)} of profile
                opportunity unaddressed.
              </p>
              <Link
                href={claimUrl}
                className="mt-5 inline-flex w-full justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:w-auto"
              >
                Claim your free listing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
