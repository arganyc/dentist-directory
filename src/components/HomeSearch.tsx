"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeSearch() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (name.trim()) params.set("name", name.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/dentists${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-blue-100 sm:flex-row sm:items-stretch sm:gap-1"
    >
      <div className="flex flex-1 items-center gap-2.5 px-2 sm:px-3">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 shrink-0 text-blue-500"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.08 3.08a1 1 0 11-1.42 1.42l-3.08-3.08A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dentist or practice name"
          className="w-full bg-transparent py-3 text-base text-slate-900 placeholder-slate-400 outline-none"
          aria-label="Dentist or practice name"
        />
      </div>

      <div className="hidden w-px self-stretch bg-blue-100 sm:block" aria-hidden />

      <div className="flex flex-1 items-center gap-2.5 px-2 sm:px-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0 text-blue-500"
          aria-hidden
        >
          <path d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        <input
          type="search"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or state"
          className="w-full bg-transparent py-3 text-base text-slate-900 placeholder-slate-400 outline-none"
          aria-label="City or state"
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
