"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 500));
    setStatus("success");
    setEmail("");
  }

  return (
    <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Dental health tips, in your inbox
            </h2>
            <p className="mt-3 text-lg text-blue-100">
              Once-a-month tips on oral health, new specialists in your area, and exclusive
              promotions from SmileFinder dentists. No spam — unsubscribe anytime.
            </p>
          </div>

          <div>
            {status === "success" ? (
              <div className="rounded-xl bg-white/95 p-6 text-center shadow-xl">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mt-3 font-bold text-slate-900">You're subscribed!</p>
                <p className="mt-1 text-sm text-slate-600">Check your inbox for a welcome email.</p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-xl bg-white/95 p-2 shadow-xl backdrop-blur sm:flex sm:items-center sm:gap-2"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-lg bg-transparent px-4 py-3 text-base text-slate-900 placeholder-slate-400 outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-2 w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-blue-400 sm:mt-0 sm:w-auto"
                >
                  {status === "submitting" ? "Subscribing…" : "Subscribe"}
                </button>
              </form>
            )}
            <p className="mt-3 text-xs text-blue-200">
              By subscribing, you agree to receive marketing emails from SmileFinder.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
