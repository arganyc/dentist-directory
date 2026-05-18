"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("location", query.trim());
    router.push(`/dentists${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-blue-100 sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-3 px-3 sm:px-4">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 shrink-0 text-blue-500"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z"
          />
          <circle cx="12" cy="10" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city or state (e.g. Chicago, TX, Boston)"
          className="w-full bg-transparent py-3 text-base text-slate-900 placeholder-slate-400 outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-blue-700"
      >
        Find Dentists
      </button>
    </form>
  );
}
